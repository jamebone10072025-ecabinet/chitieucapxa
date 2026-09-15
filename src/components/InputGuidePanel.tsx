import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  FileSpreadsheet,
  Users,
  DollarSign,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  X,
  Compass,
} from "lucide-react";

interface InputGuidePanelProps {
  currentTab?: "tgtsp" | "tnbq" | "report" | "handbook";
  onSwitchTab?: (tab: "tgtsp" | "tnbq" | "report" | "handbook") => void;
}

export const InputGuidePanel: React.FC<InputGuidePanelProps> = ({
  currentTab,
  onSwitchTab,
}) => {
  // Save collapsed state to localStorage
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("QD2545_GUIDE_EXPANDED");
    return saved !== null ? saved === "true" : true;
  });

  // Active guide tab: "tgtsp" | "tnbq" | "traps" | "workflow"
  const [activeGuide, setActiveGuide] = useState<"tgtsp" | "tnbq" | "traps" | "workflow">(
    currentTab === "tnbq" ? "tnbq" : "tgtsp"
  );

  // Sync activeGuide when external currentTab changes
  useEffect(() => {
    if (currentTab === "tnbq") {
      setActiveGuide("tnbq");
    } else if (currentTab === "tgtsp") {
      setActiveGuide("tgtsp");
    }
  }, [currentTab]);

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem("QD2545_GUIDE_EXPANDED", String(next));
  };

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 shadow-xs transition-all duration-200 overflow-hidden no-print">
      {/* Top Banner Header */}
      <div className="px-4 py-3 bg-amber-100/60 border-b border-amber-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Sổ tay hướng dẫn nhập liệu chuẩn Quyết định 2545/QĐ-BTC
              </h3>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 border border-amber-300/60">
                Dành cho cán bộ xã mới
              </span>
            </div>
            <p className="text-xs text-slate-600 hidden md:block">
              Quy tắc xác định doanh thu, chi phí trung gian (IC), 7 khoản thu nhập và các khoản cấm kỵ khi tính chỉ tiêu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Collapsible toggle button */}
          <button
            onClick={toggleExpand}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg shadow-2xs transition cursor-pointer"
            title={isExpanded ? "Thu gọn bảng hướng dẫn" : "Mở rộng bảng hướng dẫn"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Thu gọn</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Mở xem hướng dẫn</span>
                <span className="sm:hidden">Mở</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content Panel */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Guide Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-amber-200/60 pb-3">
            <button
              onClick={() => setActiveGuide("tgtsp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeGuide === "tgtsp"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>1. Hướng dẫn nhập TGTSP (Phụ lục I)</span>
            </button>

            <button
              onClick={() => setActiveGuide("tnbq")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeGuide === "tnbq"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Hướng dẫn điều tra TNBQ (Phụ lục II)</span>
            </button>

            <button
              onClick={() => setActiveGuide("traps")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeGuide === "traps"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>4 Bẫy số liệu cấm kỵ (Sai phạm thường gặp)</span>
            </button>

            <button
              onClick={() => setActiveGuide("workflow")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeGuide === "workflow"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Quy trình 4 bước biên soạn chuẩn</span>
            </button>
          </div>

          {/* Tab 1: TGTSP Guidance */}
          {activeGuide === "tgtsp" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
              {/* Group I */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-emerald-100 pb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black">
                    I
                  </span>
                  <span>Ngành Nông - Lâm - Thủy sản (Mã A)</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Nguồn dữ liệu:</strong> Sổ thống kê nông nghiệp xã, báo cáo năng suất mùa vụ, thống kê tổng đàn gia súc gia cầm.
                  </p>
                  <p>
                    <strong className="text-slate-800">Doanh thu (GO):</strong> Sản lượng thu hoạch (thóc, cây ăn quả, thịt hơi, thủy sản xuất bán...) × Giá bán tại cổng trại.
                  </p>
                  <p>
                    <strong className="text-slate-800">Chi phí trung gian (IC):</strong> Giống cây/con, phân bón, thuốc BVTV, thức ăn chăn nuôi, xăng dầu máy cày bừa. Tỷ lệ IC thường chiếm 35% - 50% GO.
                  </p>
                  <div className="p-2 bg-emerald-50 rounded text-[11px] text-emerald-900 border border-emerald-200/70">
                    💡 <em>Lưu ý:</em> Sản phẩm tự sản tự tiêu (gia đình tự ăn, trữ làm giống) vẫn phải tính vào GO theo giá thị trường địa phương.
                  </div>
                </div>
              </div>

              {/* Group II */}
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold border-b border-blue-100 pb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-black">
                    II
                  </span>
                  <span>Công nghiệp & Xây dựng (Mã B - F)</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Doanh nghiệp/HTX:</strong> Khai thác từ báo cáo tài chính hoặc bảng phân bổ của Cục Thống kê (nếu doanh nghiệp hạch toán toàn ngành).
                  </p>
                  <p>
                    <strong className="text-slate-800">Cơ sở cá thể:</strong> Lò bánh mì, xưởng mộc, gò hàn, may mặc, xay xát: Doanh thu gia công/bán hàng trừ chi phí nguyên vật liệu đầu vào.
                  </p>
                  <p>
                    <strong className="text-slate-800">Xây dựng dân dụng:</strong> Giá trị các công trình nhà ở riêng lẻ của dân + công trình hạ tầng thôn xã xây dựng trong năm.
                  </p>
                  <div className="p-2 bg-blue-50 rounded text-[11px] text-blue-900 border border-blue-200/70">
                    💡 <em>Lưu ý:</em> Tuyệt đối không tính trùng giá trị vật liệu xây dựng nếu xưởng sản xuất gạch đá đã kê khai ở ngành sản xuất.
                  </div>
                </div>
              </div>

              {/* Group III */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold border-b border-amber-100 pb-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-black">
                    III
                  </span>
                  <span>Dịch vụ & Quản lý nhà nước (Mã G - U)</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Thương nghiệp bán lẻ:</strong> GO tính theo <em>Mức thặng dư thương nghiệp</em> (Doanh thu bán ra - Giá vốn mua vào hàng hóa). Không lấy tổng doanh thu bán hàng!
                  </p>
                  <p>
                    <strong className="text-slate-800">Vận tải, Lưu trú, Ăn uống:</strong> Doanh thu cước vận chuyển, tiền khách sạn, quán ăn trừ chi phí nhiên liệu, thực phẩm.
                  </p>
                  <p>
                    <strong className="text-slate-800">Khối QLNN & Giáo dục/Y tế xã:</strong> GO = Tổng quỹ tiền lương, phụ cấp + Chi hành chính thường xuyên + Khấu hao nhà làm việc; IC = Chi văn phòng phẩm, điện, nước.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: TNBQ Guidance */}
          {activeGuide === "tnbq" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
              {/* Box 1: Sample & Population */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Quy tắc chọn mẫu & Nhân khẩu</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Cỡ mẫu điều tra:</strong> Tối thiểu 30-60 hộ (theo số lượng hộ của xã) đại diện đủ các thôn, đủ nhóm khá, trung bình, nghèo.
                  </p>
                  <p>
                    <strong className="text-slate-800">Quy tắc 6 tháng:</strong> Nhân khẩu thực tế thường trú là người đã sống tại hộ từ 6 tháng trở lên trong 12 tháng qua và cùng ăn chung quỹ tiêu dùng.
                  </p>
                  <p>
                    <strong className="text-slate-800">Trường hợp đặc biệt:</strong> Sinh viên đang đi học nhưng phụ thuộc tài chính vào gia đình; người đang đi nghĩa vụ quân sự vẫn được tính vào nhân khẩu hộ.
                  </p>
                </div>
              </div>

              {/* Box 2: 7 Income Sources */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>7 Khoản thu nhập hợp lệ</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p>1. Tiền công, tiền lương, tiền thưởng từ việc làm.</p>
                  <p>2. Thu từ trồng trọt, chăn nuôi, lâm nghiệp, thủy sản (đã trừ chi phí sản xuất).</p>
                  <p>3. Thu từ sản xuất kinh doanh phi nông nghiệp, buôn bán, dịch vụ.</p>
                  <p>4. Thu từ tiền lãi gửi tiết kiệm, cổ tức, tiền cho thuê nhà, đất đai.</p>
                  <p>5. Trợ cấp bảo trợ xã hội, lương hưu, trợ cấp người có công.</p>
                  <p>6. Tiền kiều hối, quà biếu tặng bằng tiền/hiện vật từ người thân.</p>
                  <p>7. Các khoản thu khác phát sinh thực tế.</p>
                </div>
              </div>

              {/* Box 3: Deduction of Costs */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Nguyên tắc trừ chi phí sản xuất</span>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Bắt buộc lấy Thu thuần (Net):</strong> Thu nhập từ nông nghiệp hoặc kinh doanh cá thể phải là doanh thu <em>sau khi đã trừ toàn bộ chi phí sản xuất</em> (giống, phân, thuốc, thức ăn, thuê nhân công, khấu hao dụng cụ).
                  </p>
                  <p>
                    <strong className="text-slate-800">Công thức tính:</strong>
                    <span className="block font-mono bg-slate-100 p-1 rounded mt-1 text-slate-800">
                      TNBQ = Tổng thu nhập thực tế / (Số nhân khẩu × 12 tháng)
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hệ thống tự động quy đổi ra triệu đồng/người/năm để so sánh với chuẩn NTM (≥ 68 triệu đồng).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Data Traps */}
          {activeGuide === "traps" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-800 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>CẢNH BÁO NGUYÊN TẮC: 4 KHOẢN TUYỆT ĐỐI KHÔNG TÍNH VÀO THU NHẬP HỘ</span>
                </div>
                <p className="text-rose-700 leading-relaxed">
                  Rất nhiều cán bộ xã lần đầu điều tra thường nhầm lẫn các giao dịch luân chuyển vốn dưới đây là thu nhập, dẫn đến số liệu TNBQ bị thổi phồng ảo:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>Rút tiền gửi tiết kiệm</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Đây là tiền tích lũy từ các năm trước hoặc chuyển đổi từ tài sản tài chính sang tiền mặt. Chỉ tính phần <strong>tiền lãi phát sinh</strong> trong năm.
                  </p>
                </div>

                <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>Bán nhà đất, tài sản lớn</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Bán đất ở, đất nông nghiệp, bán nhà cửa, xe cộ là chuyển dịch hình thái vốn tài sản cố định sang tiền tệ, không phản ánh năng lực tạo thu nhập thường xuyên.
                  </p>
                </div>

                <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>Tiền đi vay mượn nợ</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Vay ngân hàng chính sách, vay tín dụng hoặc vay người thân là nghĩa vụ nợ phải trả, không được coi là thu nhập tạo ra của hộ dân.
                  </p>
                </div>

                <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <span>Tiền đền bù giải phóng mặt bằng</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Tiền bồi thường đất và tài sản khi thu hồi đất công ích là bù đắp hao hụt tài sản bị thu hồi, quy định thống kê quốc gia không xếp vào thu nhập khả dụng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Step-by-step Workflow */}
          {activeGuide === "workflow" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>Thu thập số liệu sơ cấp</span>
                </div>
                <p className="text-slate-600">
                  Lập danh sách cơ sở kinh tế thường trú trên địa bàn xã. Lập danh sách mẫu điều tra 30-60 hộ dân tại các thôn/làng.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Bóc tách GO & Chi phí IC</span>
                </div>
                <p className="text-slate-600">
                  Phân loại theo mã ngành VSIC. Xác định chính xác Doanh thu (GO) và Chi phí trung gian (IC) để tính Giá trị tăng thêm (VA = GO - IC).
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>Áp chỉ số giá & Tính tăng trưởng</span>
                </div>
                <p className="text-slate-600">
                  Áp dụng chỉ số giá sản xuất (I_P) do Cục Thống kê tỉnh ban hành để đưa về Giá so sánh. Tính tốc độ tăng trưởng liên năm và bình quân kỳ.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                    4
                  </span>
                  <span>Thẩm định & Xuất báo cáo A4</span>
                </div>
                <p className="text-slate-600">
                  Sử dụng trợ lý AI thẩm định đối soát logic số liệu. In biểu mẫu A4 chuẩn công vụ trình Chủ tịch UBND xã ký duyệt gửi cơ quan Thống kê.
                </p>
              </div>
            </div>
          )}

          {/* Quick Helper Tips & AI Prompt hint */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-amber-200/60 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Mẹo nhanh:</strong> Nếu gặp tình huống số liệu phức tạp chưa rõ cách phân bổ, hãy nhấn nút <strong>"Trợ lý AI QĐ 2545"</strong> trên thanh tiêu đề để được giải đáp tức thời!
              </span>
            </div>

            {onSwitchTab && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSwitchTab("handbook")}
                  className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  <span>Xem cẩm nang chi tiết</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
