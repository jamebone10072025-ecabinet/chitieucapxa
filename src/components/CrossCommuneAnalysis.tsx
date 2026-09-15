import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Building2,
  Users,
  TrendingUp,
  Award,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { CommuneProfile } from "../types";
import {
  calculateTGTSPRow,
  calculateCommuneTNBQ,
  formatVND,
} from "../utils/calculations";
import { exportDistrictComparisonToExcel } from "../utils/exportData";

interface CrossCommuneAnalysisProps {
  communes: CommuneProfile[];
  currentCommuneId: string;
  onSelectCommune: (communeId: string) => void;
  onNavigateToTab: (tab: "tgtsp" | "tnbq" | "report" | "audit" | "geomap") => void;
}

// Bảng màu trực quan chuẩn thống kê
const PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
];

export const CrossCommuneAnalysis: React.FC<CrossCommuneAnalysisProps> = ({
  communes,
  currentCommuneId,
  onSelectCommune,
  onNavigateToTab,
}) => {
  // Lấy danh sách các cụm địa bàn từ dữ liệu
  const areaClusters = useMemo(() => {
    const set = new Set<string>();
    communes.forEach((c) => {
      if (c.districtName) set.add(c.districtName);
    });
    return Array.from(set);
  }, [communes]);

  // Mặc định chọn "ALL" để đối sánh tất cả các xã trên địa bàn (không còn cấp huyện)
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "charts" | "evaluation">("matrix");
  const [chartMode, setChartMode] = useState<"tgtsp" | "tnbq" | "sectors" | "matrix4q">("tgtsp");
  const [sortField, setSortField] = useState<"tgtsp" | "tnbq" | "pop" | "growth" | "name">("tgtsp");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [filterNTM, setFilterNTM] = useState<"ALL" | "PASS" | "FAIL">("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Chuẩn NTM năm 2026 theo Quyết định 2545
  const NTM_THRESHOLD = 68.0;

  // Lọc danh sách xã theo phạm vi chọn
  const selectedCommunes = useMemo(() => {
    if (selectedArea === "ALL") return communes;
    return communes.filter(
      (c) => (c.districtName || "").trim().toLowerCase() === selectedArea.trim().toLowerCase()
    );
  }, [communes, selectedArea]);

  // Tính toán dữ liệu thống kê chi tiết từng xã
  const communeMetrics = useMemo(() => {
    return selectedCommunes.map((c) => {
      const pop = c.totalPopulation || 1;
      const hh = c.totalHouseholds || 1;

      // TGTSP
      let currentTGTSP = 0;
      let constantTGTSP = 0;
      let agri = 0;
      let ind = 0;
      let serv = 0;

      (c.tgtspRows || []).forEach((row) => {
        const rowCalc = calculateTGTSPRow(row);
        const curVal = rowCalc.currentPriceValue;
        const conVal = rowCalc.constantPriceValue;
        currentTGTSP += curVal;
        constantTGTSP += conVal;

        const code = (row.industryCode || "").toUpperCase();
        if (code.startsWith("A")) {
          agri += curVal;
        } else if (["B", "C", "D", "E", "F"].some((prefix) => code.startsWith(prefix))) {
          ind += curVal;
        } else {
          serv += curVal;
        }
      });

      const growthRate =
        constantTGTSP > 0 ? ((currentTGTSP - constantTGTSP) / constantTGTSP) * 100 : 0;

      // TNBQ
      const tnbqCalc = calculateCommuneTNBQ(c);
      const tnbqAnnual = tnbqCalc.averagePerCapitaAnnualMillionVND;
      const tnbqMonthly = tnbqCalc.averagePerCapitaMonthlyThousandVND;
      const isPassNTM = tnbqAnnual >= NTM_THRESHOLD;

      // Ngành mũi nhọn
      let topSectorName = "Nông nghiệp";
      if (ind >= agri && ind >= serv) topSectorName = "Công nghiệp - Xây dựng";
      else if (serv >= agri && serv >= ind) topSectorName = "Thương mại - Dịch vụ";

      return {
        id: c.id,
        rawCommune: c,
        name: c.communeName,
        district: c.districtName,
        province: c.provinceName,
        pop,
        hh,
        sampleCount: c.sampleCount || 0,
        currentTGTSP,
        currentTGTSPBillion: currentTGTSP / 1000,
        constantTGTSP,
        constantTGTSPBillion: constantTGTSP / 1000,
        growthRate,
        agri,
        ind,
        serv,
        topSectorName,
        tnbqAnnual,
        tnbqMonthly,
        isPassNTM,
        diffNTM: tnbqAnnual - NTM_THRESHOLD,
      };
    });
  }, [selectedCommunes, NTM_THRESHOLD]);

  // Tính toán các chỉ số Macro cấp huyện
  const districtMacro = useMemo(() => {
    let totalPop = 0;
    let totalHH = 0;
    let totalCurrentTGTSP = 0;
    let totalConstantTGTSP = 0;
    let weightedTNBQSum = 0;
    let ntmPassCount = 0;

    communeMetrics.forEach((m) => {
      totalPop += m.pop;
      totalHH += m.hh;
      totalCurrentTGTSP += m.currentTGTSP;
      totalConstantTGTSP += m.constantTGTSP;
      weightedTNBQSum += m.tnbqAnnual * m.pop;
      if (m.isPassNTM) ntmPassCount++;
    });

    const weightedAvgTNBQ = totalPop > 0 ? weightedTNBQSum / totalPop : 0;
    const overallGrowth =
      totalConstantTGTSP > 0
        ? ((totalCurrentTGTSP - totalConstantTGTSP) / totalConstantTGTSP) * 100
        : 0;
    const ntmRate = communeMetrics.length > 0 ? (ntmPassCount / communeMetrics.length) * 100 : 0;

    // Tìm xã max/min
    const sortedByTGTSP = [...communeMetrics].sort(
      (a, b) => b.currentTGTSP - a.currentTGTSP
    );
    const sortedByTNBQ = [...communeMetrics].sort(
      (a, b) => b.tnbqAnnual - a.tnbqAnnual
    );

    const maxTGTSPCommune = sortedByTGTSP[0];
    const minTGTSPCommune = sortedByTGTSP[sortedByTGTSP.length - 1];
    const maxTNBQCommune = sortedByTNBQ[0];
    const minTNBQCommune = sortedByTNBQ[sortedByTNBQ.length - 1];

    // Hệ số phân hóa thu nhập (Max / Min)
    const incomeDisparityRatio =
      minTNBQCommune && minTNBQCommune.tnbqAnnual > 0
        ? (maxTNBQCommune?.tnbqAnnual || 0) / minTNBQCommune.tnbqAnnual
        : 1;

    // Tổng GTSX tỉnh từ cấu hình xã đầu tiên
    const provincialGTSX = selectedCommunes[0]?.provincialGTSX || 168000000;
    const provincialSharePercent =
      provincialGTSX > 0 ? (totalCurrentTGTSP / provincialGTSX) * 100 : 0;

    return {
      totalPop,
      totalHH,
      totalCurrentTGTSP,
      totalCurrentTGTSPBillion: totalCurrentTGTSP / 1000,
      totalConstantTGTSP,
      totalConstantTGTSPBillion: totalConstantTGTSP / 1000,
      overallGrowth,
      weightedAvgTNBQ,
      ntmPassCount,
      totalCommunes: communeMetrics.length,
      ntmRate,
      maxTGTSPCommune,
      minTGTSPCommune,
      maxTNBQCommune,
      minTNBQCommune,
      incomeDisparityRatio,
      provincialGTSX,
      provincialSharePercent,
    };
  }, [communeMetrics, selectedCommunes]);

  // Lọc và sắp xếp dữ liệu cho bảng hiển thị
  const filteredAndSortedMetrics = useMemo(() => {
    let list = [...communeMetrics];

    // Lọc tìm kiếm
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(kw));
    }

    // Lọc NTM
    if (filterNTM === "PASS") {
      list = list.filter((m) => m.isPassNTM);
    } else if (filterNTM === "FAIL") {
      list = list.filter((m) => !m.isPassNTM);
    }

    // Sắp xếp
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "tgtsp") cmp = a.currentTGTSP - b.currentTGTSP;
      else if (sortField === "tnbq") cmp = a.tnbqAnnual - b.tnbqAnnual;
      else if (sortField === "pop") cmp = a.pop - b.pop;
      else if (sortField === "growth") cmp = a.growthRate - b.growthRate;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name, "vi");
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [communeMetrics, searchKeyword, filterNTM, sortField, sortAsc]);

  // Dữ liệu biểu đồ Recharts
  const chartDataTGTSP = useMemo(() => {
    return communeMetrics.map((m) => ({
      name: m.name.replace(/^(Phường|Xã|Thị trấn)\s+/i, ""),
      fullName: m.name,
      currentBillion: Math.round(m.currentTGTSPBillion * 10) / 10,
      constantBillion: Math.round(m.constantTGTSPBillion * 10) / 10,
      growthRate: Math.round(m.growthRate * 10) / 10,
      sharePercent:
        districtMacro.totalCurrentTGTSP > 0
          ? Math.round((m.currentTGTSP / districtMacro.totalCurrentTGTSP) * 1000) / 10
          : 0,
    }));
  }, [communeMetrics, districtMacro.totalCurrentTGTSP]);

  const chartDataTNBQ = useMemo(() => {
    return communeMetrics.map((m) => ({
      name: m.name.replace(/^(Phường|Xã|Thị trấn)\s+/i, ""),
      fullName: m.name,
      tnbqAnnual: Math.round(m.tnbqAnnual * 10) / 10,
      ntmStandard: NTM_THRESHOLD,
      diff: Math.round(m.diffNTM * 10) / 10,
      isPass: m.isPassNTM,
    }));
  }, [communeMetrics, NTM_THRESHOLD]);

  const chartDataSectors = useMemo(() => {
    return communeMetrics.map((m) => {
      const tot = m.currentTGTSP || 1;
      return {
        name: m.name.replace(/^(Phường|Xã|Thị trấn)\s+/i, ""),
        fullName: m.name,
        agriPercent: Math.round((m.agri / tot) * 1000) / 10,
        indPercent: Math.round((m.ind / tot) * 1000) / 10,
        servPercent: Math.round((m.serv / tot) * 1000) / 10,
        agriBillion: Math.round((m.agri / 1000) * 10) / 10,
        indBillion: Math.round((m.ind / 1000) * 10) / 10,
        servBillion: Math.round((m.serv / 1000) * 10) / 10,
      };
    });
  }, [communeMetrics]);

  const chartDataDonut = useMemo(() => {
    return communeMetrics.map((m, idx) => ({
      name: m.name,
      value: Math.round(m.currentTGTSPBillion * 10) / 10,
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [communeMetrics]);

  // Xử lý xuất Excel tổng hợp liên xã (mô hình không còn cấp huyện)
  const handleExportInterCommuneExcel = () => {
    const areaLabel = selectedArea === "ALL" ? "Tổng hợp liên xã" : selectedArea;
    exportDistrictComparisonToExcel(selectedCommunes, areaLabel);
  };

  // Chuyển sang xem chi tiết xã
  const handleJumpToCommune = (communeId: string, tab: "tgtsp" | "tnbq" | "report") => {
    onSelectCommune(communeId);
    onNavigateToTab(tab);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Area Switcher Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                <GitCompare className="w-3.5 h-3.5 text-amber-700" />
                <span>Đối sánh kinh tế liên xã & Đánh giá mức sống (Cấp Xã)</span>
              </span>
              <span className="text-xs text-slate-500">Quyết định 2545/QĐ-BTC</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Bảng Tổng Hợp & Đối Sánh Kinh Tế Cấp Xã
              <span className="text-sm font-medium text-slate-600">
                ({selectedCommunes[0]?.provinceName || "tỉnh Gia Lai"})
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
              Theo mô hình tổ chức không còn cấp huyện, số liệu 02 chỉ tiêu được tổng hợp và đối sánh trực tiếp
              giữa các xã/phường trên địa bàn: quy mô kinh tế <strong>Tổng giá trị sản phẩm (TGTSP)</strong>, mức
              sống dân cư <strong>Thu nhập bình quân đầu người (TNBQ)</strong> và tỷ lệ hoàn thành{" "}
              <strong>Tiêu chí Nông thôn mới số 10</strong> theo chuẩn QĐ 2545/QĐ-BTC.
            </p>
          </div>

          {/* Area selector & Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
              <MapPin className="w-4 h-4 text-slate-500" />
              <label htmlFor="area-select" className="text-xs font-semibold text-slate-700">
                Phạm vi đối sánh:
              </label>
              <select
                id="area-select"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">
                  Tất cả các xã/phường ({communes.length} xã)
                </option>
                {areaClusters.map((a) => (
                  <option key={a} value={a}>
                    {a} ({communes.filter((c) => c.districtName === a).length} xã/phường)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab("audit")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
              title="Kiểm toán tự động cấu trúc số liệu theo QĐ 2545"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Kiểm toán</span>
            </button>

            <button
              type="button"
              onClick={handleExportInterCommuneExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              title="Xuất bảng tổng hợp & đối sánh liên xã ra sổ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
              title="In báo cáo tổng hợp đối sánh liên xã"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Báo Cáo Liên Xã</span>
            </button>
          </div>
        </div>

        {/* Macro KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-5 mt-5 border-t border-slate-100">
          {/* KPI 1: TGTSP Các Xã */}
          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700 uppercase mb-1">
              <span>Tổng TGTSP Các Xã</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg md:text-xl font-black text-blue-900">
              {formatVND(Math.round(districtMacro.totalCurrentTGTSPBillion), "tỷ đ")}
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600 inline" />
              <span>Tăng trưởng chung: +{districtMacro.overallGrowth.toFixed(2)}%</span>
            </div>
          </div>

          {/* KPI 2: TNBQ Bình quân chung */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 uppercase mb-1">
              <span>TNBQ Bình Quân Chung</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg md:text-xl font-black text-emerald-900">
              {districtMacro.weightedAvgTNBQ.toFixed(2)}{" "}
              <span className="text-xs font-semibold">tr.đ/người</span>
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">
              ≈ {formatVND(Math.round((districtMacro.weightedAvgTNBQ * 1000) / 12), "nghìn/tháng")}
            </div>
          </div>

          {/* KPI 3: Tỷ lệ đạt Tiêu chí NTM số 10 */}
          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 uppercase mb-1">
              <span>Tiêu Chí NTM Số 10</span>
              <Award className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-lg md:text-xl font-black text-amber-950">
              {districtMacro.ntmPassCount}/{districtMacro.totalCommunes}{" "}
              <span className="text-xs font-semibold">xã ({districtMacro.ntmRate.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(districtMacro.ntmRate, 100)}%` }}
              />
            </div>
          </div>

          {/* KPI 4: Quy mô dân số & hộ */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase mb-1">
              <span>Quy Mô Tổng Hợp</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900">
              {districtMacro.totalPop.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-slate-600">người</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {districtMacro.totalHH.toLocaleString()} hộ gia đình
            </div>
          </div>

          {/* KPI 5: Phân hóa thu nhập & Trần tỉnh */}
          <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700 uppercase mb-1">
              <span>Độ Vênh Thu Nhập</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg md:text-xl font-black text-indigo-950">
              {districtMacro.incomeDisparityRatio.toFixed(2)}x
            </div>
            <div className="text-[11px] text-indigo-800 mt-0.5">
              Cao: {districtMacro.maxTNBQCommune?.name} ({districtMacro.maxTNBQCommune?.tnbqAnnual.toFixed(1)})
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Sub-Tabs - Fixed grid, no scrollbar */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab("matrix")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 border-b-2 font-semibold transition cursor-pointer text-center ${
              activeSubTab === "matrix"
                ? "border-amber-600 text-amber-800 bg-amber-50/50 rounded-t-md"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-md"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">Ma trận đối sánh ({communeMetrics.length} xã)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("charts")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 border-b-2 font-semibold transition cursor-pointer text-center ${
              activeSubTab === "charts"
                ? "border-amber-600 text-amber-800 bg-amber-50/50 rounded-t-md"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-md"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="truncate">Biểu đồ & Cơ cấu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("evaluation")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 border-b-2 font-semibold transition cursor-pointer text-center ${
              activeSubTab === "evaluation"
                ? "border-amber-600 text-amber-800 bg-amber-50/50 rounded-t-md"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-md"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Báo cáo & Đề xuất cấp xã</span>
          </button>
        </div>
      </div>

      {/* 3. SUB-TAB 1: MA TRẬN SO SÁNH LIÊN XÃ */}
      {activeSubTab === "matrix" && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs p-5 space-y-4">
          {/* Controls: Search, Filter, Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter NTM */}
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilterNTM("ALL")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    filterNTM === "ALL"
                      ? "bg-white font-bold text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({communeMetrics.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterNTM("PASS")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    filterNTM === "PASS"
                      ? "bg-emerald-600 font-bold text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đạt chuẩn NTM ({districtMacro.ntmPassCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterNTM("FAIL")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                    filterNTM === "FAIL"
                      ? "bg-rose-600 font-bold text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Chưa đạt NTM ({districtMacro.totalCommunes - districtMacro.ntmPassCount})
                </button>
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm tên xã/phường..."
                className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-44"
              />
            </div>

            {/* Quick Sorter */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">Sắp xếp theo:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="tgtsp">TGTSP hiện hành</option>
                <option value="tnbq">TNBQ/người/năm</option>
                <option value="growth">Tốc độ tăng trưởng</option>
                <option value="pop">Dân số thường trú</option>
                <option value="name">Tên xã (A-Z)</option>
              </select>
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="p-1 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                title={sortAsc ? "Thứ tự tăng dần" : "Thứ tự giảm dần"}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[170px]">Xã / Phường</th>
                  <th className="py-3 px-3 text-right">Dân số (người)</th>
                  <th className="py-3 px-3 text-right">TGTSP Hiện Hành (Tỷ đ)</th>
                  <th className="py-3 px-3 text-right">Tốc độ tăng (%)</th>
                  <th className="py-3 px-3 text-right">Tỷ trọng đóng góp (%)</th>
                  <th className="py-3 px-3 min-w-[140px]">Ngành mũi nhọn</th>
                  <th className="py-3 px-3 text-right">TNBQ (Tr.đ/năm)</th>
                  <th className="py-3 px-3 text-center">Tiêu chí 10 NTM</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Không tìm thấy xã/phường phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedMetrics.map((m, idx) => {
                    const isCurrent = m.id === currentCommuneId;
                    const sharePct =
                      districtMacro.totalCurrentTGTSP > 0
                        ? (m.currentTGTSP / districtMacro.totalCurrentTGTSP) * 100
                        : 0;

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-slate-50/90 transition ${
                          isCurrent ? "bg-amber-50/60 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{m.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-slate-950 font-bold">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {m.hh.toLocaleString()} hộ | Mẫu: {m.sampleCount} hộ
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-800">
                          {m.pop.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-blue-900">
                          {formatVND(Math.round(m.currentTGTSPBillion), "tỷ đ")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-semibold ${
                              m.growthRate >= 8 ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            +{m.growthRate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {sharePct.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {m.topSectorName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-emerald-800 text-sm">
                            {m.tnbqAnnual.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            ≈ {formatVND(Math.round((m.tnbqAnnual * 1000) / 12), "k/th")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {m.isPassNTM ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đạt chuẩn</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Chưa đạt ({m.diffNTM.toFixed(1)})</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleJumpToCommune(m.id, "tgtsp")}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition cursor-pointer"
                              title="Xem bảng tính TGTSP chi tiết của xã này"
                            >
                              TGTSP
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJumpToCommune(m.id, "tnbq")}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition cursor-pointer"
                              title="Xem phiếu điều tra mẫu TNBQ của xã này"
                            >
                              TNBQ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Summary Row */}
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-center uppercase">
                    Tổng cộng các xã khảo sát ({districtMacro.totalCommunes} xã/phường)
                  </td>
                  <td className="py-3 px-3 text-right">
                    {districtMacro.totalPop.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-900">
                    {formatVND(Math.round(districtMacro.totalCurrentTGTSPBillion), "tỷ đ")}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-800">
                    +{districtMacro.overallGrowth.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-right">100.0%</td>
                  <td className="py-3 px-3 text-slate-600 font-normal italic">
                    Đa dạng hóa cơ cấu
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-900 text-sm">
                    {districtMacro.weightedAvgTNBQ.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-xs text-amber-800">
                      {districtMacro.ntmPassCount}/{districtMacro.totalCommunes} xã (
                      {districtMacro.ntmRate.toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={handleExportInterCommuneExcel}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold"
                    >
                      Xuất Excel
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2 pt-2">
            <span>
              * Ngưỡng tiêu chí Nông thôn mới số 10 năm 2026: <strong>{NTM_THRESHOLD} triệu đ/người/năm</strong>.
            </span>
            <span className="font-semibold text-slate-700">
              Cộng dồn số liệu theo phương pháp tính tổng hợp quy định tại Quyết định 2545/QĐ-BTC
            </span>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: BIỂU ĐỒ TRỰC QUAN HÓA ĐỐI SÁNH */}
      {activeSubTab === "charts" && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs p-5 space-y-6">
          {/* Sub-mode selector */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-600">Chế độ phân tích:</span>
            <button
              type="button"
              onClick={() => setChartMode("tgtsp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === "tgtsp"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              1. So sánh Quy mô TGTSP
            </button>
            <button
              type="button"
              onClick={() => setChartMode("tnbq")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === "tnbq"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              2. So sánh TNBQ & Chuẩn NTM
            </button>
            <button
              type="button"
              onClick={() => setChartMode("sectors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === "sectors"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              3. Cơ cấu 3 Khu vực Kinh tế
            </button>
            <button
              type="button"
              onClick={() => setChartMode("matrix4q")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === "matrix4q"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              4. Tương quan TGTSP vs TNBQ
            </button>
          </div>

          {/* Mode 1: TGTSP comparison bar chart & Donut share */}
          {chartMode === "tgtsp" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      So Sánh Tổng Giá Trị Sản Phẩm (TGTSP) Giữa Các Xã
                    </h3>
                    <p className="text-xs text-slate-500">
                      Giá hiện hành vs Giá so sánh (Đơn vị: Tỷ đồng)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Năm 2026
                  </span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartDataTGTSP}
                      margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#475569" }}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#475569" }}
                        tickFormatter={(v) => `${v} tỷ`}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          `${val} tỷ đồng`,
                          name === "currentBillion" ? "TGTSP hiện hành" : "TGTSP so sánh",
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullName || label;
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        formatter={(value) =>
                          value === "currentBillion"
                            ? "TGTSP Giá hiện hành"
                            : "TGTSP Giá so sánh"
                        }
                      />
                      <Bar
                        dataKey="currentBillion"
                        name="currentBillion"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="constantBillion"
                        name="constantBillion"
                        fill="#93c5fd"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut chart for commune share */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Tỷ Trọng Đóng Góp TGTSP Giữa Các Xã
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Phần trăm đóng góp của từng xã vào tổng quy mô kinh tế địa bàn
                  </p>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartDataDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartDataDonut.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => [`${val} tỷ đồng`, "TGTSP"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legend breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  {communeMetrics.map((m, idx) => {
                    const pct =
                      districtMacro.totalCurrentTGTSP > 0
                        ? (m.currentTGTSP / districtMacro.totalCurrentTGTSP) * 100
                        : 0;
                    return (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                          />
                          <span className="truncate text-slate-700">{m.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: TNBQ comparison vs NTM threshold */}
          {chartMode === "tnbq" && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Đối Sánh Thu Nhập Bình Quân Đầu Người (TNBQ) & Chuẩn NTM Số 10
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vạch đỏ đứt nét thể hiện ngưỡng chuẩn Tiêu chí Nông thôn mới năm 2026:{" "}
                    <strong>{NTM_THRESHOLD} triệu đ/người/năm</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-600" />
                    <span>Đạt chuẩn NTM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-rose-500" />
                    <span>Chưa đạt chuẩn</span>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartDataTNBQ}
                    margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#475569" }}
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
                      tickFormatter={(v) => `${v} tr`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} triệu đồng/năm`, "TNBQ/người"]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return `${item?.fullName || label} - ${
                          item?.isPass ? "Đạt chuẩn NTM" : "Chưa đạt chuẩn NTM"
                        }`;
                      }}
                    />
                    {/* Reference Line for NTM Standard */}
                    <ReferenceLine
                      y={NTM_THRESHOLD}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `Chuẩn NTM: ${NTM_THRESHOLD} Tr.đ`,
                        position: "top",
                        fill: "#dc2626",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    />
                    {/* Reference Line for Inter-Commune Weighted Average */}
                    <ReferenceLine
                      y={Math.round(districtMacro.weightedAvgTNBQ * 10) / 10}
                      stroke="#059669"
                      strokeDasharray="2 2"
                      label={{
                        value: `BQ chung: ${districtMacro.weightedAvgTNBQ.toFixed(1)} Tr.đ`,
                        position: "insideBottomRight",
                        fill: "#059669",
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="tnbqAnnual" radius={[4, 4, 0, 0]}>
                      {chartDataTNBQ.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isPass ? "#10b981" : "#f43f5e"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold block mb-0.5">Xã dẫn đầu thu nhập:</span>
                  {districtMacro.maxTNBQCommune?.name} đạt{" "}
                  <strong>{districtMacro.maxTNBQCommune?.tnbqAnnual.toFixed(2)} triệu đ/người/năm</strong>,
                  vượt ngưỡng chuẩn NTM +
                  {(
                    (districtMacro.maxTNBQCommune?.tnbqAnnual || 0) - NTM_THRESHOLD
                  ).toFixed(1)}{" "}
                  triệu đồng.
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Xã cần tập trung hỗ trợ:</span>
                  {districtMacro.minTNBQCommune?.name} hiện đạt{" "}
                  <strong>{districtMacro.minTNBQCommune?.tnbqAnnual.toFixed(2)} triệu đ/người/năm</strong>
                  {districtMacro.minTNBQCommune &&
                  districtMacro.minTNBQCommune.tnbqAnnual < NTM_THRESHOLD
                    ? ` (còn thiếu ${(
                        NTM_THRESHOLD - districtMacro.minTNBQCommune.tnbqAnnual
                      ).toFixed(1)} triệu đồng để đạt chuẩn NTM).`
                    : " (đã chạm ngưỡng tối thiểu)."}
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: 3 Sectors breakdown */}
          {chartMode === "sectors" && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cơ Cấu 3 Khu Vực Kinh Tế Giữa Các Xã / Phường
                </h3>
                <p className="text-xs text-slate-500">
                  Tỷ trọng % của Khu vực I (Nông, lâm, thủy sản), Khu vực II (Công nghiệp - Xây dựng) và Khu vực III (Thương mại - Dịch vụ)
                </p>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartDataSectors}
                    margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#475569" }}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val}%`,
                        name === "agriPercent"
                          ? "Khu vực I (Nông lâm thủy sản)"
                          : name === "indPercent"
                          ? "Khu vực II (Công nghiệp - Xây dựng)"
                          : "Khu vực III (Thương mại - Dịch vụ)",
                      ]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(value) =>
                        value === "agriPercent"
                          ? "Khu vực I: Nông lâm thủy sản"
                          : value === "indPercent"
                          ? "Khu vực II: Công nghiệp - Xây dựng"
                          : "Khu vực III: Dịch vụ & QLNN"
                      }
                    />
                    <Bar
                      dataKey="agriPercent"
                      name="agriPercent"
                      stackId="a"
                      fill="#10b981"
                    />
                    <Bar
                      dataKey="indPercent"
                      name="indPercent"
                      stackId="a"
                      fill="#3b82f6"
                    />
                    <Bar
                      dataKey="servPercent"
                      name="servPercent"
                      stackId="a"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Mode 4: Scatter 4 Quadrants TGTSP vs TNBQ */}
          {chartMode === "matrix4q" && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ma Trận Tương Quan: Quy Mô Sản Xuất (TGTSP) vs Đời Sống Dân Cư (TNBQ)
                </h3>
                <p className="text-xs text-slate-500">
                  Đánh giá xem xã có quy mô sản xuất lớn có chuyển hóa thành thu nhập cao cho người dân hay không
                </p>
              </div>

              {/* Grid 4 Quadrants visual explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {communeMetrics.map((m) => {
                  const isHighTGTSP = m.currentTGTSPBillion >= (districtMacro.totalCurrentTGTSPBillion / districtMacro.totalCommunes);
                  const isHighTNBQ = m.tnbqAnnual >= NTM_THRESHOLD;

                  let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                  let quadrantTitle = "Góc I: Phát triển toàn diện (TGTSP lớn, Thu nhập cao)";
                  if (isHighTGTSP && !isHighTNBQ) {
                    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                    quadrantTitle = "Góc II: Công nghiệp tập trung (TGTSP lớn nhưng cần lan tỏa thu nhập)";
                  } else if (!isHighTGTSP && isHighTNBQ) {
                    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                    quadrantTitle = "Góc III: Hiệu quả cao (Quy mô vừa, Thu nhập dân cư rất tốt)";
                  } else if (!isHighTGTSP && !isHighTNBQ) {
                    badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                    quadrantTitle = "Góc IV: Vùng trũng (Cần ưu tiên đầu tư NSNN & sinh kế)";
                  }

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}
                        >
                          {m.isPassNTM ? "Đạt NTM" : "Chưa đạt NTM"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{quadrantTitle}</p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">
                          TGTSP: <strong>{m.currentTGTSPBillion.toFixed(1)} tỷ đ</strong>
                        </span>
                        <span className="text-emerald-800">
                          TNBQ: <strong>{m.tnbqAnnual.toFixed(1)} tr.đ/năm</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 3: ĐÁNH GIÁ & ĐỀ XUẤT CHO CẤP XÃ */}
      {activeSubTab === "evaluation" && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Báo Cáo Đánh Giá Tổng Hợp & Đề Xuất Chính Sách Cho Cấp Xã
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Căn cứ kết quả tính toán 02 chỉ tiêu cấp xã năm {selectedCommunes[0]?.reportingYear || 2026}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportInterCommuneExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Lưu sổ thống kê liên xã</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: Đánh giá quy mô & tăng trưởng */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. Đánh giá Quy mô Sản xuất và Cơ cấu Ngành</span>
              </h4>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                <li>
                  • <strong>Tổng giá trị sản phẩm các xã:</strong> Đạt{" "}
                  <strong>{districtMacro.totalCurrentTGTSPBillion.toFixed(2)} tỷ đồng</strong>, tốc độ
                  tăng trưởng ước đạt <strong>+{districtMacro.overallGrowth.toFixed(2)}%</strong> so
                  với giá so sánh năm gốc 2025.
                </li>
                <li>
                  • <strong>Xã đóng góp lớn nhất:</strong>{" "}
                  <strong>{districtMacro.maxTGTSPCommune?.name}</strong> đạt{" "}
                  {districtMacro.maxTGTSPCommune?.currentTGTSPBillion.toFixed(1)} tỷ đồng (chiếm{" "}
                  {(
                    ((districtMacro.maxTGTSPCommune?.currentTGTSP || 0) /
                      (districtMacro.totalCurrentTGTSP || 1)) *
                    100
                  ).toFixed(1)}
                  % tổng quy mô địa bàn) nhờ phát triển mạnh công nghiệp chế biến và logistics cửa ngõ.
                </li>
                <li>
                  • <strong>Kiểm soát trần cấp tỉnh:</strong> Tổng TGTSP các xã hiện chiếm{" "}
                  <strong>{districtMacro.provincialSharePercent.toFixed(2)}%</strong> so với tổng GTSX
                  toàn tỉnh ({formatVND(districtMacro.provincialGTSX / 1000, "tỷ đ")}). Các xã đều
                  được phân bổ gián tiếp ngành điện lực và viễn thông đầy đủ theo quy định.
                </li>
              </ul>
            </div>

            {/* Section 2: Đánh giá thu nhập & Tiêu chí NTM */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Đánh giá Mức sống & Tiêu chí Nông Thôn Mới</span>
              </h4>
              <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                <li>
                  • <strong>TNBQ bình quân chung các xã:</strong> Đạt{" "}
                  <strong>{districtMacro.weightedAvgTNBQ.toFixed(2)} triệu đồng/người/năm</strong>, cao
                  hơn ngưỡng chuẩn NTM 2026 (+
                  {(districtMacro.weightedAvgTNBQ - NTM_THRESHOLD).toFixed(2)} triệu đ).
                </li>
                <li>
                  • <strong>Tỷ lệ đạt chuẩn Tiêu chí số 10:</strong> Có{" "}
                  <strong>
                    {districtMacro.ntmPassCount}/{districtMacro.totalCommunes} xã/phường
                  </strong>{" "}
                  hoàn thành ({districtMacro.ntmRate.toFixed(1)}%).
                </li>
                <li>
                  • <strong>Hệ số chênh lệch thu nhập (Max/Min):</strong> Đạt mức{" "}
                  <strong>{districtMacro.incomeDisparityRatio.toFixed(2)} lần</strong>. Khoảng cách
                  giữa khu vực trung tâm đô thị ({districtMacro.maxTNBQCommune?.name}) và xã vùng ven
                  thuần nông ({districtMacro.minTNBQCommune?.name}) cần được kéo giảm qua các mô hình
                  nông nghiệp công nghệ cao và liên kết tiêu thụ.
                </li>
              </ul>
            </div>
          </div>

          {/* Policy Recommendations Card */}
          <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
            <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>3. Định Hướng & Khuyến Nghị Phát Triển Cấp Xã Cho Kế Hoạch Năm Tiếp Theo</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-900">
              <div className="p-3 bg-white/80 rounded-lg border border-amber-200/70 space-y-1">
                <span className="font-bold text-amber-950 block">Liên Kết Chuỗi Liên Xã</span>
                <p>
                  Đẩy mạnh liên kết giữa các xã vùng nguyên liệu (Biển Hồ, Chư Á) với các cơ sở chế biến
                  sâu tại cụm công nghiệp An Phú để nâng cao giá trị gia tăng sản phẩm nông sản.
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-lg border border-amber-200/70 space-y-1">
                <span className="font-bold text-amber-950 block">Hỗ Trợ Xã Cận Chuẩn</span>
                <p>
                  Ưu tiên nguồn vốn chương trình MTQG xây dựng nông thôn mới cho xã{" "}
                  <strong>{districtMacro.minTNBQCommune?.name}</strong> để chuyển đổi cơ cấu cây trồng,
                  vật nuôi, phấn đấu đạt mốc {NTM_THRESHOLD} triệu đ/năm.
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-lg border border-amber-200/70 space-y-1">
                <span className="font-bold text-amber-950 block">Chuẩn Hóa Dữ Liệu 2545</span>
                <p>
                  Tổ chức tập huấn định kỳ cho cán bộ thống kê 100% xã/phường về 14 nguồn biểu mẫu, kiểm
                  soát chặt chẽ việc loại trừ giao dịch vốn khi điều tra mẫu hộ gia đình.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
