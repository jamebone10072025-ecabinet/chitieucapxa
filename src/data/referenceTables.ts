/**
 * Dữ liệu tra cứu và danh mục nguồn biểu mẫu
 * Theo Quyết định số 2545/QĐ-BTC ngày 14/09/2026 của Bộ Tài chính
 */

export interface NationalSurveySource {
  tableNumber: number;
  industry: string;
  systemName: string;
  accessUrl: string;
  reportForm: string;
  extractionSteps: string[];
}

export const NATIONAL_SURVEY_SOURCES: NationalSurveySource[] = [
  {
    tableNumber: 1,
    industry: "Nông nghiệp, Lâm nghiệp và Thủy sản (NLTS)",
    systemName: "Hệ thống phần mềm điều tra NLTS - Cục Thống kê",
    accessUrl: "Hệ thống nội bộ Ngành Thống kê",
    reportForm: "Biểu đầu ra - Điều tra Nông, Lâm nghiệp, Thủy sản",
    extractionSteps: [
      "Đăng nhập chương trình phần mềm điều tra NLTS",
      "Chọn menu: Tổng hợp",
      "Chọn hệ biểu: Tổng hợp diện tích cây hàng năm/lâu năm; số lượng/sản lượng chăn nuôi; lâm nghiệp; thủy sản cấp xã",
      "Khai thác giá sản phẩm NLTS và chỉ số giá từ phần mềm tính GTSX NLTS cấp tỉnh",
    ],
  },
  {
    tableNumber: 2,
    industry: "Ngành Công nghiệp",
    systemName: "Hệ thống Điều tra Doanh nghiệp hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 1 (Tổng hợp GTSX cấp xã); Biểu 3 (GTSX giá cơ bản theo giá hiện hành cấp xã)",
    extractionSteps: [
      "Đăng nhập phần mềm https://thongkedoanhnghiep.nso.gov.vn",
      "Chọn menu: Tổng hợp / Công nghiệp, Xây dựng / GTSX / 34 tỉnh/thành phố",
      "Chọn Biểu GTSX theo DN, Chi nhánh",
      "Chọn Biểu 1: Biểu tổng hợp GTSX và chọn cấp tổng hợp là xã",
      "Chọn Biểu 3: GTSX giá cơ bản theo giá hiện hành cấp xã",
    ],
  },
  {
    tableNumber: 3,
    industry: "Ngành Xây dựng",
    systemName: "Hệ thống Điều tra Vốn đầu tư & Xây dựng",
    accessUrl: "https://vondautuxaydung.nso.gov.vn",
    reportForm: "BIỂU 3-XP-SL suy rộng: GTSX xây dựng khu vực xã",
    extractionSteps: [
      "Đăng nhập https://vondautuxaydung.nso.gov.vn",
      "Chọn menu: Tổng hợp báo cáo, Xây dựng, Kỳ quý, xã",
      "Chọn BIỂU 3-XP-SL suy rộng",
      "Chọn cấp hiển thị đến cấp xã",
    ],
  },
  {
    tableNumber: 4,
    industry: "Ngành Bán buôn, Bán lẻ (Thương nghiệp)",
    systemName: "Điều tra DN và Điều tra Cơ sở cá thể hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn & https://cathenam.nso.gov.vn",
    reportForm: "Biểu 010.N, BCC-TMDV (Doanh nghiệp & Cá thể)",
    extractionSteps: [
      "Bước 1 (Khối DN): Vào phần mềm DN, chọn Biểu 010.N, BCC-TMDV, cấp tổng hợp là xã; lấy Doanh thu thuần và Trị giá vốn hàng bán từng ngành cấp 2",
      "Bước 2 (Khối Cá thể): Vào phần mềm cá thể, chọn Biểu 010.N, BCC-TMDV, cấp xã; lấy Doanh thu và Vốn hàng bán",
      "Bước 3: Doanh thu thuần xã = DN + Cá thể; Trị giá vốn = DN + Cá thể",
      "Bước 4: Giá trị sản phẩm thương nghiệp = Doanh thu thuần - Trị giá vốn hàng bán",
    ],
  },
  {
    tableNumber: 5,
    industry: "Ngành Vận tải, kho bãi",
    systemName: "Điều tra DN & Điều tra Cá thể hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn & https://cathenam.nso.gov.vn",
    reportForm: "Biểu 016.N (Hành khách), 017.N (Hàng hóa), 018.N (Kho bãi, hỗ trợ) BCC-TMDV",
    extractionSteps: [
      "Tổng hợp doanh thu thuần ngành 49, 50 từ Biểu 16 + Biểu 17",
      "Tổng hợp doanh thu thuần ngành 52, 53 từ Biểu 18",
      "Cộng dồn Khối Doanh nghiệp + Khối Cá thể trên địa bàn xã",
    ],
  },
  {
    tableNumber: 6,
    industry: "Ngành Dịch vụ lưu trú, ăn uống",
    systemName: "Điều tra DN & Điều tra Cá thể hàng năm",
    accessUrl: "Hệ thống điều tra Thương mại Dịch vụ",
    reportForm: "Biểu 011.N, BCC-TMDV (Lưu trú, ăn uống và du lịch lữ hành)",
    extractionSteps: [
      "Khối DN: Biểu 011.N cấp xã, lấy doanh thu thuần và trị giá vốn hàng chuyển bán ăn uống",
      "Khối Cá thể: Biểu 011.N cấp xã, lấy doanh thu thuần và trị giá vốn ăn uống",
      "Giá trị sản phẩm = Doanh thu thuần (DN+Cá thể) - Trị giá vốn chuyển bán (DN+Cá thể)",
    ],
  },
  {
    tableNumber: 7,
    industry: "Ngành Thông tin và Truyền thông",
    systemName: "Điều tra DN & Cá thể hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 013.N, BCC-TMDV",
    extractionSteps: [
      "Tổng hợp doanh thu hoạt động xuất bản, phát sóng, sản xuất nội dung, lập trình máy tính, tư vấn CNTT từ Biểu 013.N",
      "Cộng dồn khối DN và cá thể trên địa bàn xã",
    ],
  },
  {
    tableNumber: 8,
    industry: "Ngành Kinh doanh Bất động sản",
    systemName: "Điều tra DN & Cá thể hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 014.N, BCC-TMDV",
    extractionSteps: [
      "Biểu 014.N: Lấy doanh thu và giá vốn BĐS đã bán của dịch vụ kinh doanh BĐS trên địa bàn xã",
      "GTSP BĐS = Doanh thu - Giá vốn BĐS đã bán",
    ],
  },
  {
    tableNumber: 9,
    industry: "Hoạt động chuyên môn, khoa học và công nghệ",
    systemName: "Điều tra Doanh nghiệp & Cá thể",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 02-TH, TKQG GTSX (ngành 69, 70, 71, 72, 73, 74, 75) & Biểu 013.N cá thể",
    extractionSteps: [
      "Khai thác doanh thu khối DN từ Biểu 02-TH cấp xã",
      "Khai thác doanh thu khối cá thể từ Biểu 013.N cấp xã",
      "Cộng dồn kết quả tính GTSP chuyên môn KHCN",
    ],
  },
  {
    tableNumber: 10,
    industry: "Hoạt động hành chính và dịch vụ hỗ trợ",
    systemName: "Điều tra DN & Cá thể",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 015.N (ngành 77, 78, 80, 81, 82) & Biểu 011.N (ngành 79 lữ hành)",
    extractionSteps: [
      "Tổng hợp doanh thu thuần và chi trả hộ khách từ Biểu 015.N và 011.N cấp xã",
      "Cộng doanh thu DN và cá thể trên địa bàn",
    ],
  },
  {
    tableNumber: 11,
    industry: "Ngành Giáo dục và Đào tạo",
    systemName: "Điều tra DN & Cá thể hàng năm",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn & https://cathenam.nso.gov.vn",
    reportForm: "Biểu 02-TH, TKQG GTSX ngành 85 & Biểu 015.N cá thể ngành 85",
    extractionSteps: [
      "Khai thác doanh thu giáo dục ngoài công lập khối DN và cá thể",
      "Phần công lập nằm trong mục chi NSNN QLNN/sự nghiệp",
    ],
  },
  {
    tableNumber: 12,
    industry: "Ngành Y tế và trợ giúp xã hội",
    systemName: "Điều tra DN & Cá thể",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn & https://cathenam.nso.gov.vn",
    reportForm: "Biểu 02-TH ngành 86, 87, 88 & Biểu 013.N cá thể ngành 86, 87, 88",
    extractionSteps: [
      "Tổng hợp doanh thu phòng khám, y tế tư nhân, cơ sở bảo trợ tư nhân",
    ],
  },
  {
    tableNumber: 13,
    industry: "Nghệ thuật, vui chơi và giải trí",
    systemName: "Điều tra DN & Cá thể",
    accessUrl: "https://thongkedoanhnghiep.nso.gov.vn",
    reportForm: "Biểu 002TH / 015.N ngành 93",
    extractionSteps: [
      "Tổng hợp doanh thu thể thao, khu vui chơi, giải trí khối DN và cá thể",
    ],
  },
  {
    tableNumber: 14,
    industry: "Hoạt động dịch vụ khác (Sửa chữa, cắt tóc, giặt là...)",
    systemName: "Điều tra DN & Cá thể",
    accessUrl: "https://cathenam.nso.gov.vn",
    reportForm: "Biểu 015.N ngành 95, 96",
    extractionSteps: [
      "Tổng hợp doanh thu sửa chữa máy tính, đồ gia dụng, dịch vụ cá nhân (cắt tóc, làm đẹp, giặt là, tang lễ)",
    ],
  },
];

