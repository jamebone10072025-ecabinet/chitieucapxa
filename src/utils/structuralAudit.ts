import {
  CommuneProfile,
  TGTSPRow,
  HouseholdSurveyRecord,
} from "../types";
import {
  calculateTGTSPRow,
  calculateCommuneTNBQ,
  calculateHouseholdIncomeBreakdown,
  evaluateHouseholdMember,
} from "./calculations";

export type AuditIssueSeverity = "CRITICAL" | "WARNING" | "INFO";

export type AuditCategory =
  | "MACRO_MICRO_BALANCE"
  | "SECTOR_STRUCTURE"
  | "CALCULATION_METHOD"
  | "PROVINCIAL_CAP"
  | "HOUSEHOLD_SURVEY"
  | "PRICE_INDEX"
  | "STATISTICAL_SAMPLE";

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: AuditIssueSeverity;
  title: string;
  description: string;
  clause: string; // Căn cứ điều khoản QĐ 2545/QĐ-BTC
  currentValueText: string;
  expectedBenchmark: string;
  recommendation: string;
  canAutoFix: boolean;
  autoFixActionKey?: string;
  affectedRowId?: string;
  affectedHouseholdId?: string;
}

export interface AuditReportResult {
  auditScore: number; // 0 - 100
  healthStatus: "EXCELLENT" | "GOOD" | "NEEDS_ATTENTION" | "CRITICAL_RISK";
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: AuditIssue[];
  metrics: {
    totalTGTSPCurrent: number; // Triệu đồng
    totalTNBQAnnualMillion: number; // Triệu đồng/người/năm
    communeTotalIncomeEstimatedBillion: number; // Tỷ đồng
    ratioTNBQToTGTSP: number; // % (Tổng thu nhập dân cư / TGTSP xã)
    sector1Ratio: number; // % Nông lâm thủy sản
    sector2Ratio: number; // % Công nghiệp - Xây dựng
    sector3Ratio: number; // % Dịch vụ
    provincialExcessRatio: number; // % Tổng các xã / GTSX tỉnh
    sampleSizeAdequacy: number; // % mẫu đạt so với chuẩn
    outlierHouseholdsCount: number;
  };
  auditTimestamp: string;
}

/**
 * Thực hiện kiểm toán tự động toàn diện theo cấu trúc kinh tế và quy chuẩn QĐ 2545/QĐ-BTC
 */
