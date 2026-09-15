import React, { useState } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldAlert,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  NATIONAL_SURVEY_SOURCES,
  CROPS_CATALOG,
  LIVESTOCK_CATALOG,
  FORESTRY_CATALOG,
  INCLUSION_RULES,
  EXCLUSION_RULES,
  EXCLUDED_CAPITAL_TRANSACTIONS,
} from "../data/referenceTables";

export const HandbookModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "sources" | "rules" | "excluded" | "catalogs" | "formulas"
  >("sources");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredSources = NATIONAL_SURVEY_SOURCES.filter(
    (s) =>
      s.industry.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.systemName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.reportForm.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header of Handbook */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
              CẨM NANG NGHIỆP VỤ THỐNG KÊ
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Hướng dẫn biên soạn theo Quyết định số 2545/QĐ-BTC
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tra cứu nhanh quy tắc nghiệp vụ, 14 bảng nguồn biểu mẫu quốc gia, quy định nhân khẩu và công thức tính.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bảng nguồn, biểu số, ngành..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 w-56"
              />
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSection("sources")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeSection === "sources"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            14 bảng nguồn biểu mẫu quốc gia (Mục IV)
          </button>
          <button
            onClick={() => setActiveSection("rules")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeSection === "rules"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Quy tắc nhân khẩu (5 vào - 2 ra)
          </button>
          <button
            onClick={() => setActiveSection("excluded")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeSection === "excluded"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Khoản vốn tuyệt đối không tính thu nhập
          </button>
          <button
            onClick={() => setActiveSection("catalogs")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeSection === "catalogs"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Danh mục cây trồng, vật nuôi & lâm sản
          </button>
          <button
            onClick={() => setActiveSection("formulas")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeSection === "formulas"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Nguyên tắc khống chế trần GTSX tỉnh
          </button>
        </div>
      </div>

      {/* SECTION 1: 14 BẢNG NGUỒN BIỂU MẪU */}
      {activeSection === "sources" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((s) => (
            <div
              key={s.tableNumber}
              className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 hover:border-amber-400 transition space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                    BẢNG {s.tableNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {s.industry}
                  </h4>
                </div>
                {s.accessUrl.startsWith("http") ? (
                  <a
                    href={s.accessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>Truy cập</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Nội bộ</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-bold block text-[11px]">Hệ thống phần mềm:</span>
                <span className="text-slate-800 font-medium">{s.systemName}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block text-[11px]">Tên biểu mẫu khai thác:</span>
                <span className="text-indigo-700 font-semibold">{s.reportForm}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mt-2">
                <span className="font-bold text-slate-700 text-[11px] block mb-1">
                  Quy trình trích xuất thông tin:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  {s.extractionSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: QUY TẮC NHÂN KHẨU */}
      {activeSection === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* 5 INCLUSION RULES */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  05 trường hợp ngoại lệ được tính là thành viên hộ
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Được tính dù thời gian ăn ở thực tế dưới 6 tháng (Mục II.4)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {INCLUSION_RULES.map((rule, idx) => (
                <div key={rule.id} className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{rule.title}</span>
                  </div>
                  <p className="text-slate-700 mt-1 pl-7 leading-relaxed">
                    {rule.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2 EXCLUSION RULES */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-red-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-red-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  02 trường hợp ngoại lệ bắt buộc loại trừ
                </h3>
                <span className="text-[11px] text-red-700 font-medium">
                  Không được tính dù đã ở trên 6 tháng trong 12 tháng qua
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {EXCLUSION_RULES.map((rule, idx) => (
                <div key={rule.id} className="p-3 bg-red-50/60 rounded-lg border border-red-200">
                  <div className="font-bold text-red-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{rule.title}</span>
                  </div>
                  <p className="text-slate-700 mt-1 pl-7 leading-relaxed">
                    {rule.detail}
                  </p>
                </div>
              ))}

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 leading-relaxed mt-4">
                <strong>Định nghĩa hộ chuẩn:</strong> Là một hoặc một nhóm người ăn chung, ở chung từ 6 tháng trở lên trong 12 tháng qua và có chung quỹ thu chi. Mọi khoản thu chi được đóng góp và sử dụng chung.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: CÁC KHOẢN LOẠI TRỪ KHỎI THU NHẬP */}
      {activeSection === "excluded" && (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-red-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-red-100 pb-3">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Các khoản thu tuyệt đối không được tính vào thu nhập hộ (Trang 32)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Đây là các giao dịch vốn, luân chuyển tài sản hoặc hoàn trả nợ, nếu tính vào sẽ gây sai lệch nghiêm trọng chỉ tiêu thu nhập.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXCLUDED_CAPITAL_TRANSACTIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-red-50/50 rounded-lg border border-red-200 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  &times;
                </div>
                <div>
                  <span className="font-bold text-red-950 block text-sm">
                    {item}
                  </span>
                  <span className="text-[11px] text-slate-600 mt-0.5 block">
                    Không phản ánh giá trị tăng thêm do lao động và sản xuất trong 12 tháng qua.
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-950 leading-relaxed">
            <strong>Nguyên tắc hạch toán chi phí dở dang:</strong> Đối với chăn nuôi, chỉ tính chi phí của đàn gia súc đã xuất chuồng hoặc kết thúc chu kỳ. Đối với lợn, bò đang nuôi dở dang (chưa bán, chưa giết mổ), tuyệt đối <strong>không tính chi phí thức ăn, con giống vào phiếu năm nay</strong> để tránh làm âm thu nhập của hộ một cách giả tạo.
          </div>
        </div>
      )}

      {/* SECTION 4: CATALOGS */}
      {activeSection === "catalogs" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Crops */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
              <span>Danh mục cây trồng (63 nguồn)</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Trang 39</span>
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {CROPS_CATALOG.map((c, idx) => (
                <div key={idx} className="pt-1 text-slate-700 flex items-center gap-2">
                  <span className="text-slate-400 text-[10px] w-5">{idx + 1}.</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Livestock */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
              <span>Danh mục vật nuôi (26 nguồn)</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Trang 42</span>
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {LIVESTOCK_CATALOG.map((l, idx) => (
                <div key={idx} className="pt-1 text-slate-700 flex items-center gap-2">
                  <span className="text-slate-400 text-[10px] w-5">{idx + 1}.</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forestry */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
              <span>Danh mục lâm nghiệp (14 nguồn)</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Trang 44</span>
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {FORESTRY_CATALOG.map((f, idx) => (
                <div key={idx} className="pt-1 text-slate-700 flex items-center gap-2">
                  <span className="text-slate-400 text-[10px] w-5">{idx + 1}.</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: FORMULAS */}
      {activeSection === "formulas" && (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base border-b pb-2">
            Nguyên tắc khống chế trần GTSX tỉnh & công thức điều chỉnh (Mục 1.3 & 2.5)
          </h3>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 font-mono text-xs space-y-2 text-slate-900">
            <div className="font-bold text-sm text-indigo-900">
              1. Điều kiện khống chế trần:
            </div>
            <div>
              &sum; TGTSP các xã trong tỉnh &le; GTSX tương ứng của tỉnh
            </div>
            <div className="font-bold text-sm text-indigo-900 pt-2">
              2. Công thức phân bổ điều chỉnh chênh lệch cho từng xã:
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 text-sm font-bold text-center text-amber-900">
              Chênh lệch giảm trừ cho xã = (&sum; TGTSP các xã - GTSX tỉnh) &times; (TGTSP xã / &sum; TGTSP các xã)
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Quy định này đảm bảo tính tương thích và liên kết chặt chẽ giữa Hệ thống chỉ tiêu cấp cơ sở với Hệ thống tài khoản quốc gia (SNA) và Tổng sản phẩm trên địa bàn (GRDP) cấp tỉnh, không để xảy ra hiện tượng "thổi phồng" thành tích ở cấp xã vượt quá quy mô kinh tế thực tế của tỉnh.
          </p>
        </div>
      )}
    </div>
  );
};
