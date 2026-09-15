/**
 * Định nghĩa Type/Interface cho Hệ thống Biên soạn 02 Chỉ tiêu Thống kê cấp xã
 * Theo Quyết định số 2545/QĐ-BTC ngày 14/09/2026 của Bộ Tài chính
 */

export type CalculationMethod =
  | "DIRECT_OUTPUT_PRICE"   // Sản lượng x Đơn giá bình quân (NLTS, khai khoáng, chế biến xác định được lượng)
  | "DIRECT_REVENUE_SUBSIDY" // Doanh thu thuần + Trợ cấp sản phẩm (Công nghiệp, dịch vụ thị trường)
  | "DIRECT_TRADE_MARGIN"   // Doanh thu thuần - Vốn hàng bán/chuyển bán (Bán buôn, bán lẻ, ăn uống, BĐS...)
  | "DIRECT_COST_PROFIT"    // Tổng chi phí sản xuất + Lợi nhuận thuần + Trợ cấp (Xây dựng, dịch vụ phi thị trường)
  | "STATE_MANAGEMENT"      // Chi thường xuyên NSNN trừ TSCĐ/trợ cấp + ngoài NSNN - điều chỉnh chênh lệch
  | "INDIRECT_ALLOCATED";   // Phân bổ gián tiếp từ tỉnh (Điện, viễn thông, ngân hàng, đơn vị đa địa điểm...)

export interface TGTSPRow {
  id: string;
  industryCode: string; // Ngành cấp 1 / cấp 2 (ví dụ: A, B, C, F, G...)
  industryName: string; // Tên phân ngành kinh tế
  isDirect: boolean; // Trực tiếp hay phân bổ
  method: CalculationMethod;
  notes?: string;

  // Dữ liệu tính toán giá hiện hành (Triệu đồng)
  quantity?: number; // Sản lượng
  unit?: string; // Đơn vị tính (Tấn, con, m3, kWh...)
  unitPrice?: number; // Đơn vị giá bình quân (Triệu đồng)
  revenue?: number; // Doanh thu thuần
  costOfGoodsSold?: number; // Trị giá vốn hàng bán / vốn chuyển bán / chi trả thưởng
  productionCost?: number; // Tổng chi phí sản xuất
  netProfit?: number; // Lợi nhuận thuần
  subsidy?: number; // Trợ cấp sản phẩm
  allocatedRatio?: number; // Tỷ trọng phân bổ của xã so với tỉnh (%)
  allocatedBaseProvincialValue?: number; // Giá trị gốc của tỉnh để phân bổ (Triệu đồng)

  // Kết quả
  currentPriceValue: number; // Giá trị sản phẩm theo giá hiện hành (Triệu đồng)
  priceIndex: number; // Chỉ số giá so với kỳ gốc của tỉnh (ví dụ 104.2%)
  constantPriceValue: number; // Giá trị sản phẩm theo giá so sánh (Triệu đồng)
}

export interface SectorSummary {
  sector: string;
  currentPrice: number;
  constantPrice: number;
  percentage: number;
}

// 7 Mục Thu nhập theo Phụ lục II
export interface SalaryIncomeItem {
  id: string;
  memberId: string;
  fullName: string;
  jobDescription: string;
  salaryAndAllowances: number; // Cột 1: Tiền lương, tiền công, phụ cấp, thưởng (quy đổi tiền + hiện vật)
  pensionAndSeverance: number; // Cột 2: Lương hưu, trợ cấp thất nghiệp, thôi việc 1 lần
  socialAssistance: number; // Cột 3: Trợ cấp xã hội thường xuyên hàng tháng
}

export interface CropIncomeItem {
  id: string;
  cropName: string;
  cropCategory: "CÂY_HÀNG_NĂM" | "CÂY_LÂU_NĂM" | "CÂY_ĂN_QUẢ" | "PHỤ_PHẨM" | "DỊCH_VỤ";
  harvestValueSold: number; // Cột 1: Giá trị đã bán/đổi/cho/biếu
  harvestValueSelfUsed: number; // Cột 2: Giá trị để lại sử dụng (SXKD, tiêu dùng, tồn kho)
  seedCost: number; // Cột 4: Chi phí giống
  fertilizerPesticideCost: number; // Cột 5: Phân bón, thuốc BVTV
  otherCost: number; // Cột 6: Chi phí khác (xăng dầu, thuê máy, thủy nông, khấu hao...)
}

export interface LivestockIncomeItem {
  id: string;
  livestockName: string;
  category: "GIA_SÚC" | "GIA_CẦM" | "SẢN_PHẨM_KHÔNG_GIẾT_MỔ" | "CON_GIỐNG" | "DỊCH_VỤ";
  valueSold: number; // Cột 1: Bán / đổi / cho / biếu
  valueSelfUsed: number; // Cột 2: Tự dùng / để lại
  breedCost: number; // Cột 4: Giống
  feedAndMedicineCost: number; // Cột 5: Thức ăn, thuốc phòng chữa bệnh
  otherCost: number; // Cột 6: Chi khác (điện, nước, khấu hao chuồng trại...)
}

export interface ForestryIncomeItem {
  id: string;
  forestryName: string;
  harvestValueSold: number;
  harvestValueSelfUsed: number;
  breedCost: number;
  fertilizerCost: number;
  otherCost: number;
}

export interface FisheryIncomeItem {
  id: string;
  fisheryName: string;
  type: "NUÔI_TRỒNG" | "ĐÁNH_BẮT" | "GIỐNG_DỊCH_VỤ";
  harvestValueSold: number;
  harvestValueSelfUsed: number;
  breedCost: number;
  feedAndMedicineCost: number;
  otherCost: number;
}