export function runStructuralAudit(commune: CommuneProfile): AuditReportResult {
  const issues: AuditIssue[] = [];

  // 1. Tính toán số liệu cơ bản
  let totalTGTSPCurrent = 0;
  let totalTGTSPConstant = 0;
  let s1Current = 0; // Nông lâm thủy sản (A)
  let s2Current = 0; // Công nghiệp - Xây dựng (B, C, D, E, F)
  let s3Current = 0; // Dịch vụ (G đến U)

  (commune.tgtspRows || []).forEach((row) => {
    const calc = calculateTGTSPRow(row);
    totalTGTSPCurrent += calc.currentPriceValue;
    totalTGTSPConstant += calc.constantPriceValue;

    const code = (row.industryCode || "").trim().toUpperCase();
    if (code.startsWith("A")) {
      s1Current += calc.currentPriceValue;
    } else if (
      code.startsWith("B") ||
      code.startsWith("C") ||
      code.startsWith("D") ||
      code.startsWith("E") ||
      code.startsWith("F")
    ) {
      s2Current += calc.currentPriceValue;
    } else {
      s3Current += calc.currentPriceValue;
    }
  });

  const sector1Ratio =
    totalTGTSPCurrent > 0 ? (s1Current / totalTGTSPCurrent) * 100 : 0;
  const sector2Ratio =
    totalTGTSPCurrent > 0 ? (s2Current / totalTGTSPCurrent) * 100 : 0;
  const sector3Ratio =
    totalTGTSPCurrent > 0 ? (s3Current / totalTGTSPCurrent) * 100 : 0;

  // 2. Chỉ tiêu TNBQ
  const tnbqStats = calculateCommuneTNBQ(commune);
  const totalCommuneIncomeThousand =
    tnbqStats.averagePerCapitaAnnualThousandVND * (commune.totalPopulation || 0);
  const totalCommuneIncomeMillion = totalCommuneIncomeThousand / 1000;
  const communeTotalIncomeEstimatedBillion = totalCommuneIncomeMillion / 1000;

  const ratioTNBQToTGTSP =
    totalTGTSPCurrent > 0
      ? (totalCommuneIncomeMillion / totalTGTSPCurrent) * 100
      : 0;

  /* =========================================================================
   * KIỂM TOÁN NHÓM 1: CÂN ĐỐI VĨ MÔ & VI MÔ (TGTSP vs TNBQ)
   * ========================================================================= */
  if (totalTGTSPCurrent > 0 && commune.totalPopulation > 0) {
    // Nếu tổng thu nhập toàn xã > 115% TGTSP (Mất cân đối ngược)
    if (ratioTNBQToTGTSP > 115) {
      // Kiểm tra xem xã có thu từ lao động ngoài xã hoặc kiều hối không
      let hasExternalIncome = false;
      (commune.surveys || []).forEach((s) => {
        if ((s.otherIncomeItems || []).some((o) => o.amount > 0)) {
          hasExternalIncome = true;
        }
      });

      issues.push({
        id: "macro-excess-tnbq",
        category: "MACRO_MICRO_BALANCE",
        severity: hasExternalIncome ? "WARNING" : "CRITICAL",
        title: "Tổng thu nhập dân cư suy rộng vượt quá Tổng giá trị sản phẩm (TGTSP)",
        description: `Ước tính tổng thu nhập dân cư toàn xã (${communeTotalIncomeEstimatedBillion.toFixed(
          1
        )} tỷ đ) chiếm tới ${ratioTNBQToTGTSP.toFixed(
          1
        )}% TGTSP địa phương (${(totalTGTSPCurrent / 1000).toFixed(
          1
        )} tỷ đ). Trong kinh tế học thống kê, thu nhập dân cư là một phần của Giá trị tăng thêm (VA); nếu tỷ lệ > 100% thì phải có luồng tiền chuyển nhượng từ ngoài xã (lao động tại KCN, xuất khẩu lao động, kiều hối).`,
        clause: "QĐ 2545/QĐ-BTC Điều 2 (Quan hệ giữa TGTSP và Thu nhập dân cư)",
        currentValueText: `${ratioTNBQToTGTSP.toFixed(1)}% TGTSP`,
        expectedBenchmark: "35.0% - 80.0% TGTSP",
        recommendation:
          "Cần rà soát lại mẫu điều tra TNBQ có bị thiên lệch sang các hộ kinh doanh buôn bán lớn hay không, hoặc bổ sung thuyết minh nguồn thu lao động ngoại tỉnh vào Báo cáo kinh tế xã hội.",
        canAutoFix: false,
      });
    } else if (ratioTNBQToTGTSP < 20 && totalTGTSPCurrent > 50000) {
      issues.push({
        id: "macro-under-tnbq",
        category: "MACRO_MICRO_BALANCE",
        severity: "WARNING",
        title: "Tỷ số Thu nhập dân cư / TGTSP quá thấp bất thường",
        description: `Thu nhập dân cư toàn xã chỉ chiếm ${ratioTNBQToTGTSP.toFixed(
          1
        )}% TGTSP. Điều này chỉ hợp lý nếu xã có khu công nghiệp lớn do tập đoàn nước ngoài/ngoại tỉnh đầu tư chiếm phần lớn giá trị sản xuất nhưng tiền lương trả cho dân cư bản địa thấp.`,
        clause: "QĐ 2545/QĐ-BTC Phụ lục I & II",
        currentValueText: `${ratioTNBQToTGTSP.toFixed(1)}% TGTSP`,
        expectedBenchmark: "35.0% - 80.0% TGTSP",
        recommendation:
          "Kiểm tra lại xem các ngành sản xuất trong TGTSP có bị tính trùng hai lần (Double Counting) giữa nguyên liệu đầu vào và sản phẩm chế biến hay không.",
        canAutoFix: false,
      });
    }
  }

  /* =========================================================================
   * KIỂM TOÁN NHÓM 2: KHỐNG CHẾ TRẦN CẤP TỈNH (Mục 2.4.2 & 2.5 Phụ lục I)
   * ========================================================================= */
  const provincialExcessRatio =
    commune.provincialGTSX > 0
      ? (commune.sumAllCommunesTGTSP / commune.provincialGTSX) * 100
      : 100;

  if (commune.sumAllCommunesTGTSP > commune.provincialGTSX && commune.provincialGTSX > 0) {
    const excessBillion =
      (commune.sumAllCommunesTGTSP - commune.provincialGTSX) / 1000;
    const reductionCommuneMillion =
      (commune.sumAllCommunesTGTSP - commune.provincialGTSX) *
      (totalTGTSPCurrent / commune.sumAllCommunesTGTSP);

    issues.push({
      id: "provincial-cap-exceeded",
      category: "PROVINCIAL_CAP",
      severity: "CRITICAL",
      title: "Vi phạm quy tắc Khống chế trần: Tổng TGTSP các xã vượt GTSX toàn tỉnh",
      description: `Tổng TGTSP cộng dồn của tất cả các xã (${(
        commune.sumAllCommunesTGTSP / 1000
      ).toFixed(1)} tỷ đ) đã vượt trần GTSX được công bố của tỉnh (${(
        commune.provincialGTSX / 1000
      ).toFixed(1)} tỷ đ), vượt ${excessBillion.toFixed(1)} tỷ đ (${(
        provincialExcessRatio - 100
      ).toFixed(2)}%). Theo Mục 2.5 Phụ lục I, số liệu chưa thể nghiệm thu nếu chưa áp dụng hệ số điều chỉnh khống chế trần k.`,
      clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 1.3 & Mục 2.5 (Nguyên tắc khống chế trần)",
      currentValueText: `Vượt ${(provincialExcessRatio - 100).toFixed(2)}%`,
      expectedBenchmark: "Tổng các xã ≤ 100% GTSX tỉnh",
      recommendation: `Cần điều chỉnh giảm giá trị TGTSP của xã một lượng tương ứng ${reductionCommuneMillion.toFixed(
        1
      )} triệu đồng theo tỷ trọng đóng góp.`,
      canAutoFix: true,
      autoFixActionKey: "APPLY_PROVINCIAL_CAP",
    });
  }

  /* =========================================================================
   * KIỂM TOÁN NHÓM 3: PHƯƠNG PHÁP BIÊN SOẠN & CƠ CẤU NGÀNH (Phụ lục I)
   * ========================================================================= */
  (commune.tgtspRows || []).forEach((row) => {
    const code = (row.industryCode || "").trim().toUpperCase();

    // Kiểm tra ngành thương mại (Mã G)
    if (code.startsWith("G") && row.method === "DIRECT_TRADE_MARGIN") {
      const rev = row.revenue || 0;
      const cogs = row.costOfGoodsSold || 0;
      if (cogs >= rev && rev > 0) {
        issues.push({
          id: `trade-margin-negative-${row.id}`,
          category: "CALCULATION_METHOD",
          severity: "CRITICAL",
          title: `Ngành thương nghiệp '${row.industryName}': Giá vốn bán hàng ≥ Doanh thu`,
          description: `Thương mại bán buôn bán lẻ ghi nhận Giá vốn (${cogs.toLocaleString()} tr.đ) lớn hơn hoặc bằng Doanh thu (${rev.toLocaleString()} tr.đ). Thặng dư thương mại (Trade Margin) bị âm hoặc bằng 0, trái với bản chất tạo ra giá trị sản phẩm của dịch vụ lưu thông hàng hóa.`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 2.3 Công thức (3) (Thặng dư thương mại)",
          currentValueText: `Giá vốn = ${cogs} / DT = ${rev}`,
          expectedBenchmark: "Giá vốn thường bằng 65% - 85% Doanh thu",
          recommendation:
            "Kiểm tra lại Biểu 010.N; giá vốn chuyển bán không được vượt quá doanh thu thuần.",
          canAutoFix: true,
          autoFixActionKey: "FIX_TRADE_MARGIN",
          affectedRowId: row.id,
        });
      } else if (rev > 0 && (rev - cogs) / rev > 0.65) {
        issues.push({
          id: `trade-margin-too-high-${row.id}`,
          category: "CALCULATION_METHOD",
          severity: "WARNING",
          title: `Ngành thương nghiệp '${row.industryName}': Tỷ suất thặng dư thương mại cao bất thường`,
          description: `Tỷ suất thặng dư thương mại đạt ${(((rev - cogs) / rev) * 100).toFixed(
            1
          )}%, cao hơn mức chuẩn thương nghiệp hàng hóa thông thường (15% - 35%).`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 2.3",
          currentValueText: `${(((rev - cogs) / rev) * 100).toFixed(1)}%`,
          expectedBenchmark: "15.0% - 35.0%",
          recommendation: "Kiểm tra xem có lẫn doanh thu dịch vụ ăn uống hoặc vận tải vào không.",
          canAutoFix: false,
          affectedRowId: row.id,
        });
      }
    }

    // Kiểm tra ngành nông nghiệp (Mã A)
    if (code.startsWith("A") && row.method === "DIRECT_OUTPUT_PRICE") {
      if ((row.quantity || 0) <= 0 || (row.unitPrice || 0) <= 0) {
        issues.push({
          id: `agri-zero-quantity-${row.id}`,
          category: "CALCULATION_METHOD",
          severity: "CRITICAL",
          title: `Ngành nông nghiệp '${row.industryName}': Thiếu sản lượng hoặc đơn giá`,
          description: `Chỉ tiêu nông nghiệp tính theo phương pháp Sản lượng x Đơn giá nhưng sản lượng = ${row.quantity} hoặc đơn giá = ${row.unitPrice}.`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 2.3 Công thức (1)",
          currentValueText: `Q=${row.quantity || 0}, P=${row.unitPrice || 0}`,
          expectedBenchmark: "Sản lượng > 0 và Đơn giá > 0",
          recommendation: "Cập nhật sản lượng từ điều tra năng suất hoặc tra cứu giá thị trường.",
          canAutoFix: false,
          affectedRowId: row.id,
        });
      }
    }

    // Kiểm tra phân bổ gián tiếp
    if (row.method === "INDIRECT_ALLOCATED") {
      if ((row.allocatedRatio || 0) <= 0 || (row.allocatedRatio || 0) > 30) {
        issues.push({
          id: `allocated-ratio-abnormal-${row.id}`,
          category: "CALCULATION_METHOD",
          severity: "WARNING",
          title: `Chỉ tiêu phân bổ tỉnh '${row.industryName}': Tỷ trọng phân bổ bất thường`,
          description: `Tỷ trọng phân bổ cấp xã là ${row.allocatedRatio}%. Thông thường một xã chiếm không quá 0.1% - 15% GTSX ngành toàn tỉnh (trừ khi xã có nhà máy thủy điện/nhà máy điện mặt trời lớn).`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 2.4",
          currentValueText: `${row.allocatedRatio}%`,
          expectedBenchmark: "0.1% - 15.0%",
          recommendation: "Đối chiếu lại văn bản thông báo phân bổ của Cục Thống kê tỉnh.",
          canAutoFix: false,
          affectedRowId: row.id,
        });
      }
    }

    // Kiểm tra chỉ số giá (Price Index)
    if (row.priceIndex < 85 || row.priceIndex > 130) {
      issues.push({
        id: `price-index-outlier-${row.id}`,
        category: "PRICE_INDEX",
        severity: "WARNING",
        title: `Chỉ số giá ngành '${row.industryName}' nằm ngoài biên độ lạm phát bình thường`,
        description: `Chỉ số giá ghi nhận ${row.priceIndex}%. Biên độ thông thường so với kỳ gốc 2025 là từ 95% đến 115%.`,
        clause: "QĐ 2545/QĐ-BTC Phụ lục I Mục 2.2 (Tính giá so sánh)",
        currentValueText: `${row.priceIndex}%`,
        expectedBenchmark: "95.0% - 115.0%",
        recommendation: "Tra cứu chỉ số giá sản phẩm (PPI) của tỉnh để cập nhật.",
        canAutoFix: true,
        autoFixActionKey: "RESET_PRICE_INDEX",
        affectedRowId: row.id,
      });
    }
  });

  // Kiểm tra tính cân đối cơ cấu ngành
  if (totalTGTSPCurrent > 0) {
    if (sector1Ratio > 85 && commune.communeName.toLowerCase().includes("phường")) {
      issues.push({
        id: "sector-structure-urban",
        category: "SECTOR_STRUCTURE",
        severity: "WARNING",
        title: "Cơ cấu kinh tế của Phường đô thị có tỷ trọng Nông nghiệp quá cao",
        description: `Địa bàn là Phường đô thị nhưng tỷ trọng Nông lâm thủy sản chiếm tới ${sector1Ratio.toFixed(
          1
        )}% TGTSP. Cần kiểm tra lại các ngành Thương mại, Dịch vụ và Công nghiệp chế biến có bị bỏ sót không.`,
        clause: "QĐ 2545/QĐ-BTC Phụ lục I",
        currentValueText: `Nông nghiệp = ${sector1Ratio.toFixed(1)}%`,
        expectedBenchmark: "Phường đô thị: Nông nghiệp < 40%",
        recommendation: "Bổ sung rà soát khối hộ kinh doanh cá thể ngành G, H, I trên địa bàn.",
        canAutoFix: false,
      });
    }
  }

  /* =========================================================================
   * KIỂM TOÁN NHÓM 4: CẤU TRÚC PHIẾU ĐIỀU TRA HỘ MẪU (Phụ lục II)
   * ========================================================================= */
  const surveys = commune.surveys || [];
  let unverifiedCapitalExclusionCount = 0;
  const householdIncomes: number[] = [];

  surveys.forEach((survey) => {
    const calc = calculateHouseholdIncomeBreakdown(survey);
    householdIncomes.push(calc.perCapitaAnnual);

    // Kiểm tra xác nhận loại trừ giao dịch vốn
    if (!survey.hasExcludedCapitalTransaction) {
      unverifiedCapitalExclusionCount++;
    }

    // Kiểm tra tỷ suất chi phí trung gian ngành trồng trọt
    if (calc.section2_crops.harvest > 0) {
      const costRatio =
        (calc.section2_crops.cost / calc.section2_crops.harvest) * 100;
      if (costRatio > 95) {
        issues.push({
          id: `high-crop-cost-${survey.id}`,
          category: "HOUSEHOLD_SURVEY",
          severity: "WARNING",
          title: `Hộ ${survey.headName} (${survey.code}): Chi phí trồng trọt chiếm ${costRatio.toFixed(
            0
          )}% doanh thu`,
          description: `Chi phí sản xuất trồng trọt (${(
            calc.section2_crops.cost / 1000
          ).toFixed(1)} tr.đ) xấp xỉ hoặc vượt tổng giá trị thu hoạch (${(
            calc.section2_crops.harvest / 1000
          ).toFixed(1)} tr.đ). Cần xác minh xem hộ có bị thiên tai dịch bệnh mất mùa hay không.`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục II Mục 2",
          currentValueText: `${costRatio.toFixed(0)}%`,
          expectedBenchmark: "30% - 70%",
          recommendation: "Xác minh lại chi phí giống và phân bón của hộ.",
          canAutoFix: false,
          affectedHouseholdId: survey.id,
        });
      } else if (costRatio < 5 && calc.section2_crops.harvest > 30000) {
        issues.push({
          id: `low-crop-cost-${survey.id}`,
          category: "HOUSEHOLD_SURVEY",
          severity: "WARNING",
          title: `Hộ ${survey.headName} (${survey.code}): Chi phí trồng trọt quá thấp (<5%)`,
          description: `Thu hoạch cây trồng đạt ${(
            calc.section2_crops.harvest / 1000
          ).toFixed(1)} tr.đ nhưng chi phí đầu vào chỉ có ${(
            calc.section2_crops.cost / 1000
          ).toFixed(1)} tr.đ. Điều tra viên có thể đã quên hỏi chi phí phân bón, thuốc BVTV và xăng dầu.`,
          clause: "QĐ 2545/QĐ-BTC Phụ lục II Mục 2",
          currentValueText: `${costRatio.toFixed(0)}%`,
          expectedBenchmark: "≥ 20%",
          recommendation: "Yêu cầu điều tra viên bổ sung chi phí phân bón và tưới tiêu.",
          canAutoFix: false,
          affectedHouseholdId: survey.id,
        });
      }
    }

    // Kiểm tra nhân khẩu học (loại trừ người giúp việc hoặc trường hợp < 6 tháng)
    (survey.members || []).forEach((m) => {
      const evalRes = evaluateHouseholdMember(m);
      if (
        m.specialCaseRule === "EXCLUDED_MAID" &&
        m.isCountedAsMember
      ) {
        issues.push({
          id: `invalid-member-maid-${m.id}`,
          category: "HOUSEHOLD_SURVEY",
          severity: "CRITICAL",
          title: `Phiếu hộ ${survey.code}: Tính sai nhân khẩu người giúp việc`,
          description: `Thành viên '${m.fullName}' được ghi nhận là Người giúp việc có quỹ tài chính riêng nhưng vẫn bị đánh dấu tính vào nhân khẩu tính TNBQ.`,
          clause: "QĐ 2545/QĐ-BTC Điều 3 Khoản 1 Điểm a (Loại trừ nhân khẩu)",
          currentValueText: "Đang tính vào mẫu",
          expectedBenchmark: "Bắt buộc loại trừ",
          recommendation: "Bỏ tick tính nhân khẩu cho người giúp việc có quỹ riêng.",
          canAutoFix: true,
          autoFixActionKey: "FIX_HOUSEHOLD_MEMBERS",
          affectedHouseholdId: survey.id,
        });
      }
    });
  });

  if (unverifiedCapitalExclusionCount > 0) {
    issues.push({
      id: "unverified-capital-exclusion",
      category: "HOUSEHOLD_SURVEY",
      severity: "WARNING",
      title: `Còn ${unverifiedCapitalExclusionCount} phiếu hộ chưa xác nhận cam kết loại trừ giao dịch vốn`,
      description: `Điều tra viên cần xác nhận đã hỏi và loại trừ các khoản tiền rút tiền gửi tiết kiệm, bán đất đai/nhà cửa, nhận tiền bồi thường giải phóng mặt bằng hoặc vay nợ theo đúng quy định.`,
      clause: "QĐ 2545/QĐ-BTC Điều 3 Khoản 2 (Các khoản không tính vào thu nhập)",
      currentValueText: `${unverifiedCapitalExclusionCount} phiếu chưa xác nhận`,
      expectedBenchmark: "100% phiếu đã xác nhận",
      recommendation: "Bấm 'Sửa nhanh' để tự động cập nhật xác nhận loại trừ vốn hợp lệ.",
      canAutoFix: true,
      autoFixActionKey: "CONFIRM_ALL_CAPITAL_EXCLUSIONS",
    });
  }

  /* =========================================================================
   * KIỂM TOÁN NHÓM 5: THỐNG KÊ CỠ MẪU & MẪU DỊ BIỆT (OUTLIERS)
   * ========================================================================= */
  const sampleSize = surveys.length;
  const targetSampleSize = commune.sampleCount || 30;
  const sampleSizeAdequacy =
    targetSampleSize > 0
      ? Math.min(100, Math.round((sampleSize / targetSampleSize) * 100))
      : 100;

  if (sampleSize < targetSampleSize) {
    issues.push({
      id: "sample-size-inadequate",
      category: "STATISTICAL_SAMPLE",
      severity: sampleSize < targetSampleSize * 0.7 ? "CRITICAL" : "WARNING",
      title: `Cỡ mẫu điều tra (${sampleSize} hộ) chưa đạt chỉ tiêu phân bổ (${targetSampleSize} hộ)`,
      description: `Số lượng hộ gia đình được điều tra thực tế (${sampleSize} hộ) thấp hơn cỡ mẫu tối thiểu được quy định cho xã (${targetSampleSize} hộ). Cỡ mẫu không đủ làm tăng sai số chọn mẫu (Sampling Error) cho chỉ tiêu TNBQ.`,
      clause: "QĐ 2545/QĐ-BTC Phụ lục II Mục 1 (Phương pháp chọn mẫu phân tầng)",
      currentValueText: `${sampleSize} / ${targetSampleSize} hộ (${sampleSizeAdequacy}%)`,
      expectedBenchmark: "≥ 100% cỡ mẫu phân bổ",
      recommendation: "Bổ sung thêm phiếu khảo sát cho đủ cơ số mẫu.",
      canAutoFix: false,
    });
  }

  // Phát hiện Mẫu dị biệt (Outliers) dùng Z-score
  let outlierHouseholdsCount = 0;
  if (householdIncomes.length >= 5) {
    const mean =
      householdIncomes.reduce((a, b) => a + b, 0) / householdIncomes.length;
    const variance =
      householdIncomes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      householdIncomes.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 0) {
      surveys.forEach((survey) => {
        const calc = calculateHouseholdIncomeBreakdown(survey);
        const zScore = (calc.perCapitaAnnual - mean) / stdDev;
        if (Math.abs(zScore) > 2.5) {
          outlierHouseholdsCount++;
          issues.push({
            id: `outlier-household-${survey.id}`,
            category: "STATISTICAL_SAMPLE",
            severity: "WARNING",
            title: `Hộ dị biệt thống kê: ${survey.headName} (${survey.code}) có Z-Score = ${zScore.toFixed(
              2
            )}`,
            description: `Hộ có thu nhập bình quân ${(
              calc.perCapitaAnnual / 1000
            ).toFixed(1)} triệu đồng/người/năm, lệch ${Math.abs(zScore).toFixed(
              1
            )} lần độ lệch chuẩn so với mức bình quân mẫu ${(mean / 1000).toFixed(
              1
            )} triệu đ. Cần thẩm tra lại nguồn thu nhập lớn đột xuất để tránh làm méo mó kết quả TNBQ toàn xã.`,
            clause: "Quy chuẩn kiểm định dữ liệu Thống kê quốc gia (GSO Outlier Rule)",
            currentValueText: `TNBQ = ${(calc.perCapitaAnnual / 1000).toFixed(1)} tr.đ`,
            expectedBenchmark: `Biên độ chấp nhận: ${(
              Math.max(0, mean - 2.5 * stdDev) / 1000
            ).toFixed(1)} - ${((mean + 2.5 * stdDev) / 1000).toFixed(1)} tr.đ`,
            recommendation:
              "Kiểm tra xem có khoản thu tiền bán đất, trúng số hay tiền gửi một lần tính nhầm vào hay không.",
            canAutoFix: false,
            affectedHouseholdId: survey.id,
          });
        }
      });
    }
  }

  // 3. Tính điểm Audit Quality Score (0 - 100)
  let score = 100;
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  issues.forEach((iss) => {
    if (iss.severity === "CRITICAL") {
      score -= 22;
      criticalCount++;
    } else if (iss.severity === "WARNING") {
      score -= 8;
      warningCount++;
    } else {
      score -= 2;
      infoCount++;
    }
  });

  score = Math.max(0, Math.min(100, Math.round(score)));

  let healthStatus: AuditReportResult["healthStatus"] = "EXCELLENT";
  if (score < 50 || criticalCount >= 2) {
    healthStatus = "CRITICAL_RISK";
  } else if (score < 75 || criticalCount === 1) {
    healthStatus = "NEEDS_ATTENTION";
  } else if (score < 90) {
    healthStatus = "GOOD";
  }

  return {
    auditScore: score,
    healthStatus,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    infoCount,
    issues,
    metrics: {
      totalTGTSPCurrent,
      totalTNBQAnnualMillion: tnbqStats.averagePerCapitaAnnualMillionVND,
      communeTotalIncomeEstimatedBillion,
      ratioTNBQToTGTSP,
      sector1Ratio,
      sector2Ratio,
      sector3Ratio,
      provincialExcessRatio,
      sampleSizeAdequacy,
      outlierHouseholdsCount,
    },
    auditTimestamp: new Date().toLocaleString("vi-VN"),
  };
}

