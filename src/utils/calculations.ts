import {
  TGTSPRow,
  HouseholdSurveyRecord,
  HouseholdMember,
  CommuneProfile,
} from "../types";

/**
 * Tính toán giá trị hiện hành và giá trị so sánh cho một dòng TGTSP
 * Theo Mục 2.3 & 2.2 Phụ lục I - QĐ 2545/QĐ-BTC
 */
export function calculateTGTSPRow(row: TGTSPRow): {
  currentPriceValue: number;
  constantPriceValue: number;
} {
  let currentPrice = 0;

  switch (row.method) {
    case "DIRECT_OUTPUT_PRICE":
      // (1) NLTS, khai khoáng, chế biến xác định được lượng: Sản lượng x Đơn giá
      currentPrice = (row.quantity || 0) * (row.unitPrice || 0);
      break;

    case "DIRECT_REVENUE_SUBSIDY":
      // (2) Công nghiệp, dịch vụ: Doanh thu thuần + Trợ cấp sản phẩm
      currentPrice = (row.revenue || 0) + (row.subsidy || 0);
      break;

    case "DIRECT_TRADE_MARGIN":
      // (3) Thương nghiệp, ăn uống, điện/khí, BĐS, xổ số: Doanh thu - Giá vốn + Trợ cấp
      currentPrice =
        (row.revenue || 0) -
        (row.costOfGoodsSold || 0) +
        (row.subsidy || 0);
      break;

    case "DIRECT_COST_PROFIT":
      // (4) Xây dựng, dịch vụ phi thị trường: Chi phí sản xuất + Lợi nhuận thuần + Trợ cấp
      currentPrice =
        (row.productionCost || 0) +
        (row.netProfit || 0) +
        (row.subsidy || 0);
      break;

    case "STATE_MANAGEMENT":
      // (5) Ngành QLNN: Chi thường xuyên từ NSNN (đã trừ mua sắm TSCĐ, trợ cấp) + ngoài NSNN
      currentPrice = (row.productionCost || 0) + (row.netProfit || 0);
      break;

    case "INDIRECT_ALLOCATED":
      // Phân bổ gián tiếp theo tỷ trọng từ GTSX toàn tỉnh
      currentPrice =
        ((row.allocatedRatio || 0) / 100) *
        (row.allocatedBaseProvincialValue || 0);
      break;

    default:
      currentPrice = row.currentPriceValue || 0;
  }

  // Tính theo giá so sánh: TGTSP hiện hành / (Chỉ số giá / 100)
  const index = (row.priceIndex && row.priceIndex > 0) ? row.priceIndex : 100;
  const constantPrice = currentPrice / (index / 100);

  return {
    currentPriceValue: Math.round(currentPrice * 100) / 100,
    constantPriceValue: Math.round(constantPrice * 100) / 100,
  };
}

/**
 * Kiểm tra và tính điều chỉnh khống chế trần GTSX tỉnh
 * Theo Nguyên tắc (2) Mục 1.3 và Mục 2.5 Phụ lục I:
 * Nếu Tổng TGTSP các xã cộng dồn > GTSX của tỉnh:
 * Chênh lệch phân bổ cho xã = (Tổng các xã - GTSX tỉnh) * (TGTSP xã / Tổng các xã)
 */
export function calculateProvincialCapAdjustment(
  communeCurrentTotal: number,
  sumAllCommunes: number,
  provincialGTSX: number
): {
  isExceeded: boolean;
  totalExcess: number;
  communeReduction: number;
  finalAdjustedTGTSP: number;
} {
  if (sumAllCommunes > provincialGTSX && provincialGTSX > 0) {
    const totalExcess = sumAllCommunes - provincialGTSX;
    const communeReduction =
      sumAllCommunes > 0 ? totalExcess * (communeCurrentTotal / sumAllCommunes) : 0;
    return {
      isExceeded: true,
      totalExcess: Math.round(totalExcess * 100) / 100,
      communeReduction: Math.round(communeReduction * 100) / 100,
      finalAdjustedTGTSP:
        Math.round((communeCurrentTotal - communeReduction) * 100) / 100,
    };
  }

  return {
    isExceeded: false,
    totalExcess: 0,
    communeReduction: 0,
    finalAdjustedTGTSP: Math.round(communeCurrentTotal * 100) / 100,
  };
}