// Danh mục mẫu cây trồng theo QĐ 2545 (trang 39)
export const CROPS_CATALOG = [
  "Cây lúa", "Ngô/bắp", "Khoai lang", "Sắn/khoai mỳ", "Cây lương thực khác",
  "Khoai tây", "Rau muống", "Su hào", "Bắp cải, súp lơ", "Rau cải các loại",
  "Đậu ăn quả tươi các loại", "Cà chua", "Cây gia vị", "Rau củ quả khác",
  "Cây hàng năm khác (đậu xanh, đen, đỏ; hoa; cây cảnh; cỏ chăn nuôi)",
  "Đậu tương/đậu nành", "Lạc/đậu phộng", "Vừng/mè", "Mía", "Thuốc lá, thuốc lào",
  "Bông", "Đay, gai", "Cói", "Cây công nghiệp hàng năm khác",
  "Chè", "Cà phê", "Cao su", "Hồ tiêu", "Dừa", "Dâu tằm", "Điều/đào lộn hột",
  "Cây công nghiệp lâu năm khác",
  "Cam, chanh, quýt, bưởi", "Dứa", "Chuối", "Xoài, muỗm", "Táo", "Nho", "Mận",
  "Đu đủ", "Nhãn, vải, chôm chôm", "Hồng xiêm/Sa pu chê", "Na/mãng cầu", "Mít, sầu riêng",
  "Măng cụt", "Cây ăn quả khác", "Cây lâu năm khác", "Cây giống",
  "Rơm, rạ", "Lá, thân khoai lang", "Thân cây ngô, sắn", "Thân cây đậu các loại",
  "Ngọn, lá mía", "Thân cây đay, cây gai", "Dâu tằm (thân cây)", "Củi (từ cây nông nghiệp)",
  "Các sản phẩm thu nhặt, mót", "Cày xới, làm đất", "Tưới tiêu nước", "Phòng trừ sâu bệnh",
  "Tuốt lúa, sơ chế sản phẩm", "Dịch vụ trồng trọt khác"
];