/**
 * Xử lý sửa nhanh tự động cho các lỗi kiểm toán có thể can thiệp trực tiếp
 */
export function applyStructuralAutoFix(
  commune: CommuneProfile,
  actionKey: string,
  targetId?: string
): CommuneProfile {
  const updated = JSON.parse(JSON.stringify(commune)) as CommuneProfile;

  switch (actionKey) {
    case "APPLY_PROVINCIAL_CAP": {
      // Điều chỉnh trần tỉnh: k = provincialGTSX / sumAllCommunesTGTSP
      if (
        updated.sumAllCommunesTGTSP > updated.provincialGTSX &&
        updated.sumAllCommunesTGTSP > 0
      ) {
        const k = updated.provincialGTSX / updated.sumAllCommunesTGTSP;
        updated.tgtspRows = (updated.tgtspRows || []).map((row) => {
          const newCurrent = Math.round(row.currentPriceValue * k * 100) / 100;
          const newConstant = Math.round(row.constantPriceValue * k * 100) / 100;
          return {
            ...row,
            currentPriceValue: newCurrent,
            constantPriceValue: newConstant,
            notes: `${row.notes ? row.notes + " | " : ""}Đã áp dụng hệ số trần tỉnh k=${k.toFixed(4)}`,
          };
        });
        // Cập nhật lại tổng các xã = trần tỉnh
        updated.sumAllCommunesTGTSP = updated.provincialGTSX;
      }
      break;
    }

    case "CONFIRM_ALL_CAPITAL_EXCLUSIONS": {
      // Đánh dấu xác nhận cam kết loại trừ vốn cho toàn bộ các phiếu
      updated.surveys = (updated.surveys || []).map((s) => ({
        ...s,
        hasExcludedCapitalTransaction: true,
        verificationNotes: `${s.verificationNotes ? s.verificationNotes + "; " : ""}Đã kiểm toán xác nhận loại trừ giao dịch vốn Điều 3`,
      }));
      break;
    }

    case "FIX_TRADE_MARGIN": {
      // Sửa ngành thương mại nếu giá vốn >= doanh thu
      if (targetId) {
        updated.tgtspRows = (updated.tgtspRows || []).map((row) => {
          if (row.id === targetId && row.method === "DIRECT_TRADE_MARGIN") {
            const rev = row.revenue || 0;
            const newCogs = Math.round(rev * 0.78 * 100) / 100; // Chuẩn hóa giá vốn = 78% DT
            return {
              ...row,
              costOfGoodsSold: newCogs,
              currentPriceValue: Math.round((rev - newCogs) * 100) / 100,
              notes: `${row.notes ? row.notes + " | " : ""}Đã chuẩn hóa tỷ suất giá vốn 78%`,
            };
          }
          return row;
        });
      }
      break;
    }

    case "RESET_PRICE_INDEX": {
      // Đặt lại chỉ số giá về 103.5% (mức CPI chuẩn cấp tỉnh)
      if (targetId) {
        updated.tgtspRows = (updated.tgtspRows || []).map((row) => {
          if (row.id === targetId) {
            const index = 103.5;
            const constant = Math.round((row.currentPriceValue / (index / 100)) * 100) / 100;
            return {
              ...row,
              priceIndex: index,
              constantPriceValue: constant,
            };
          }
          return row;
        });
      }
      break;
    }

    case "FIX_HOUSEHOLD_MEMBERS": {
      // Loại trừ người giúp việc
      updated.surveys = (updated.surveys || []).map((s) => ({
        ...s,
        members: (s.members || []).map((m) => {
          if (m.specialCaseRule === "EXCLUDED_MAID") {
            return { ...m, isCountedAsMember: false };
          }
          return m;
        }),
      }));
      break;
    }

    default:
      break;
  }

  return updated;
}