/**
 * Tính tốc độ tăng trưởng TGTSP (Mục III Phụ lục I)
 */
export function calculateGrowthRate(
  currentYearTGTSP: number,
  previousYearTGTSP: number
): number {
  if (!previousYearTGTSP || previousYearTGTSP === 0) return 0;
  // Tốc độ tăng TGTSP (%) = (TGTSPn / TGTSPn-1) * 100 - 100
  const rate = (currentYearTGTSP / previousYearTGTSP) * 100 - 100;
  return Math.round(rate * 100) / 100;
}

/**
 * Tính tốc độ tăng bình quân năm của một thời kỳ (ví dụ 2026-2030, n=5 năm)
 * Tốc độ tăng TGTSP bình quân năm (%) = [(TGTSPn / TGTSP0)^(1/n) - 1] * 100
 */
export function calculateAverageAnnualGrowthRate(
  finalYearTGTSP: number,
  baseYearTGTSP: number,
  years: number
): number {
  if (!baseYearTGTSP || baseYearTGTSP <= 0 || years <= 0) return 0;
  const ratio = finalYearTGTSP / baseYearTGTSP;
  const avgRate = (Math.pow(ratio, 1 / years) - 1) * 100;
  return Math.round(avgRate * 100) / 100;
}

/**
 * Kiểm tra hợp lệ thành viên hộ theo 5 trường hợp được tính và 2 trường hợp loại trừ
 * Theo Mục II.4 Phụ lục II - QĐ 2545/QĐ-BTC
 */
export function evaluateHouseholdMember(
  member: Omit<HouseholdMember, "isCountedAsMember">
): {
  isCounted: boolean;
  reason: string;
} {
  // 2 trường hợp ngoại lệ KHÔNG ĐƯỢC TÍNH:
  if (member.specialCaseRule === "EXCLUDED_MAID") {
    return {
      isCounted: false,
      reason:
        "Quy tắc loại trừ 1: Người giúp việc có gia đình riêng/quỹ thu chi riêng (dù ở > 6 tháng) không tính vào nhân khẩu hộ.",
    };
  }
  if (member.specialCaseRule === "EXCLUDED_DECEASED_LEFT") {
    return {
      isCounted: false,
      reason:
        "Quy tắc loại trừ 2: Người đã chết hoặc chuyển đi lâu dài trong 12 tháng qua không tính vào nhân khẩu của hộ.",
    };
  }

  // 5 trường hợp ngoại lệ ĐƯỢC TÍNH dù ở chưa đủ 6 tháng:
  if (member.specialCaseRule === "RULE_1_HEAD_ABSENT") {
    return {
      isCounted: true,
      reason:
        "Trường hợp ngoại lệ 1: Chủ hộ đi làm xa không ăn ở > 6 tháng nhưng là trụ cột, chi phối kinh tế và gửi tiền về.",
    };
  }
  if (member.specialCaseRule === "RULE_2_NEWBORN") {
    return {
      isCounted: true,
      reason:
        "Trường hợp ngoại lệ 2: Trẻ em mới sinh ra chưa đầy 6 tháng được tính là thành viên hộ.",
    };
  }
  if (member.specialCaseRule === "RULE_3_NEW_PERMANENT") {
    return {
      isCounted: true,
      reason:
        "Trường hợp ngoại lệ 3: Con dâu/rể mới cưới, người xuất ngũ, nghỉ hưu mới về hộ ở lâu dài tương lai.",
    };
  }
  if (member.specialCaseRule === "RULE_4_STUDENT_PATIENT") {
    return {
      isCounted: true,
      reason:
        "Trường hợp ngoại lệ 4: Học sinh, sinh viên, người đi chữa bệnh xa nhà > 6 tháng nhưng hộ phải nuôi toàn bộ.",
    };
  }
  if (member.specialCaseRule === "RULE_5_LONG_GUEST") {
    return {
      isCounted: true,
      reason:
        "Trường hợp ngoại lệ 5: Khách, họ hàng đến ở > 6 tháng và hộ gia đình phải nuôi toàn bộ.",
    };
  }

  // Tiêu chuẩn chung: Cùng ăn, ở từ 6 tháng trở lên và có chung quỹ thu chi
  if (member.monthsLivedInPast12Months >= 6) {
    return {
      isCounted: true,
      reason: "Đạt chuẩn: Ăn chung, ở chung từ 6 tháng trở lên và có chung quỹ thu chi.",
    };
  } else {
    return {
      isCounted: false,
      reason:
        "Không đạt: Ở dưới 6 tháng và không thuộc 5 trường hợp ngoại lệ được tính theo QĐ 2545.",
    };
  }
}

