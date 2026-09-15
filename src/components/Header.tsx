import React from "react";
import {
  Building2,
  FileSpreadsheet,
  Users,
  Award,
  Sparkles,
  Printer,
  ChevronDown,
  Info,
  BookOpen,
  GitCompare,
} from "lucide-react";
import { CommuneProfile } from "../types";
import { formatVND } from "../utils/calculations";

export interface HeaderProps {
  commune: CommuneProfile;
  communesList?: CommuneProfile[];
  allCommunes?: CommuneProfile[];
  onSelectCommune: (id: string) => void;
  activeTab: "tgtsp" | "tnbq" | "report" | "cross-commune" | "handbook";
  onTabChange?: (tab: "tgtsp" | "tnbq" | "report" | "cross-commune" | "handbook") => void;
  onSelectTab?: (tab: "tgtsp" | "tnbq" | "report" | "cross-commune" | "handbook") => void;
  onOpenAIConsult?: () => void;
  onOpenAI?: () => void;
  onPrintReport?: () => void;
  onOpenExport?: () => void;
  totalCurrentTGTSP?: number;
  averagePerCapitaMillion?: number;
}

export const Header: React.FC<HeaderProps> = ({
  commune,
  communesList,
  allCommunes,
  onSelectCommune,
  activeTab,
  onTabChange,
  onSelectTab,
  onOpenAIConsult,
  onOpenAI,
  onPrintReport,
  onOpenExport,
  totalCurrentTGTSP = 0,
  averagePerCapitaMillion = 0,
}) => {
  const list = communesList || allCommunes || [];
  const handleTabChange = onTabChange || onSelectTab || (() => {});
  const handleOpenAI = onOpenAIConsult || onOpenAI || (() => {});
  const handlePrint = onPrintReport || (() => window.print());

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Ministerial Banner */}
      <div className="bg-red-800 text-white py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="bg-amber-400 text-red-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
              QUY CHUẨN QUỐC GIA
            </span>
            <span>HỆ THỐNG BIÊN SOẠN THỐNG KÊ CẤP XÃ - THEO QUYẾT ĐỊNH SỐ 2545/QĐ-BTC BỘ TÀI CHÍNH</span>
          </div>
          <div className="flex items-center gap-4 text-slate-200 text-xs">
            <span>Kỳ báo cáo: Năm {commune?.reportingYear || 2026}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Căn cứ: Luật Thống kê 2025</span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo and Titles */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-inner text-white font-serif font-black text-xl border border-amber-300/40">
              TK
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Biên soạn 02 chỉ tiêu tổng hợp cấp xã
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  Phụ lục I & II
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Tổng giá trị sản phẩm (TGTSP) & Thu nhập bình quân đầu người (TNBQ)
              </p>
            </div>
          </div>

          {/* Location Selector & Key Stat Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Commune Switcher */}
            <div className="relative">
              <label className="text-[11px] block text-slate-400 font-medium mb-0.5">
                Địa bàn hành chính cấp xã:
              </label>
              <div className="relative inline-block">
                <select
                  value={commune?.id || ""}
                  onChange={(e) => onSelectCommune(e.target.value)}
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-white font-semibold text-sm rounded-lg pl-3 pr-8 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-sm"
                >
                  {list.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.communeName} - {c.provinceName?.replace(/^Tỉnh\s*/i, "tỉnh ") || "tỉnh Gia Lai"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-slate-800/90 rounded-lg px-3 py-1.5 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">TGTSP hiện hành</span>
              <span className="text-sm font-bold text-amber-400">
                {formatVND(Math.round(totalCurrentTGTSP / 1000), "tỷ đ")}
              </span>
            </div>

            <div className="bg-slate-800/90 rounded-lg px-3 py-1.5 border border-slate-700">
              <span className="text-[10px] uppercase text-slate-400 block">TNBQ/người/năm</span>
              <span className="text-sm font-bold text-emerald-400">
                {(averagePerCapitaMillion ?? 0).toFixed(2)} triệu đ
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 md:pt-0">
              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-750 text-white px-3 py-2 rounded-lg transition shadow-xs cursor-pointer border border-emerald-500"
                title="Xuất dữ liệu chỉ tiêu (TGTSP và TNBQ) thành file Excel (.xlsx) hoặc CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                <span>Xuất Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAI}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3 py-2 rounded-lg transition shadow-sm cursor-pointer"
                title="Hỏi đáp & thẩm định biểu mẫu theo QĐ 2545/QĐ-BTC"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Trợ lý thống kê AI</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
                title="In hoặc xuất biểu báo cáo chính thức cấp xã"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">In báo cáo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 border-t border-slate-800 pt-2 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => handleTabChange("tgtsp")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === "tgtsp"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Tổng giá trị sản phẩm (TGTSP)</span>
          </button>

          <button
            onClick={() => handleTabChange("tnbq")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === "tnbq"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Thu nhập bình quân đầu người (TNBQ)</span>
          </button>

          <button
            onClick={() => handleTabChange("report")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === "report"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. Biểu báo cáo cấp xã & tiêu chí NTM</span>
          </button>

          <button
            onClick={() => handleTabChange("cross-commune")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === "cross-commune"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>4. So sánh & Tổng hợp liên xã</span>
          </button>

          <button
            onClick={() => handleTabChange("handbook")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === "handbook"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>5. Cẩm nang QĐ 2545 & 14 nguồn biểu mẫu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
