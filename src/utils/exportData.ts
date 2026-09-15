import * as XLSX from "xlsx";
import { CommuneProfile, TGTSPRow, HouseholdSurveyRecord } from "../types";
import {
  calculateTGTSPRow,
  calculateHouseholdIncomeBreakdown,
  calculateCommuneTNBQ,
  calculateGrowthRate,
  formatVND,
} from "./calculations";

/**
 * Xuất toàn bộ dữ liệu chỉ tiêu xã thành file Excel đa Sheet (.xlsx)
 * Gồm 4 Sheet:
 * 1. TongHop_BaoCao: Thông tin chung hành chính, tổng hợp 2 chỉ tiêu và đánh giá NTM
 * 2. 1.TGTSP_PhuLuc_I: Chi tiết toàn bộ các ngành kinh tế theo giá hiện hành & so sánh
 * 3. 2.TNBQ_PhuLuc_II: Danh sách hộ mẫu điều tra và cơ cấu 7 nguồn thu nhập
 * 4. 3.LichSu_TNBQ: Chuỗi dữ liệu lịch sử biến động TNBQ qua các năm và so sánh chuẩn NTM
 */
export function exportCommuneToExcel(commune: CommuneProfile) {
  const wb = XLSX.utils.book_new();
  const year = commune.reportingYear || 2026;
  const baseYear = commune.baseYear || 2025;
  const tnbqCalc = calculateCommuneTNBQ(commune);

  // Tính tổng TGTSP
  const totalCurrentTGTSP = (commune.tgtspRows || []).reduce((sum, r) => {
    return sum + calculateTGTSPRow(r).currentPriceValue;
  }, 0);

  const totalConstantTGTSP = (commune.tgtspRows || []).reduce((sum, r) => {
    return sum + calculateTGTSPRow(r).constantPriceValue;
  }, 0);

  // --------------------------------------------------------------------------
  // SHEET 1: TỔNG HỢP BÁO CÁO CẤP XÃ
  // --------------------------------------------------------------------------
  const summaryData = [
    ["HỆ THỐNG BIÊN SOẠN 02 CHỈ TIÊU THỐNG KÊ TỔNG HỢP CẤP XÃ"],
    ["THEO QUYẾT ĐỊNH SỐ 2545/QĐ-BTC NGÀY 14/09/2026 CỦA BỘ TRƯỞNG BỘ TÀI CHÍNH"],
    [],
    ["1. THÔNG TIN ĐƠN VỊ HÀNH CHÍNH"],
    ["Tên xã/phường/thị trấn:", commune.communeName],
    ["Huyện/thị xã/thành phố:", commune.districtName],
    ["Tỉnh/thành phố trực thuộc TW:", commune.provinceName],
    ["Năm báo cáo thống kê:", year],
    ["Năm gốc so sánh:", baseYear],
    ["Tổng số hộ dân cư toàn xã (hộ):", commune.totalHouseholds],
    ["Tổng dân số thường trú (người):", commune.totalPopulation],
    [],
    ["2. TỔNG HỢP CHỈ TIÊU 1: TỔNG GIÁ TRỊ SẢN PHẨM (TGTSP) CẤP XÃ"],
    ["Tổng TGTSP theo giá hiện hành (Triệu đồng):", totalCurrentTGTSP],
    ["Tổng TGTSP theo giá so sánh (Triệu đồng):", totalConstantTGTSP],
    ["Số lượng ngành/phân ngành kinh tế phát sinh:", (commune.tgtspRows || []).length],
    ["Tổng GTSX toàn tỉnh (Triệu đồng):", commune.provincialGTSX || 0],
    ["Tỷ trọng đóng góp vào tỉnh (%):", commune.provincialGTSX > 0 ? Number(((totalCurrentTGTSP / commune.provincialGTSX) * 100).toFixed(2)) : 0],
    [],
    ["3. TỔNG HỢP CHỈ TIÊU 2: THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI (TNBQ) CẤP XÃ"],
    ["Số hộ điều tra mẫu (hộ):", tnbqCalc.sampleHouseholdsCount],
    ["Số nhân khẩu mẫu hợp lệ (người):", tnbqCalc.samplePopulationCount],
    ["Tổng thu nhập mẫu điều tra (Nghìn đồng):", tnbqCalc.sampleTotalIncomeThousandVND],
    ["Thu nhập bình quân đầu người (Triệu đồng/người/năm):", tnbqCalc.averagePerCapitaAnnualMillionVND],
    ["Thu nhập bình quân đầu người (Nghìn đồng/người/tháng):", tnbqCalc.averagePerCapitaMonthlyThousandVND],
    ["Ước tính tổng thu nhập toàn xã (Tỷ đồng):", tnbqCalc.estimatedCommuneTotalIncomeBillionVND],
    [],
    ["4. ĐỐI CHIẾU TIÊU CHÍ NÔNG THÔN MỚI SỐ 10"],
    ["Chuẩn NTM quy định năm báo cáo (Triệu đồng/người/năm):", 62],
    [
      "Đánh giá kết quả:",
      tnbqCalc.averagePerCapitaAnnualMillionVND >= 62
        ? "ĐẠT TIÊU CHÍ NÔNG THÔN MỚI SỐ 10"
        : "CHƯA ĐẠT TIÊU CHÍ (Cần tăng cường hỗ trợ kinh tế)",
    ],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "TongHop_BaoCao");

  // --------------------------------------------------------------------------
  // SHEET 2: PHỤ LỤC I - TGTSP CHI TIẾT THEO NGÀNH
  // --------------------------------------------------------------------------
  const tgtspHeaders = [
    "STT",
    "Mã ngành",
    "Tên ngành kinh tế",
    "Phương thức biên soạn",
    "Trực tiếp / Phân bổ",
    "Sản lượng",
    "Đơn vị tính",
    "Đơn giá (Tr.đ)",
    "Doanh thu (Tr.đ)",
    "Giá vốn hàng bán (Tr.đ)",
    "Chi phí SX (Tr.đ)",
    "Lợi nhuận (Tr.đ)",
    "Trợ cấp SP (Tr.đ)",
    "Tỷ lệ phân bổ (%)",
    "Giá trị gốc tỉnh (Tr.đ)",
    "TGTSP Giá hiện hành (Tr.đ)",
    "Chỉ số giá (%)",
    "TGTSP Giá so sánh (Tr.đ)",
    "Ghi chú",
  ];

  const tgtspRowsData = (commune.tgtspRows || []).map((row, index) => {
    const calc = calculateTGTSPRow(row);
    let methodDesc = "Trực tiếp";
    switch (row.method) {
      case "DIRECT_OUTPUT_PRICE":
        methodDesc = "Sản lượng x Đơn giá bình quân";
        break;
      case "DIRECT_REVENUE_SUBSIDY":
        methodDesc = "Doanh thu thuần + Trợ cấp sản phẩm";
        break;
      case "DIRECT_TRADE_MARGIN":
        methodDesc = "Doanh thu - Vốn hàng bán + Trợ cấp";
        break;
      case "DIRECT_COST_PROFIT":
        methodDesc = "Chi phí SX + Lợi nhuận + Trợ cấp";
        break;
      case "STATE_MANAGEMENT":
        methodDesc = "QLNN & Dịch vụ công NSNN";
        break;
      case "INDIRECT_ALLOCATED":
        methodDesc = "Phân bổ gián tiếp từ tỉnh";
        break;
    }

    return [
      index + 1,
      row.industryCode,
      row.industryName,
      methodDesc,
      row.isDirect ? "Trực tiếp" : "Phân bổ",
      row.quantity ?? "",
      row.unit ?? "",
      row.unitPrice ?? "",
      row.revenue ?? "",
      row.costOfGoodsSold ?? "",
      row.productionCost ?? "",
      row.netProfit ?? "",
      row.subsidy ?? "",
      row.allocatedRatio ?? "",
      row.allocatedBaseProvincialValue ?? "",
      calc.currentPriceValue,
      row.priceIndex,
      calc.constantPriceValue,
      row.notes ?? "",
    ];
  });

  // Thêm dòng tổng cộng
  const tgtspSummaryRow = [
    "",
    "TỔNG",
    "TỔNG CỘNG TOÀN XÃ",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    totalCurrentTGTSP,
    "",
    totalConstantTGTSP,
    "",
  ];

  const wsTGTSP = XLSX.utils.aoa_to_sheet([
    [`BIỂU SỐ 01: TỔNG GIÁ TRỊ SẢN PHẨM (TGTSP) XÃ ${commune.communeName.toUpperCase()}`],
    [`Kỳ báo cáo: Năm ${year} - So sánh với năm gốc ${baseYear} - Đơn vị tính: Triệu đồng`],
    [],
    tgtspHeaders,
    ...tgtspRowsData,
    tgtspSummaryRow,
  ]);

  wsTGTSP["!cols"] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 35 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 22 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTGTSP, "1.TGTSP_PhuLuc_I");

  // --------------------------------------------------------------------------
  // SHEET 3: PHỤ LỤC II - THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI (DANH SÁCH MẪU HỘ)
  // --------------------------------------------------------------------------
  const tnbqHeaders = [
    "STT",
    "Mã hộ",
    "Họ tên chủ hộ",
    "Địa chỉ / Thôn xóm",
    "Tổng số thành viên",
    "Số nhân khẩu tính TNBQ",
    "Mục 1: Tiền lương, công, trợ cấp (1.000 đ)",
    "Mục 2: Thuần trồng trọt (1.000 đ)",
    "Mục 3: Thuần chăn nuôi (1.000 đ)",
    "Mục 4: Thuần lâm nghiệp (1.000 đ)",
    "Mục 5: Thuần thủy sản (1.000 đ)",
    "Mục 6: Thuần SXKD phi NLTS (1.000 đ)",
    "Mục 7: Thu nhập khác (1.000 đ)",
    "Tổng thu nhập hộ (1.000 đ)",
    "TNBQ người/năm (1.000 đ)",
    "TNBQ người/tháng (1.000 đ)",
    "TNBQ người/năm (Triệu đồng)",
    "Trạng thái xác minh",
  ];

  const tnbqRowsData = (commune.surveys || []).map((survey, index) => {
    const calc = calculateHouseholdIncomeBreakdown(survey);
    return [
      index + 1,
      survey.code,
      survey.headName,
      survey.villageName || survey.address,
      (survey.members || []).length,
      calc.validMembersCount,
      calc.section1_salary,
      calc.section2_crops.net,
      calc.section3_livestock.net,
      calc.section4_forestry.net,
      calc.section5_fishery.net,
      calc.section6_nonFarm.net,
      calc.section7_other,
      calc.totalNetIncome,
      calc.perCapitaAnnual,
      calc.perCapitaMonthly,
      Number((calc.perCapitaAnnual / 1000).toFixed(2)),
      survey.isVerified ? "Đã kiểm duyệt" : "Chờ thẩm tra",
    ];
  });

  const wsTNBQ = XLSX.utils.aoa_to_sheet([
    [`BIỂU SỐ 02: DANH SÁCH PHIẾU ĐIỀU TRA THU NHẬP HỘ DÂN CƯ XÃ ${commune.communeName.toUpperCase()}`],
    [`Kỳ điều tra: Năm ${year} - Đơn vị tính: 1.000 VNĐ (trừ cột cuối cùng là Triệu đồng)`],
    [],
    tnbqHeaders,
    ...tnbqRowsData,
  ]);

  wsTNBQ["!cols"] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 24 },
    { wch: 25 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTNBQ, "2.TNBQ_PhuLuc_II");

  // --------------------------------------------------------------------------
  // SHEET 4: LỊCH SỬ BIẾN ĐỘNG TNBQ QUA CÁC NĂM
  // --------------------------------------------------------------------------
  if (commune.tnbqHistory && commune.tnbqHistory.length > 0) {
    const historyHeaders = [
      "Năm thống kê",
      "TNBQ thực tế (Triệu đồng/người/năm)",
      "Ngưỡng chuẩn NTM (Triệu đồng)",
      "Tốc độ tăng trưởng (%)",
      "Cỡ mẫu điều tra (hộ)",
      "Đánh giá đạt chuẩn NTM",
      "Ghi chú",
    ];

    const historyRowsData = commune.tnbqHistory.map((h) => {
      const isMet =
        h.ntmStandardMillionVND !== undefined
          ? h.tnbqMillionVND >= h.ntmStandardMillionVND
            ? "Đạt chuẩn"
            : "Chưa đạt"
          : "-";
      return [
        h.year,
        h.tnbqMillionVND,
        h.ntmStandardMillionVND ?? "",
        h.growthRatePercent !== undefined ? `${h.growthRatePercent}%` : "-",
        h.sampleSize ?? "",
        isMet,
        h.notes ?? "",
      ];
    });

    const wsHistory = XLSX.utils.aoa_to_sheet([
      [`CHUỖI SỐ LIỆU LỊCH SỬ THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI XÃ ${commune.communeName.toUpperCase()}`],
      [`Đơn vị tính: Triệu đồng/người/năm`],
      [],
      historyHeaders,
      ...historyRowsData,
    ]);

    wsHistory["!cols"] = [
      { wch: 14 },
      { wch: 25 },
      { wch: 22 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, wsHistory, "3.LichSu_TNBQ");
  }

  // Xuất file
  const fileName = `So_Lieu_Thong_Ke_${commune.communeName.replace(/\s+/g, "_")}_Nam_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Xuất dữ liệu TGTSP (Phụ lục I) dạng CSV với UTF-8 BOM
 */
export function exportTGTSPToCSV(commune: CommuneProfile) {
  const year = commune.reportingYear || 2026;
  const baseYear = commune.baseYear || 2025;

  const headers = [
    "STT",
    "Ma_Nganh",
    "Ten_Nganh",
    "Phuong_Thuc",
    "Hinh_Thuc",
    "San_Luong",
    "Don_Vi_Tinh",
    "Don_Gia_Trieu_Dong",
    "Doanh_Thu_Trieu_Dong",
    "Gia_Von_Trieu_Dong",
    "Chi_Phi_SX_Trieu_Dong",
    "Loi_Nhuan_Trieu_Dong",
    "Tro_Cap_Trieu_Dong",
    "Ty_Le_Phan_Bo_Phan_Tram",
    "TGTSP_Gia_Hien_Hanh_Trieu_Dong",
    "Chi_So_Gia_Phan_Tram",
    "TGTSP_Gia_So_Sanh_Trieu_Dong",
    "Ghi_Chu",
  ];

  const rows = (commune.tgtspRows || []).map((row, index) => {
    const calc = calculateTGTSPRow(row);
    return [
      index + 1,
      `"${row.industryCode}"`,
      `"${row.industryName.replace(/"/g, '""')}"`,
      `"${row.method}"`,
      `"${row.isDirect ? "Trực tiếp" : "Phân bổ"}"`,
      row.quantity ?? "",
      `"${row.unit ?? ""}"`,
      row.unitPrice ?? "",
      row.revenue ?? "",
      row.costOfGoodsSold ?? "",
      row.productionCost ?? "",
      row.netProfit ?? "",
      row.subsidy ?? "",
      row.allocatedRatio ?? "",
      calc.currentPriceValue,
      row.priceIndex,
      calc.constantPriceValue,
      `"${(row.notes ?? "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent =
    "\uFEFF" +
    `# BẢNG TÍNH TỔNG GIÁ TRỊ SẢN PHẨM (TGTSP) XÃ ${commune.communeName} NĂM ${year}\n` +
    headers.join(",") +
    "\n" +
    rows.join("\n");

  downloadBlob(
    csvContent,
    `TGTSP_PhuLuc_I_${commune.communeName.replace(/\s+/g, "_")}_${year}.csv`,
    "text/csv;charset=utf-8;"
  );
}