/**
 * Tính toán tổng hợp thu nhập của 1 hộ gia đình từ 7 mục
 * Đơn vị tiền tệ: 1.000 VNĐ (nghìn đồng) theo đúng biểu mẫu QĐ 2545
 */
export function calculateHouseholdIncomeBreakdown(survey: HouseholdSurveyRecord) {
  // Mục 1: Tiền lương, tiền công & trợ cấp thường xuyên
  const section1_salary = (survey.salaryItems || []).reduce(
    (sum, item) =>
      sum +
      (item.salaryAndAllowances || 0) +
      (item.pensionAndSeverance || 0) +
      (item.socialAssistance || 0),
    0
  );

  // Mục 2: Trồng trọt (Thu = Bán + Tự dùng; Chi = Giống + Phân thuốc + Chi khác)
  let section2_harvest = 0;
  let section2_cost = 0;
  (survey.cropItems || []).forEach((c) => {
    section2_harvest += (c.harvestValueSold || 0) + (c.harvestValueSelfUsed || 0);
    section2_cost +=
      (c.seedCost || 0) +
      (c.fertilizerPesticideCost || 0) +
      (c.otherCost || 0);
  });
  const section2_net = section2_harvest - section2_cost;

  // Mục 3: Chăn nuôi (Thu = Bán + Tự dùng; Chi = Giống + Thức ăn thuốc + Chi khác)
  let section3_harvest = 0;
  let section3_cost = 0;
  (survey.livestockItems || []).forEach((l) => {
    section3_harvest += (l.valueSold || 0) + (l.valueSelfUsed || 0);
    section3_cost +=
      (l.breedCost || 0) +
      (l.feedAndMedicineCost || 0) +
      (l.otherCost || 0);
  });
  const section3_net = section3_harvest - section3_cost;

  // Mục 4: Lâm nghiệp
  let section4_harvest = 0;
  let section4_cost = 0;
  (survey.forestryItems || []).forEach((f) => {
    section4_harvest += (f.harvestValueSold || 0) + (f.harvestValueSelfUsed || 0);
    section4_cost +=
      (f.breedCost || 0) + (f.fertilizerCost || 0) + (f.otherCost || 0);
  });
  const section4_net = section4_harvest - section4_cost;

  // Mục 5: Thủy sản
  let section5_harvest = 0;
  let section5_cost = 0;
  (survey.fisheryItems || []).forEach((f) => {
    section5_harvest += (f.harvestValueSold || 0) + (f.harvestValueSelfUsed || 0);
    section5_cost +=
      (f.breedCost || 0) + (f.feedAndMedicineCost || 0) + (f.otherCost || 0);
  });
  const section5_net = section5_harvest - section5_cost;

  // Mục 6: SXKD phi nông lâm thủy sản, chế biến
  let section6_revenue = 0;
  let section6_cost = 0;
  (survey.nonFarmItems || []).forEach((nf) => {
    section6_revenue += (nf.valueSold || 0) + (nf.valueSelfUsed || 0);
    section6_cost +=
      (nf.materialCost || 0) + (nf.energyCost || 0) + (nf.otherCost || 0);
  });
  const section6_net = section6_revenue - section6_cost;

  // Mục 7: Thu nhập khác (Kiều hối, quà biếu mừng, bão lũ, lãi vay, thuê nhà, xổ số)
  const section7_net = (survey.otherIncomeItems || []).reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  );

  // Tổng thu nhập thuần của hộ
  const totalNetIncome =
    section1_salary +
    section2_net +
    section3_net +
    section4_net +
    section5_net +
    section6_net +
    section7_net;

  // Đếm số thành viên hợp lệ
  const validMembersCount = (survey.members || []).filter((m) => {
    const evalRes = evaluateHouseholdMember(m);
    return evalRes.isCounted;
  }).length;

  const perCapitaAnnual =
    validMembersCount > 0 ? totalNetIncome / validMembersCount : 0;
  const perCapitaMonthly = perCapitaAnnual / 12;

  return {
    section1_salary,
    section2_crops: { harvest: section2_harvest, cost: section2_cost, net: section2_net },
    section3_livestock: { harvest: section3_harvest, cost: section3_cost, net: section3_net },
    section4_forestry: { harvest: section4_harvest, cost: section4_cost, net: section4_net },
    section5_fishery: { harvest: section5_harvest, cost: section5_cost, net: section5_net },
    section6_nonFarm: { revenue: section6_revenue, cost: section6_cost, net: section6_net },
    section7_other: section7_net,
    totalNetIncome,
    validMembersCount,
    perCapitaAnnual: Math.round(perCapitaAnnual),
    perCapitaMonthly: Math.round(perCapitaMonthly),
  };
}

