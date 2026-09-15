import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { TGTSPRow, CommuneProfile } from "../types";
import { calculateTGTSPRow, formatVND } from "../utils/calculations";

interface TGTSPSectorChartsProps {
  commune: CommuneProfile;
}

// Bảng màu chuẩn thống kê chuyên nghiệp
const SECTOR_COLORS = {
  agriculture: "#10b981", // Emerald - Nông lâm thủy sản
  industry: "#3b82f6", // Blue - Công nghiệp & Xây dựng
  services: "#f59e0b", // Amber - Dịch vụ & QLNN
};

const DETAIL_PALETTE = [
  "#10b981",
  "#059669",
  "#3b82f6",
  "#2563eb",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#d97706",
  "#ec4899",
  "#14b8a6",
  "#06b6d4",
  "#84cc16",
];

export const TGTSPSectorCharts: React.FC<TGTSPSectorChartsProps> = ({ commune }) => {
  const [chartType, setChartType] = useState<"pie" | "comparison" | "topSubsectors">("pie");
  const [priceBasis, setPriceBasis] = useState<"current" | "constant">("current");

  // Xử lý dữ liệu cơ cấu ngành
  const sectorData = useMemo(() => {
    let agCurrent = 0;
    let agConstant = 0;
    let indCurrent = 0;
    let indConstant = 0;
    let servCurrent = 0;
    let servConstant = 0;

    let totalCurrent = 0;
    let totalConstant = 0;

    const subsectorList: Array<{
      code: string;
      name: string;
      group: string;
      currentValue: number;
      constantValue: number;
    }> = [];

    (commune.tgtspRows || []).forEach((r) => {
      const calc = calculateTGTSPRow(r);
      const code = (r.industryCode || "").toUpperCase();
      const cur = calc.currentPriceValue;
      const con = calc.constantPriceValue;

      totalCurrent += cur;
      totalConstant += con;

      let grp = "Dịch vụ & QLNN";
      if (code.startsWith("A")) {
        agCurrent += cur;
        agConstant += con;
        grp = "Nông lâm thủy sản";
      } else if (
        code.startsWith("B") ||
        code.startsWith("C") ||
        code.startsWith("D") ||
        code.startsWith("E") ||
        code.startsWith("F")
      ) {
        indCurrent += cur;
        indConstant += con;
        grp = "Công nghiệp & Xây dựng";
      } else {
        servCurrent += cur;
        servConstant += con;
      }

      subsectorList.push({
        code: r.industryCode,
        name: r.industryName || "Ngành " + r.industryCode,
        group: grp,
        currentValue: cur,
        constantValue: con,
      });
    });

    const activeTotal = priceBasis === "current" ? totalCurrent : totalConstant;

    const pieItems = [
      {
        id: "ag",
        name: "Nông, lâm nghiệp & thủy sản (Nhóm I)",
        shortName: "Nông lâm thủy sản",
        codePrefix: "A",
        currentPrice: agCurrent,
        constantPrice: agConstant,
        value: priceBasis === "current" ? agCurrent : agConstant,
        percentage:
          activeTotal > 0
            ? Number((((priceBasis === "current" ? agCurrent : agConstant) / activeTotal) * 100).toFixed(2))
            : 0,
        color: SECTOR_COLORS.agriculture,
      },
      {
        id: "ind",
        name: "Công nghiệp & Xây dựng (Nhóm II)",
        shortName: "Công nghiệp - Xây dựng",
        codePrefix: "B, C, D, E, F",
        currentPrice: indCurrent,
        constantPrice: indConstant,
        value: priceBasis === "current" ? indCurrent : indConstant,
        percentage:
          activeTotal > 0
            ? Number((((priceBasis === "current" ? indCurrent : indConstant) / activeTotal) * 100).toFixed(2))
            : 0,
        color: SECTOR_COLORS.industry,
      },
      {
        id: "serv",
        name: "Dịch vụ & Quản lý nhà nước (Nhóm III)",
        shortName: "Dịch vụ & QLNN",
        codePrefix: "G, H, I, J, K, L, M, N, O, P, Q, R, S",
        currentPrice: servCurrent,
        constantPrice: servConstant,
        value: priceBasis === "current" ? servCurrent : servConstant,
        percentage:
          activeTotal > 0
            ? Number((((priceBasis === "current" ? servCurrent : servConstant) / activeTotal) * 100).toFixed(2))
            : 0,
        color: SECTOR_COLORS.services,
      },
    ];

    // Dữ liệu so sánh cột đôi (Current vs Constant)
    const comparisonItems = pieItems.map((item) => ({
      name: item.shortName,
      fullName: item.name,
      "Giá hiện hành": Math.round(item.currentPrice),
      "Giá so sánh": Math.round(item.constantPrice),
      currentPrice: item.currentPrice,
      constantPrice: item.constantPrice,
      diff: item.currentPrice - item.constantPrice,
      ratio: item.constantPrice > 0 ? ((item.currentPrice / item.constantPrice) * 100).toFixed(1) : 100,
    }));

    // Top các phân ngành chi tiết
    const sortedSubsectors = [...subsectorList]
      .sort((a, b) => {
        const valA = priceBasis === "current" ? a.currentValue : a.constantValue;
        const valB = priceBasis === "current" ? b.currentValue : b.constantValue;
        return valB - valA;
      })
      .slice(0, 8)
      .map((sub, idx) => ({
        ...sub,
        shortLabel: sub.name.length > 25 ? sub.name.substring(0, 23) + "..." : sub.name,
        value: Math.round(priceBasis === "current" ? sub.currentValue : sub.constantValue),
        pct:
          activeTotal > 0
            ? Number((((priceBasis === "current" ? sub.currentValue : sub.constantValue) / activeTotal) * 100).toFixed(1))
            : 0,
        color: DETAIL_PALETTE[idx % DETAIL_PALETTE.length],
      }));

    return {
      totalCurrent,
      totalConstant,
      activeTotal,
      pieItems,
      comparisonItems,
      sortedSubsectors,
    };
  }, [commune.tgtspRows, priceBasis]);

  // Custom Tooltip cho PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-48 z-50">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-bold text-slate-100">{data.shortName}</p>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Tỷ trọng cơ cấu:</span>
              <span className="font-bold text-amber-400">{data.percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Giá hiện hành:</span>
              <span className="font-semibold text-white">
                {formatVND(data.currentPrice, "tr.đ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Giá so sánh:</span>
              <span className="font-semibold text-slate-300">
                {formatVND(data.constantPrice, "tr.đ")}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Mã ngành VSIC: {data.codePrefix}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho BarChart so sánh
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const cur = payload.find((p: any) => p.dataKey === "Giá hiện hành")?.value || 0;
      const con = payload.find((p: any) => p.dataKey === "Giá so sánh")?.value || 0;
      const diff = cur - con;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-52 z-50">
          <p className="font-bold text-slate-100 border-b border-slate-800 pb-1 mb-1.5">
            {label}
          </p>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between text-blue-400">
              <span>Giá hiện hành:</span>
              <span className="font-bold">{formatVND(cur, "tr.đ")}</span>
            </div>
            <div className="flex justify-between text-indigo-300">
              <span>Giá so sánh:</span>
              <span className="font-bold">{formatVND(con, "tr.đ")}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800 text-amber-300">
              <span>Chênh lệch do chỉ số giá:</span>
              <span>+{formatVND(diff, "tr.đ")}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip cho Top phân ngành
  const CustomTopTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-56 z-50">
          <p className="font-bold text-slate-100 mb-1">
            [{data.code}] {data.name}
          </p>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Thuộc nhóm ngành:</span>
              <span className="font-semibold text-slate-200">{data.group}</span>
            </div>
            <div className="flex justify-between">
              <span>Giá trị ({priceBasis === "current" ? "hiện hành" : "so sánh"}):</span>
              <span className="font-bold text-emerald-400">{formatVND(data.value, "tr.đ")}</span>
            </div>
            <div className="flex justify-between">
              <span>Đóng góp trong TGTSP:</span>
              <span className="font-bold text-amber-400">{data.pct}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
      {/* Header & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <PieChartIcon className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Biểu đồ Phân tích Cơ cấu Ngành Kinh tế trong TGTSP
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Recharts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa tỷ trọng 3 nhóm ngành và so sánh giữa giá hiện hành với giá so sánh của xã {commune.communeName}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Basis Toggle */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setPriceBasis("current")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                priceBasis === "current"
                  ? "bg-white text-slate-900 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Giá hiện hành
            </button>
            <button
              onClick={() => setPriceBasis("constant")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                priceBasis === "constant"
                  ? "bg-white text-slate-900 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Giá so sánh
            </button>
          </div>

          {/* Chart Type Tabs */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setChartType("pie")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                chartType === "pie"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Cơ cấu Tròn (Donut)</span>
            </button>
            <button
              onClick={() => setChartType("comparison")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                chartType === "comparison"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>So sánh Hiện hành & So sánh</span>
            </button>
            <button
              onClick={() => setChartType("topSubsectors")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                chartType === "topSubsectors"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Top Phân ngành Đóng góp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Sector Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sectorData.pieItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 truncate" title={item.name}>
                {item.shortName}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {item.percentage}%
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <span className="text-lg font-black text-slate-900 block">
                  {formatVND(item.value, "tr.đ")}
                </span>
                <span className="text-[11px] text-slate-500">
                  {priceBasis === "current" ? "Giá hiện hành" : "Giá so sánh"}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>VSIC: {item.codePrefix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Presentation Container */}
      <div className="w-full bg-slate-50/50 rounded-xl border border-slate-200 p-4">
        {chartType === "pie" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Donut Chart with Center Text */}
            <div className="lg:col-span-7 h-72 sm:h-80 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData.pieItems}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="shortName"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {sectorData.pieItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                  Tổng TGTSP
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {formatVND(Math.round(sectorData.activeTotal / 1000), "tỷ")}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatVND(sectorData.activeTotal, "tr.đ")}
                </span>
              </div>
            </div>

            {/* Right breakdown legend & details */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Chi tiết cơ cấu 3 nhóm ngành ({commune.reportingYear})</span>
              </h4>

              <div className="space-y-2 text-xs">
                {sectorData.pieItems.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div>
                        <p className="font-bold text-slate-900">{entry.shortName}</p>
                        <p className="text-[11px] text-slate-500">Mã VSIC: {entry.codePrefix}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900 block">
                        {entry.percentage}%
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatVND(entry.value, "tr.đ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Economic Structure Note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Quy chuẩn QĐ 2545/QĐ-BTC:</span>
                Tỷ trọng 3 nhóm ngành phản ánh mức độ chuyển dịch từ kinh tế thuần nông sang công nghiệp hóa - hiện đại hóa và dịch vụ thương mại tại cơ sở.
              </div>
            </div>
          </div>
        )}

        {chartType === "comparison" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
              <span>
                So sánh giá trị sản phẩm theo <strong>Giá hiện hành</strong> (theo mặt bằng giá năm {commune.reportingYear}) và <strong>Giá so sánh</strong> (loại trừ biến động giá qua chỉ số giá tỉnh).
              </span>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                Đơn vị: Triệu đồng
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData.comparisonItems}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Giá hiện hành"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="Giá so sánh"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Stats Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              {sectorData.comparisonItems.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Chênh lệch giá:</span>
                    <span className="font-semibold text-indigo-700">
                      +{formatVND(item.diff, "tr.đ")} ({item.ratio}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartType === "topSubsectors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
              <span>
                Xếp hạng các phân ngành kinh tế đóng góp tỷ trọng lớn nhất trong TGTSP của xã (theo {priceBasis === "current" ? "giá hiện hành" : "giá so sánh"}).
              </span>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                Top 8 phân ngành
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData.sortedSubsectors}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)} tỷ`}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: "#334155", fontWeight: 500 }}
                    width={115}
                  />
                  <Tooltip content={<CustomTopTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  >
                    {sectorData.sortedSubsectors.map((entry, index) => (
                      <Cell key={`top-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {sectorData.sortedSubsectors.slice(0, 4).map((sub, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-[11px] truncate">
                      {idx + 1}. {sub.name}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 text-[11px]">
                    <span className="text-slate-500 font-mono">{sub.code}</span>
                    <span className="font-bold text-emerald-700">{sub.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