/**
 * Xuất dữ liệu TNBQ mẫu hộ (Phụ lục II) dạng CSV với UTF-8 BOM
 */
export function exportTNBQSurveysToCSV(commune: CommuneProfile) {
  const year = commune.reportingYear || 2026;

  const headers = [
    "STT",
    "Ma_Ho",
    "Chu_Ho",
    "Dia_Chi_Thon",
    "Tong_Nhan_Khau",
    "Nhan_Khau_Tinh_TNBQ",
    "Muc1_Tien_Luong_Nghin_Dong",
    "Muc2_Trong_Trot_Nghin_Dong",
    "Muc3_Chan_Nuoi_Nghin_Dong",
    "Muc4_Lam_Nghiep_Nghin_Dong",
    "Muc5_Thuy_San_Nghin_Dong",
    "Muc6_Phi_NLTS_Nghin_Dong",
    "Muc7_Thu_Khac_Nghin_Dong",
    "Tong_Thu_Nhap_Ho_Nghin_Dong",
    "TNBQ_Nguoi_Nam_Nghin_Dong",
    "TNBQ_Nguoi_Thang_Nghin_Dong",
    "TNBQ_Nguoi_Nam_Trieu_Dong",
    "Trang_Thai_Xac_Minh",
  ];

  const rows = (commune.surveys || []).map((survey, index) => {
    const calc = calculateHouseholdIncomeBreakdown(survey);
    return [
      index + 1,
      `"${survey.code}"`,
      `"${survey.headName.replace(/"/g, '""')}"`,
      `"${(survey.villageName || survey.address).replace(/"/g, '""')}"`,
      (survey.members || []).length,
      calc.validMembersCount,
      calc.section1_salary,
      calc.section2_crops.net,
      calc.section3_livestock.net,
      calc.section4_forestry.net,
      calc.section5_fishery.net,
      calc.section6_nonFarm.net,
      calc.section7_other,
      calc.totalNetIncome,
      calc.perCapitaAnnual,
      calc.perCapitaMonthly,
      Number((calc.perCapitaAnnual / 1000).toFixed(2)),
      `"${survey.isVerified ? "Đã duyệt" : "Chờ duyệt"}"`,
    ].join(",");
  });

  const csvContent =
    "\uFEFF" +
    `# DANH SÁCH MẪU ĐIỀU TRA TNBQ XÃ ${commune.communeName} NĂM ${year}\n` +
    headers.join(",") +
    "\n" +
    rows.join("\n");

  downloadBlob(
    csvContent,
    `TNBQ_PhuLuc_II_${commune.communeName.replace(/\s+/g, "_")}_${year}.csv`,
    "text/csv;charset=utf-8;"
  );
}