/**
 * Tính toán Thu nhập bình quân đầu người toàn xã (TNBQ cấp xã)
 * Đơn vị kết quả: Triệu đồng/người/năm & Nghìn đồng/người/tháng
 */
export function calculateCommuneTNBQ(profile?: CommuneProfile | null) {
  if (!profile || !profile.surveys || profile.surveys.length === 0) {
    return {
      sampleHouseholdsCount: 0,
      samplePopulationCount: 0,
      sampleTotalIncomeThousandVND: 0,
      averagePerCapitaAnnualThousandVND: 0,
      averagePerCapitaAnnualMillionVND: 0,
      averagePerCapitaMonthlyThousandVND: 0,
      estimatedCommuneTotalIncomeBillionVND: 0,
    };
  }

  let totalSampleIncome = 0;
  let totalSampleMembers = 0;

  (profile.surveys || []).forEach((survey) => {
    const calc = calculateHouseholdIncomeBreakdown(survey);
    totalSampleIncome += calc.totalNetIncome;
    totalSampleMembers += calc.validMembersCount;
  });

  const avgPerCapitaAnnual =
    totalSampleMembers > 0 ? totalSampleIncome / totalSampleMembers : 0;
  const avgPerCapitaMonthly = avgPerCapitaAnnual / 12;
  const avgPerCapitaMillion = avgPerCapitaAnnual / 1000;

  // Ước lượng tổng thu nhập toàn xã (suy rộng theo tổng nhân khẩu xã)
  const totalPopulation = profile.totalPopulation || 0;
  const totalCommuneIncomeThousand = avgPerCapitaAnnual * totalPopulation;
  const estimatedCommuneTotalIncomeBillionVND =
    totalCommuneIncomeThousand / 1_000_000;

  return {
    sampleHouseholdsCount: (profile.surveys || []).length,
    samplePopulationCount: totalSampleMembers,
    sampleTotalIncomeThousandVND: Math.round(totalSampleIncome),
    averagePerCapitaAnnualThousandVND: Math.round(avgPerCapitaAnnual),
    averagePerCapitaAnnualMillionVND: Math.round(avgPerCapitaMillion * 100) / 100,
    averagePerCapitaMonthlyThousandVND: Math.round(avgPerCapitaMonthly),
    estimatedCommuneTotalIncomeBillionVND:
      Math.round(estimatedCommuneTotalIncomeBillionVND * 100) / 100,
  };
}

/**
 * Định dạng số tiền kiểu Việt Nam (ví dụ 1.250.000)
 */
export function formatVND(value: number, unit = ""): string {
  if (value === undefined || value === null || isNaN(value)) return "0 " + unit;
  return value.toLocaleString("vi-VN") + (unit ? " " + unit : "");
}
