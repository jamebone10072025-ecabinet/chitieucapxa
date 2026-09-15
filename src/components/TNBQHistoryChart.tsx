import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
} from "recharts";
import {
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
  Edit3,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Table,
  CheckCircle2,
} from "lucide-react";
import { CommuneProfile, TNBQYearlyRecord } from "../types";
import { calculateCommuneTNBQ, formatVND } from "../utils/calculations";

interface TNBQHistoryChartProps {
  commune: CommuneProfile;
  onUpdateCommune?: (updated: CommuneProfile) => void;
}

export const TNBQHistoryChart: React.FC<TNBQHistoryChartProps> = ({
  commune,
  onUpdateCommune,
}) => {
  // Chế độ hiển thị:
  // "standard": So sánh TNBQ với chuẩn NTM (Triệu đồng/năm)
  // "growth": Tốc độ tăng trưởng hàng năm (%)
  // "monthly": Quy đổi Thu nhập bình quân tháng (Nghìn đồng/tháng)
  const [viewMode, setViewMode] = useState<"standard" | "growth" | "monthly">("standard");
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showTableDetail, setShowTableDetail] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  // Tính toán TNBQ của năm hiện hành từ phiếu điều tra
  const currentCalc = useMemo(() => calculateCommuneTNBQ(commune), [commune]);

  // Chuẩn bị dữ liệu lịch sử
  const historyData = useMemo(() => {
    const rawList: TNBQYearlyRecord[] = commune.tnbqHistory && commune.tnbqHistory.length > 0
      ? [...commune.tnbqHistory]
      : [
          { year: 2021, tnbqMillionVND: 49.2, ntmStandardMillionVND: 42.0, growthRatePercent: 8.5 },
          { year: 2022, tnbqMillionVND: 54.1, ntmStandardMillionVND: 48.0, growthRatePercent: 9.96 },
          { year: 2023, tnbqMillionVND: 59.8, ntmStandardMillionVND: 53.0, growthRatePercent: 10.54 },
          { year: 2024, tnbqMillionVND: 65.5, ntmStandardMillionVND: 57.0, growthRatePercent: 9.53 },
          { year: 2025, tnbqMillionVND: 70.8, ntmStandardMillionVND: 62.0, growthRatePercent: 8.09 },
          {
            year: commune.reportingYear || 2026,
            tnbqMillionVND: currentCalc.averagePerCapitaAnnualMillionVND || 76.5,
            ntmStandardMillionVND: 68.0,
            growthRatePercent: 8.05,
          },
        ];

    // Sắp xếp theo thứ tự năm tăng dần
    const sorted = [...rawList].sort((a, b) => a.year - b.year);

    // Đồng bộ năm báo cáo hiện hành với số liệu khảo sát thực tế (nếu có khảo sát)
    return sorted.map((item, index, arr) => {
      let tnbq = item.tnbqMillionVND;
      if (item.year === commune.reportingYear && currentCalc.averagePerCapitaAnnualMillionVND > 0) {
        tnbq = currentCalc.averagePerCapitaAnnualMillionVND;
      }

      // Tính tốc độ tăng trưởng so với năm trước nếu chưa có
      let growth = item.growthRatePercent;
      if (index > 0 && (!growth || growth === 0)) {
        const prevTnbq = arr[index - 1].tnbqMillionVND;
        growth = prevTnbq > 0 ? Number((((tnbq - prevTnbq) / prevTnbq) * 100).toFixed(2)) : 0;
      }

      const monthlyThousand = Math.round((tnbq * 1000) / 12);
      const exceedNTM = item.ntmStandardMillionVND
        ? Number((tnbq - item.ntmStandardMillionVND).toFixed(2))
        : 0;

      return {
        ...item,
        tnbqMillionVND: Number(tnbq.toFixed(2)),
        growthRatePercent: growth || 0,
        monthlyThousand,
        exceedNTM,
        displayYear: `Năm ${item.year}`,
      };
    });
  }, [commune.tnbqHistory, commune.reportingYear, currentCalc.averagePerCapitaAnnualMillionVND]);

  // Tính toán các chỉ số phân tích tăng trưởng
  const summaryMetrics = useMemo(() => {
    if (historyData.length < 2) {
      return {
        startYear: 2021,
        endYear: 2026,
        startVal: 0,
        endVal: 0,
        totalIncreaseMillion: 0,
        totalGrowthPercent: 0,
        aagrPercent: 0,
        latestExceedNTM: 0,
      };
    }

    const first = historyData[0];
    const last = historyData[historyData.length - 1];
    const nYears = last.year - first.year;

    const totalIncreaseMillion = last.tnbqMillionVND - first.tnbqMillionVND;
    const totalGrowthPercent =
      first.tnbqMillionVND > 0
        ? (totalIncreaseMillion / first.tnbqMillionVND) * 100
        : 0;

    // Tốc độ tăng trưởng bình quân hàng năm (AAGR - Average Annual Growth Rate)
    // AAGR = ((Last / First) ^ (1 / nYears) - 1) * 100
    const aagrPercent =
      first.tnbqMillionVND > 0 && nYears > 0
        ? (Math.pow(last.tnbqMillionVND / first.tnbqMillionVND, 1 / nYears) - 1) * 100
        : 0;

    const latestExceedNTM =
      last.ntmStandardMillionVND !== undefined
        ? last.tnbqMillionVND - last.ntmStandardMillionVND
        : 0;

    return {
      startYear: first.year,
      endYear: last.year,
      startVal: first.tnbqMillionVND,
      endVal: last.tnbqMillionVND,
      totalIncreaseMillion: Number(totalIncreaseMillion.toFixed(2)),
      totalGrowthPercent: Number(totalGrowthPercent.toFixed(1)),
      aagrPercent: Number(aagrPercent.toFixed(2)),
      latestExceedNTM: Number(latestExceedNTM.toFixed(2)),
    };
  }, [historyData]);

  // Form quản lý lịch sử (Modal thêm/xóa)
  const [editableRecords, setEditableRecords] = useState<TNBQYearlyRecord[]>([]);

  const openEditor = () => {
    setEditableRecords(
      historyData.map((d) => ({
        year: d.year,
        tnbqMillionVND: d.tnbqMillionVND,
        ntmStandardMillionVND: d.ntmStandardMillionVND || 0,
        growthRatePercent: d.growthRatePercent || 0,
        sampleSize: d.sampleSize || 50,
        notes: d.notes || "",
      }))
    );
    setIsEditingModalOpen(true);
  };

  const saveEditor = () => {
    if (onUpdateCommune) {
      onUpdateCommune({
        ...commune,
        tnbqHistory: editableRecords,
      });
    }
    setIsEditingModalOpen(false);
  };

  const handleAddYear = () => {
    const nextYear = editableRecords.length > 0
      ? Math.max(...editableRecords.map((r) => r.year)) + 1
      : 2027;
    setEditableRecords([
      ...editableRecords,
      {
        year: nextYear,
        tnbqMillionVND: 80.0,
        ntmStandardMillionVND: 72.0,
        growthRatePercent: 8.0,
        sampleSize: 50,
        notes: "Số liệu dự kiến hoặc điều tra bổ sung",
      },
    ]);
  };

  const handleDeleteYear = (year: number) => {
    setEditableRecords(editableRecords.filter((r) => r.year !== year));
  };

  const handleUpdateRecord = (index: number, field: keyof TNBQYearlyRecord, value: any) => {
    const copy = [...editableRecords];
    copy[index] = { ...copy[index], [field]: value };
    setEditableRecords(copy);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Xu hướng biến động Thu nhập bình quân đầu người (TNBQ) qua các năm
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Biểu đồ chuỗi thời gian Recharts đánh giá tốc độ cải thiện đời sống nhân dân và khả năng giữ vững chuẩn Nông thôn mới tại {commune.communeName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Selector Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setViewMode("standard")}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === "standard"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              TNBQ & Chuẩn NTM
            </button>
            <button
              onClick={() => setViewMode("growth")}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === "growth"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tăng trưởng (%)
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Thu nhập tháng (nghìn đ)
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => setShowDataLabels(!showDataLabels)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              showDataLabels
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
            title="Bật/tắt nhãn số liệu trực tiếp trên các điểm đồ thị"
          >
            {showDataLabels ? "Ẩn nhãn số" : "Hiện nhãn số"}
          </button>

          <button
            onClick={() => setShowTableDetail(!showTableDetail)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-slate-500" />
            <span>{showTableDetail ? "Ẩn bảng số liệu" : "Xem bảng số liệu"}</span>
          </button>

          {onUpdateCommune && (
            <button
              onClick={openEditor}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Thêm hoặc hiệu chỉnh mốc năm trong chuỗi dữ liệu lịch sử"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Hiệu chỉnh mốc năm</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 font-semibold mb-1">
            <span>Tăng trưởng bình quân (AAGR)</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            +{summaryMetrics.aagrPercent}%<span className="text-xs font-normal text-emerald-700">/năm</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Giai đoạn {summaryMetrics.startYear} - {summaryMetrics.endYear}
          </p>
        </div>

        <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200">
          <div className="flex items-center justify-between text-blue-800 font-semibold mb-1">
            <span>Tổng mức tăng quy mô</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">
            +{summaryMetrics.totalIncreaseMillion} <span className="text-xs font-normal text-blue-700">tr.đ</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-0.5">
            Tăng +{summaryMetrics.totalGrowthPercent}% so với năm {summaryMetrics.startYear}
          </p>
        </div>

        <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200">
          <div className="flex items-center justify-between text-amber-800 font-semibold mb-1">
            <span>So với chuẩn NTM 2026</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            +{summaryMetrics.latestExceedNTM} <span className="text-xs font-normal text-amber-700">tr.đ</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Ngưỡng NTM nâng cao: 68.0 tr.đ/người/năm
          </p>
        </div>

        <div className="bg-purple-50/60 rounded-xl p-3.5 border border-purple-200">
          <div className="flex items-center justify-between text-purple-800 font-semibold mb-1">
            <span>Thu nhập tháng năm {commune.reportingYear}</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">
            {formatVND(Math.round((summaryMetrics.endVal * 1000) / 12))}
          </div>
          <p className="text-[11px] text-purple-700 mt-0.5">
            Nghìn đồng/người/tháng
          </p>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "growth" ? (
            // Composed Chart: Cột tăng trưởng (%) + Đường xu hướng
            <ComposedChart
              data={historyData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="growthBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                yAxisId="left"
                unit="%"
                domain={[0, "auto"]}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                unit=" tr.đ"
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#059669", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1.5 border border-slate-700">
                        <div className="font-bold text-amber-300 border-b border-slate-700 pb-1">
                          Năm {label}
                        </div>
                        <div className="text-emerald-300 flex items-center justify-between gap-4">
                          <span>Tốc độ tăng trưởng:</span>
                          <strong className="font-bold">+{item.growthRatePercent}%</strong>
                        </div>
                        <div className="text-slate-300 flex items-center justify-between gap-4">
                          <span>Mức TNBQ đạt được:</span>
                          <strong>{item.tnbqMillionVND} triệu đ</strong>
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Bar
                yAxisId="left"
                dataKey="growthRatePercent"
                name="Tốc độ tăng trưởng hàng năm (%)"
                fill="url(#growthBarGrad)"
                radius={[4, 4, 0, 0]}
                barSize={36}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tnbqMillionVND"
                name="Quy mô TNBQ (Triệu đồng/năm)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
              />
            </ComposedChart>
          ) : viewMode === "monthly" ? (
            // Line Chart: Thu nhập bình quân tháng
            <LineChart
              data={historyData}
              margin={{ top: 20, right: 30, left: 15, bottom: 20 }}
            >
              <defs>
                <linearGradient id="monthlyArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                unit=" k"
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 11 }}
                tickFormatter={(v) => formatVND(v)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 border border-slate-700">
                        <div className="font-bold text-amber-300 border-b border-slate-700 pb-1">
                          Năm {label}
                        </div>
                        <div className="text-purple-300 flex items-center justify-between gap-4">
                          <span>TNBQ / tháng:</span>
                          <strong>{formatVND(item.monthlyThousand)} nghìn đồng</strong>
                        </div>
                        <div className="text-slate-300 flex items-center justify-between gap-4">
                          <span>TNBQ cả năm:</span>
                          <strong>{item.tnbqMillionVND} triệu đồng</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="monthlyThousand"
                name="TNBQ đầu người / tháng (Nghìn đồng)"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#6d28d9", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            // Standard Chart: TNBQ xã so với Ngưỡng chuẩn NTM qua các năm
            <LineChart
              data={historyData}
              margin={{ top: 25, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="tnbqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                unit=" tr.đ"
                domain={[30, "auto"]}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                tick={{ fill: "#475569", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1.5 border border-slate-700 min-w-[220px]">
                        <div className="font-bold text-amber-300 border-b border-slate-700 pb-1 flex items-center justify-between">
                          <span>Năm {label}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                            +{item.growthRatePercent}% y/y
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400 font-semibold">
                          <span>TNBQ thực tế:</span>
                          <span className="text-sm font-black">{item.tnbqMillionVND} triệu đ</span>
                        </div>
                        {item.ntmStandardMillionVND && (
                          <div className="flex items-center justify-between text-amber-300">
                            <span>Ngưỡng chuẩn NTM:</span>
                            <span>{item.ntmStandardMillionVND} triệu đ</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800 text-[11px]">
                          <span>Chênh lệch so chuẩn:</span>
                          <span className={item.exceedNTM >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {item.exceedNTM >= 0 ? `+${item.exceedNTM}` : item.exceedNTM} triệu đ
                          </span>
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
              />

              {/* Đường Ngưỡng chuẩn tiêu chí NTM (Dashed Line) */}
              <Line
                type="monotone"
                dataKey="ntmStandardMillionVND"
                name="Ngưỡng chuẩn Nông thôn mới (triệu đồng)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#f59e0b", strokeWidth: 1.5, stroke: "#fff" }}
              />

              {/* Đường TNBQ Thực tế của xã */}
              <Line
                type="monotone"
                dataKey="tnbqMillionVND"
                name="TNBQ thực tế của xã (triệu đồng/người/năm)"
                stroke="#059669"
                strokeWidth={3.5}
                dot={{
                  r: 5,
                  fill: "#059669",
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{
                  r: 8,
                  fill: "#047857",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Detail Table of Yearly Records (Collapsible) */}
      {showTableDetail && (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-50 p-3 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Bảng theo dõi số liệu lịch sử TNBQ cấp xã qua các năm
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Đơn vị tính: Triệu đồng/người/năm
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Năm thống kê</th>
                  <th className="py-2.5 px-3 text-right">TNBQ / năm (tr.đ)</th>
                  <th className="py-2.5 px-3 text-right">TNBQ / tháng (nghìn đ)</th>
                  <th className="py-2.5 px-3 text-right">Tăng trưởng y/y (%)</th>
                  <th className="py-2.5 px-3 text-right">Chuẩn NTM (tr.đ)</th>
                  <th className="py-2.5 px-3 text-center">Đánh giá NTM</th>
                  <th className="py-2.5 px-3">Ghi chú bối cảnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historyData.map((row) => {
                  const isMet = (row.ntmStandardMillionVND || 0) <= row.tnbqMillionVND;
                  return (
                    <tr
                      key={row.year}
                      className={`hover:bg-slate-50/80 transition ${
                        row.year === commune.reportingYear ? "bg-emerald-50/40 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{row.year}</span>
                        {row.year === commune.reportingYear && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
                            Năm báo cáo
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {row.tnbqMillionVND.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatVND(row.monthlyThousand)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        +{row.growthRatePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                        {row.ntmStandardMillionVND?.toFixed(1) || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isMet
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {isMet ? "Đạt chuẩn" : "Chưa đạt"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {row.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa chuỗi số liệu lịch sử */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                  Hiệu chỉnh chuỗi số liệu lịch sử TNBQ cấp xã
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật các mốc năm theo hồ sơ điều tra lưu trữ của địa phương để biểu đồ Recharts phản ánh chính xác nhất.
                </p>
              </div>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-2 text-left w-20">Năm</th>
                    <th className="p-2 text-left w-32">TNBQ (Tr.đ/năm)</th>
                    <th className="p-2 text-left w-28">Chuẩn NTM</th>
                    <th className="p-2 text-left w-24">Cỡ mẫu (hộ)</th>
                    <th className="p-2 text-left">Ghi chú bối cảnh</th>
                    <th className="p-2 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {editableRecords.map((rec, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input
                          type="number"
                          value={rec.year}
                          onChange={(e) =>
                            handleUpdateRecord(index, "year", parseInt(e.target.value) || 2020)
                          }
                          className="w-full p-1 border rounded font-bold text-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={rec.tnbqMillionVND}
                          onChange={(e) =>
                            handleUpdateRecord(index, "tnbqMillionVND", parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-1 border rounded font-mono text-emerald-700 font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.5"
                          value={rec.ntmStandardMillionVND || 0}
                          onChange={(e) =>
                            handleUpdateRecord(index, "ntmStandardMillionVND", parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-1 border rounded font-mono text-amber-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={rec.sampleSize || 50}
                          onChange={(e) =>
                            handleUpdateRecord(index, "sampleSize", parseInt(e.target.value) || 50)
                          }
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={rec.notes || ""}
                          placeholder="Ghi chú sự kiện..."
                          onChange={(e) =>
                            handleUpdateRecord(index, "notes", e.target.value)
                          }
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteYear(rec.year)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa mốc năm này"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={handleAddYear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mốc năm</span>
              </button>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={saveEditor}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi vào hồ sơ xã</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