/**
 * Xuất dữ liệu lịch sử TNBQ dạng CSV với UTF-8 BOM
 */
export function exportTNBQHistoryToCSV(commune: CommuneProfile) {
  const history = commune.tnbqHistory || [];
  const headers = [
    "Nam",
    "TNBQ_Trieu_Dong_Nguoi_Nam",
    "Chuan_NTM_Trieu_Dong",
    "Toc_Do_Tang_Truong_Phan_Tram",
    "Co_Mau_Ho",
    "Danh_Gia_NTM",
    "Ghi_Chu",
  ];

  const rows = history.map((h) => {
    const isMet =
      h.ntmStandardMillionVND !== undefined
        ? h.tnbqMillionVND >= h.ntmStandardMillionVND
          ? "Đạt chuẩn"
          : "Chưa đạt"
        : "-";

    return [
      h.year,
      h.tnbqMillionVND,
      h.ntmStandardMillionVND ?? "",
      h.growthRatePercent ?? "",
      h.sampleSize ?? "",
      `"${isMet}"`,
      `"${(h.notes ?? "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent =
    "\uFEFF" +
    `# LỊCH SỬ BIẾN ĐỘNG TNBQ QUA CÁC NĂM XÃ ${commune.communeName}\n` +
    headers.join(",") +
    "\n" +
    rows.join("\n");

  downloadBlob(
    csvContent,
    `LichSu_TNBQ_${commune.communeName.replace(/\s+/g, "_")}.csv`,
    "text/csv;charset=utf-8;"
  );
}

/**
 * Xuất dữ liệu phân tích và đối sánh liên xã (cấp xã) ra file Excel (.xlsx)
 * Lưu ý: Mô hình hiện hành tinh gọn không còn cấp trung gian (cấp huyện),
 * thực hiện đối sánh trực tiếp giữa các xã/phường trên địa bàn.
 */
export function exportDistrictComparisonToExcel(
  communes: CommuneProfile[],
  areaLabel: string = "Địa bàn liên xã"
) {
  const wb = XLSX.utils.book_new();
  const year = communes[0]?.reportingYear || 2026;

  // Tính toán chỉ số tổng hợp các xã
  let totalPop = 0;
  let totalHH = 0;
  let totalCurrentTGTSP = 0;
  let totalConstantTGTSP = 0;
  let weightedTNBQSum = 0;
  let totalPopWithTNBQ = 0;
  let ntmPassCount = 0;

  const communeRows = communes.map((c, idx) => {
    const pop = c.totalPopulation || 0;
    const hh = c.totalHouseholds || 0;
    totalPop += pop;
    totalHH += hh;

    const currentTGTSP = (c.tgtspRows || []).reduce((sum, r) => {
      return sum + calculateTGTSPRow(r).currentPriceValue;
    }, 0);
    const constantTGTSP = (c.tgtspRows || []).reduce((sum, r) => {
      return sum + calculateTGTSPRow(r).constantPriceValue;
    }, 0);
    totalCurrentTGTSP += currentTGTSP;
    totalConstantTGTSP += constantTGTSP;

    const tnbqCalc = calculateCommuneTNBQ(c);
    const tnbqAnnual = tnbqCalc.averagePerCapitaAnnualMillionVND;
    if (pop > 0 && tnbqAnnual > 0) {
      weightedTNBQSum += tnbqAnnual * pop;
      totalPopWithTNBQ += pop;
    }

    const ntmThreshold = 68.0; // Chuẩn 2026
    const isPassNTM = tnbqAnnual >= ntmThreshold;
    if (isPassNTM) ntmPassCount++;

    // Phân rã 3 khu vực
    let agri = 0;
    let ind = 0;
    let serv = 0;
    (c.tgtspRows || []).forEach((r) => {
      const val = calculateTGTSPRow(r).currentPriceValue;
      const code = (r.industryCode || "").toUpperCase();
      if (code.startsWith("A")) agri += val;
      else if (["B", "C", "D", "E", "F"].some((k) => code.startsWith(k))) ind += val;
      else serv += val;
    });

    return {
      index: idx + 1,
      name: c.communeName,
      pop,
      hh,
      currentTGTSP,
      constantTGTSP,
      growthRate: constantTGTSP > 0 ? ((currentTGTSP - constantTGTSP) / constantTGTSP) * 100 : 0,
      agri,
      ind,
      serv,
      tnbqAnnual,
      isPassNTM,
      diffNTM: tnbqAnnual - ntmThreshold,
    };
  });

  const avgTNBQ =
    totalPopWithTNBQ > 0 ? weightedTNBQSum / totalPopWithTNBQ : 0;
  const ntmPassRate =
    communes.length > 0 ? (ntmPassCount / communes.length) * 100 : 0;

  // SHEET 1: TỔNG HỢP LIÊN XÃ
  const sheet1Data = [
    ["BÁO CÁO PHÂN TÍCH VÀ ĐỐI SÁNH KINH TẾ CẤP XÃ (LIÊN XÃ)"],
    [`ĐỊA BÀN: ${areaLabel.toUpperCase()} - NĂM ${year}`],
    ["Căn cứ Quyết định số 2545/QĐ-BTC ngày 14/09/2026 của Bộ Tài chính"],
    ["(Hệ thống tổng hợp trực tiếp cấp xã, tinh gọn đầu mối trung gian)"],
    [],
    ["CHỈ SỐ TỔNG HỢP", "GIÁ TRỊ", "ĐƠN VỊ TÍNH", "GHI CHÚ"],
    ["Số lượng xã/phường khảo sát", communes.length, "Xã/Phường", "Đầy đủ hồ sơ thống kê 02 chỉ tiêu"],
    ["Tổng dân số các xã", totalPop, "Người", "Dân số thường trú"],
    ["Tổng số hộ gia đình", totalHH, "Hộ", "Theo sổ theo dõi hộ địa phương"],
    ["Tổng TGTSP hiện hành các xã", totalCurrentTGTSP / 1000, "Tỷ đồng", "Cộng dồn theo ngành kinh tế"],
    ["Tổng TGTSP so sánh các xã", totalConstantTGTSP / 1000, "Tỷ đồng", "Theo giá so sánh 2025"],
    [
      "Tốc độ tăng trưởng TGTSP chung",
      totalConstantTGTSP > 0
        ? Math.round(
            ((totalCurrentTGTSP - totalConstantTGTSP) /
              totalConstantTGTSP) *
              10000
          ) / 100
        : 0,
      "%",
      "So với giá so sánh",
    ],
    ["TNBQ bình quân chung các xã", Math.round(avgTNBQ * 100) / 100, "Triệu đ/người/năm", "Bình quân gia quyền theo quy mô dân số"],
    ["Số xã đạt Tiêu chí NTM số 10", `${ntmPassCount}/${communes.length}`, "Xã", `Tỷ lệ ${Math.round(ntmPassRate * 10) / 10}%`],
    ["Ngưỡng chuẩn Tiêu chí NTM số 10", 68.0, "Triệu đ/người/năm", "Năm 2026 theo QĐ 2545"],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1["!cols"] = [{ wch: 36 }, { wch: 22 }, { wch: 18 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, ws1, "1.TongHop_LienXa");

  // SHEET 2: BẢNG SO SÁNH TGTSP CÁC XÃ
  const sheet2Data = [
    [`BẢNG SO SÁNH TỔNG GIÁ TRỊ SẢN PHẨM (TGTSP) GIỮA CÁC XÃ`],
    [`Địa bàn: ${areaLabel} - Kỳ thống kê: Năm ${year} (Đơn vị tiền: Triệu đồng)`],
    [],
    [
      "STT",
      "Tên xã / Phường",
      "Dân số (người)",
      "Số hộ",
      "TGTSP hiện hành (Triệu đ)",
      "TGTSP hiện hành (Tỷ đ)",
      "TGTSP so sánh (Triệu đ)",
      "Tốc độ tăng (%)",
      "Tỷ trọng đóng góp (%)",
      "Khu vực I (Nông nghiệp)",
      "Khu vực II (CN-XD)",
      "Khu vực III (Dịch vụ)",
    ],
    ...communeRows.map((r) => [
      r.index,
      r.name,
      r.pop,
      r.hh,
      Math.round(r.currentTGTSP * 100) / 100,
      Math.round((r.currentTGTSP / 1000) * 100) / 100,
      Math.round(r.constantTGTSP * 100) / 100,
      Math.round(r.growthRate * 100) / 100,
      totalCurrentTGTSP > 0
        ? Math.round((r.currentTGTSP / totalCurrentTGTSP) * 10000) / 100
        : 0,
      Math.round(r.agri * 100) / 100,
      Math.round(r.ind * 100) / 100,
      Math.round(r.serv * 100) / 100,
    ]),
    [
      "TỔNG",
      "TỔNG CỘNG CÁC XÃ",
      totalPop,
      totalHH,
      Math.round(totalCurrentTGTSP * 100) / 100,
      Math.round((totalCurrentTGTSP / 1000) * 100) / 100,
      Math.round(totalConstantTGTSP * 100) / 100,
      totalConstantTGTSP > 0
        ? Math.round(
            ((totalCurrentTGTSP - totalConstantTGTSP) /
              totalConstantTGTSP) *
              10000
          ) / 100
        : 0,
      100,
      "",
      "",
      "",
    ],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2["!cols"] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 14 },
    { wch: 10 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "2.SoSanh_TGTSP_CacXa");

  // SHEET 3: BẢNG SO SÁNH TNBQ VÀ TIÊU CHÍ NTM SỐ 10
  const sheet3Data = [
    [`BẢNG SO SÁNH THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI (TNBQ) & TIÊU CHÍ NTM SỐ 10`],
    [`Địa bàn: ${areaLabel} - Ngưỡng chuẩn NTM năm 2026: 68.0 triệu đồng/người/năm`],
    [],
    [
      "STT",
      "Tên xã / Phường",
      "Dân số",
      "Số hộ chọn mẫu",
      "TNBQ (Triệu đ/người/năm)",
      "TNBQ (Nghìn đ/người/tháng)",
      "Chuẩn NTM 2026 (Triệu đ)",
      "Chênh lệch (+/- Triệu đ)",
      "Đánh giá Tiêu chí 10 NTM",
    ],
    ...communeRows.map((r) => [
      r.index,
      r.name,
      r.pop,
      communes[r.index - 1]?.sampleCount || 0,
      Math.round(r.tnbqAnnual * 100) / 100,
      Math.round((r.tnbqAnnual * 1000) / 12),
      68.0,
      Math.round(r.diffNTM * 100) / 100,
      r.isPassNTM ? "ĐẠT CHUẨN NTM" : "CHƯA ĐẠT CHUẨN",
    ]),
    [
      "BQ",
      "BÌNH QUÂN CHUNG CÁC XÃ",
      totalPop,
      communes.reduce((s, c) => s + (c.sampleCount || 0), 0),
      Math.round(avgTNBQ * 100) / 100,
      Math.round((avgTNBQ * 1000) / 12),
      68.0,
      Math.round((avgTNBQ - 68.0) * 100) / 100,
      avgTNBQ >= 68.0 ? "ĐẠT BÌNH QUÂN CHUNG" : "DƯỚI BÌNH QUÂN CHUNG",
    ],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3["!cols"] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, "3.SoSanh_TNBQ_NTM");

  const cleanLabel = areaLabel.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, "_");
  const fileName = `TongHop_DoiSanh_LienXa_${cleanLabel}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Helper tải file về trình duyệt
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