// Danh mục mẫu vật nuôi theo QĐ 2545 (trang 42)
export const LIVESTOCK_CATALOG = [
  "Thịt lợn hơi", "Thịt trâu, bò hơi", "Ngựa", "Dê, cừu", "Gia súc khác",
  "Gà", "Vịt, ngan, ngỗng", "Gia cầm khác",
  "Chó", "Thỏ", "Trăn", "Rắn", "Chăn nuôi khác",
  "Trứng gia cầm (gà, vịt, ...)", "Sữa tươi", "Kén tằm", "Mật ong", "Sản phẩm khác không qua giết mổ",
  "Lợn giống", "Trâu bò giống", "Giống gia súc khác, gia cầm, vật nuôi khác",
  "Phân trâu, bò, lợn, gia cầm, phân tằm", "Sản phẩm chăn nuôi tận thu (Lông, sừng, xương, da...)",
  "Thụ tinh nhân tạo", "Thiến, hoạn gia súc gia cầm", "Dịch vụ chăn nuôi khác (phân loại, lau sạch trứng...)"
];

// Danh mục lâm sản theo QĐ 2545 (trang 44)
export const FORESTRY_CATALOG = [
  "Trẩu, sở", "Quế", "Hồi", "Thông", "Cây cánh kiến", "Cây lấy gỗ",
  "Tre, luồng, nứa", "Cọ", "Dừa nước", "Cây lâm nghiệp khác", "Củi",
  "Bảo vệ rừng", "Quản lý lâm nghiệp", "Dịch vụ tưới tiêu phục vụ lâm nghiệp, sơ chế gỗ rừng"
];