export interface NonFarmBusinessIncomeItem {
  id: string;
  activityName: string; // Tên hoạt động SXKD dịch vụ phi NLTS / chế biến
  valueSold: number; // Doanh thu bán hàng / dịch vụ
  valueSelfUsed: number; // Giá trị để lại tự dùng
  materialCost: number; // Cột 4: Nguyên vật liệu chính, phụ, thực liệu
  energyCost: number; // Cột 5: Năng lượng, nhiên liệu
  otherCost: number; // Cột 6: Chi khác (thuê mặt bằng, khấu hao TSCĐ, nhân công thuê ngoài...)
}

export interface OtherIncomeItem {
  id: string;
  category:
    | "EXTERNAL_SUPPORT" // Tiền kiều hối, người ngoài hộ cho biếu mừng
    | "DISASTER_RELIEF"   // Trợ cấp đột xuất khắc phục bão lũ, dịch bệnh
    | "PROPERTY_FINANCE"  // Cho thuê nhà/đất/máy móc, lãi tiền gửi, cổ tức
    | "LOTTERY_PRIZES";   // Trúng xổ số, trúng thưởng
  description: string;
  amount: number;
}

export interface HouseholdMember {
  id: string;
  fullName: string;
  gender: "Nam" | "Nữ";
  birthYear: number;
  relationship: "Chủ hộ" | "Vợ/Chồng" | "Con" | "Cha/Mẹ" | "Khác";
  monthsLivedInPast12Months: number;
  specialCaseRule?:
    | "NONE"
    | "RULE_1_HEAD_ABSENT"      // Chủ hộ đi làm xa > 6 tháng nhưng có quyền chi phối & gửi tiền
    | "RULE_2_NEWBORN"          // Trẻ sơ sinh chưa đủ 6 tháng
    | "RULE_3_NEW_PERMANENT"    // Con dâu/rể mới, xuất ngũ, nghỉ hưu về sống lâu dài
    | "RULE_4_STUDENT_PATIENT"  // Sinh viên/điều trị viện xa nhà được hộ nuôi hoàn toàn
    | "RULE_5_LONG_GUEST"       // Khách/họ hàng > 6 tháng được hộ nuôi trọn
    | "EXCLUDED_MAID"           // Người giúp việc có quỹ riêng (LOẠI TRỪ)
    | "EXCLUDED_DECEASED_LEFT"; // Người đã chết/chuyển đi vĩnh viễn (LOẠI TRỪ)
  isCountedAsMember: boolean; // Kết quả hợp lệ vào nhân khẩu tính TNBQ
}

export interface HouseholdSurveyRecord {
  id: string;
  code: string; // Mã hộ (ví dụ: H001, H002...)
  headName: string; // Họ tên chủ hộ
  address: string; // Thôn, xóm, ấp, tổ dân phố
  phoneNumber?: string;
  villageName: string;

  // Thành viên
  members: HouseholdMember[];

  // 7 Mục thu nhập (Đơn vị: 1.000 VNĐ - theo đúng biểu mẫu QĐ 2545)
  salaryItems: SalaryIncomeItem[];
  cropItems: CropIncomeItem[];
  livestockItems: LivestockIncomeItem[];
  forestryItems: ForestryIncomeItem[];
  fisheryItems: FisheryIncomeItem[];
  nonFarmItems: NonFarmBusinessIncomeItem[];
  otherIncomeItems: OtherIncomeItem[];

  // Ghi chú và xác thực logic
  hasExcludedCapitalTransaction: boolean; // Người phỏng vấn xác nhận đã loại trừ tiền rút tiết kiệm, bán nhà đất, tiền đền bù đất
  verificationNotes?: string;
  isVerified: boolean;
}

export interface TNBQYearlyRecord {
  year: number; // Năm thống kê (ví dụ: 2021, 2022, 2023, 2024, 2025, 2026)
  tnbqMillionVND: number; // Thu nhập bình quân đầu người (Triệu đồng/người/năm)
  ntmStandardMillionVND?: number; // Ngưỡng chuẩn tiêu chí Nông thôn mới năm đó (Triệu đồng)
  growthRatePercent?: number; // Tốc độ tăng trưởng so với năm trước (%)
  sampleSize?: number; // Cỡ mẫu điều tra (hộ)
  notes?: string; // Ghi chú sự kiện/chính sách
}

export interface CommuneProfile {
  id: string;
  communeName: string;
  districtName: string;
  provinceName: string;
  reportingYear: number;
  baseYear: number; // Năm gốc (mặc định 2025 theo văn bản)
  totalHouseholds: number; // Tổng số hộ toàn xã Nc
  totalPopulation: number; // Tổng nhân khẩu thường trú toàn xã
  sampleCount: number; // Số hộ chọn mẫu điều tra nc
  
  // Thông số kiểm soát cấp tỉnh
  provincialGTSX: number; // GTSX của toàn tỉnh theo ngành (Triệu đồng)
  sumAllCommunesTGTSP: number; // Tổng TGTSP cộng dồn của tất cả các xã trong tỉnh (Triệu đồng)

  // Chỉ tiêu 1: Danh sách các dòng TGTSP
  tgtspRows: TGTSPRow[];

  // Chỉ tiêu 2: Danh sách các phiếu điều tra mẫu hộ gia đình
  surveys: HouseholdSurveyRecord[];

  // Lịch sử biến động TNBQ qua các năm
  tnbqHistory?: TNBQYearlyRecord[];
}