// 5 Trường hợp ngoại lệ ĐƯỢC TÍNH vào nhân khẩu hộ (Trang 33)
export const INCLUSION_RULES = [
  {
    id: "RULE_1_HEAD_ABSENT",
    title: "Chủ hộ không ăn ở thường xuyên > 6 tháng",
    detail: "Chủ hộ có vai trò điều hành, quản lý, nắm giữ kinh tế gia đình, gửi tiền nuôi dưỡng hộ nhưng đi làm ăn xa nhà."
  },
  {
    id: "RULE_2_NEWBORN",
    title: "Trẻ em mới sinh ra chưa đầy 6 tháng",
    detail: "Trẻ em sinh ra trong vòng 12 tháng qua chưa đủ 6 tháng tuổi tính đến thời điểm điều tra."
  },
  {
    id: "RULE_3_NEW_PERMANENT",
    title: "Người mới chuyển đến ở lâu dài",
    detail: "Con dâu về nhà chồng, con rể về nhà vợ; người xuất ngũ về gia đình; người kết thúc học tập/công tác/lao động từ nơi khác/nước ngoài trở về; người nghỉ hưu, mất sức."
  },
  {
    id: "RULE_4_STUDENT_PATIENT",
    title: "Học sinh, sinh viên, người đi chữa bệnh xa nhà > 6 tháng",
    detail: "Đi học hoặc điều trị bệnh xa nhà trên 6 tháng nhưng hoàn toàn phụ thuộc vào nguồn chu cấp, nuôi dưỡng của hộ."
  },
  {
    id: "RULE_5_LONG_GUEST",
    title: "Khách, họ hàng ở nhờ trên 6 tháng",
    detail: "Đã ở trong hộ từ 6 tháng trở lên và được hộ nuôi ăn ở hoàn toàn."
  }
];

// 2 Trường hợp LOẠI TRỪ KHÔNG TÍNH vào nhân khẩu hộ (Trang 34)
export const EXCLUSION_RULES = [
  {
    id: "EXCLUDED_MAID",
    title: "Người giúp việc có gia đình riêng",
    detail: "Người giúp việc có gia đình riêng ở nơi khác, có quỹ thu chi riêng dù đang ở chung nhà, ăn chung với hộ trên 6 tháng."
  },
  {
    id: "EXCLUDED_DECEASED_LEFT",
    title: "Người đã chuyển đi lâu dài hoặc người đã chết",
    detail: "Người đã chết trong 12 tháng qua hoặc đã chuyển hẳn khẩu/chỗ ở đi nơi khác lâu dài, dù trước đó đã ở trong hộ trên 6 tháng."
  }
];

// Các khoản tuyệt đối KHÔNG TÍNH vào thu nhập hộ (Trang 32)
export const EXCLUDED_CAPITAL_TRANSACTIONS = [
  "Tiền rút tiền tiết kiệm từ ngân hàng",
  "Thu hồi các khoản nợ cũ người khác trả lại",
  "Bán tài sản gia đình sẵn có (bán nhà, đất, xe máy, ô tô, tivi, tủ lạnh...)",
  "Khoản tiền đi vay nợ, tiền nhận tạm ứng",
  "Chuyển nhượng vốn góp, cổ phần, cổ phiếu, trái phiếu",
  "Tiền bán/chuyển nhượng quyền sử dụng đất và tài sản gắn liền với đất",
  "Tiền bồi thường đất do Nhà nước giải tỏa mặt bằng, thu hồi đất"
];
