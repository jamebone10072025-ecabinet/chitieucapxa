import React, { useState, useMemo } from "react";
import {
  Map as MapIcon,
  Layers,
  Building2,
  Users,
  Award,
  BarChart2,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Route,
  Droplets,
  Mountain,
  Share2,
  Printer,
  Info,
} from "lucide-react";
import { CommuneProfile } from "../types";
import {
  GEO_COMMUNE_FEATURES,
  buildCommuneMapData,
  CommuneMapDataPoint,
} from "../utils/communeGeoData";
import { formatVND } from "../utils/calculations";

interface CommuneGeoMapModuleProps {
  communes: CommuneProfile[];
  currentCommuneId: string;
  onSelectCommune: (id: string) => void;
  onNavigateToTab?: (tab: "tgtsp" | "tnbq" | "report" | "audit") => void;
}

export type MapThematicLayer =
  | "TGTSP"
  | "TNBQ"
  | "NTM"
  | "ECONOMIC_ZONE"
  | "DENSITY";

export const CommuneGeoMapModule: React.FC<CommuneGeoMapModuleProps> = ({
  communes,
  currentCommuneId,
  onSelectCommune,
  onNavigateToTab,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapThematicLayer>("TGTSP");
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>(currentCommuneId);
  const [hoveredCommuneId, setHoveredCommuneId] = useState<string | null>(null);
  const [showRoads, setShowRoads] = useState(true);
  const [showWaterBodies, setShowWaterBodies] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Compute map data
  const mapData = useMemo(() => {
    return buildCommuneMapData(communes);
  }, [communes]);

  const selectedDataPoint = useMemo(() => {
    return (
      mapData.find((d) => d.feature.id === selectedCommuneId) ||
      mapData[0]
    );
  }, [mapData, selectedCommuneId]);

  // Aggregate metrics
  const totalRegionTGTSP = mapData.reduce((sum, d) => sum + d.totalTGTSPCurrent, 0);
  const avgRegionTNBQ =
    mapData.length > 0
      ? mapData.reduce((sum, d) => sum + d.tnbqMillionAnnual, 0) / mapData.length
      : 0;
  const maxTNBQ = Math.max(...mapData.map((d) => d.tnbqMillionAnnual));
  const minTNBQ = Math.min(...mapData.map((d) => d.tnbqMillionAnnual));
  const disparityRatio = minTNBQ > 0 ? (maxTNBQ / minTNBQ).toFixed(2) : "1.0";

  // Helper for polygon fill colors based on active layer
  const getPolygonFill = (point: CommuneMapDataPoint, isSelected: boolean) => {
    switch (activeLayer) {
      case "TGTSP": {
        // Range 100k - 500k million
        const val = point.totalTGTSPCurrent;
        if (val >= 400000) return isSelected ? "#c2410c" : "#ea580c"; // cam đậm
        if (val >= 250000) return isSelected ? "#ea580c" : "#f97316";
        if (val >= 150000) return isSelected ? "#f97316" : "#fb923c";
        return isSelected ? "#fb923c" : "#fed7aa";
      }
      case "TNBQ": {
        // Range 60 - 85 million
        const val = point.tnbqMillionAnnual;
        if (val >= 78) return isSelected ? "#047857" : "#059669"; // xanh lục đậm
        if (val >= 70) return isSelected ? "#059669" : "#10b981";
        if (val >= 65) return isSelected ? "#0d9488" : "#14b8a6";
        return isSelected ? "#0891b2" : "#38bdf8";
      }
      case "NTM": {
        if (point.ntmStatus === "NTM_ADVANCED") {
          return isSelected ? "#15803d" : "#22c55e"; // xanh lá chuẩn nâng cao
        }
        if (point.ntmStatus === "NTM_BASIC") {
          return isSelected ? "#d97706" : "#f59e0b"; // vàng hổ phách chuẩn cơ bản
        }
        return isSelected ? "#dc2626" : "#ef4444"; // đỏ chưa đạt
      }
      case "ECONOMIC_ZONE": {
        if (point.feature.economicZone === "Dịch vụ - Đô thị")
          return isSelected ? "#4338ca" : "#6366f1"; // tím xanh
        if (point.feature.economicZone === "Thương mại tổng hợp")
          return isSelected ? "#b45309" : "#d97706"; // hổ phách
        if (point.feature.economicZone === "Nông nghiệp công nghệ cao")
          return isSelected ? "#15803d" : "#16a34a"; // xanh lá
        return isSelected ? "#0f766e" : "#0d9488"; // ngọc bích
      }
      case "DENSITY": {
        const d = point.densityPeoplePerKm2;
        if (d >= 800) return isSelected ? "#475569" : "#64748b";
        if (d >= 400) return isSelected ? "#64748b" : "#94a3b8";
        return isSelected ? "#94a3b8" : "#cbd5e1";
      }
      default:
        return "#cbd5e1";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Thematic Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900">
                <MapIcon className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                  Hệ thống thông tin địa lý kinh tế xã (GIS)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Bản đồ Hóa Số liệu Kinh tế - Xã hội Cấp xã
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Trực quan hóa không gian ranh giới hành chính, quy mô Tổng giá trị sản phẩm (TGTSP), Thu nhập bình quân đầu người (TNBQ) và mức độ đạt chuẩn Tiêu chí 10 Nông thôn mới trên địa bàn liên xã.
            </p>
          </div>

          {/* Regional Macro Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Tổng TGTSP Vùng liên xã
              </span>
              <span className="text-base font-black text-amber-700">
                {formatVND(Math.round(totalRegionTGTSP / 1000), "tỷ đ")}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                TNBQ Vùng bình quân
              </span>
              <span className="text-base font-black text-emerald-700">
                {avgRegionTNBQ.toFixed(1)} tr.đ/người
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Hệ số chênh lệch không gian
              </span>
              <span className="text-base font-black text-indigo-700">
                {disparityRatio}x (Max/Min)
              </span>
            </div>
          </div>
        </div>

        {/* Thematic Layer Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveLayer("TGTSP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeLayer === "TGTSP"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Quy mô TGTSP</span>
            </button>

            <button
              onClick={() => setActiveLayer("TNBQ")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeLayer === "TNBQ"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Thu nhập TNBQ</span>
            </button>

            <button
              onClick={() => setActiveLayer("NTM")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeLayer === "NTM"
                  ? "bg-white text-emerald-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Chuẩn NTM số 10</span>
            </button>

            <button
              onClick={() => setActiveLayer("ECONOMIC_ZONE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeLayer === "ECONOMIC_ZONE"
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Phân vùng kinh tế</span>
            </button>

            <button
              onClick={() => setActiveLayer("DENSITY")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeLayer === "DENSITY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
              <span>5. Mật độ dân số</span>
            </button>
          </div>

          {/* Map display options */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Tuyến Quốc lộ & Vành đai</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showWaterBodies}
                onChange={(e) => setShowWaterBodies(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Thủy văn & Hồ đập</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded text-slate-600 focus:ring-slate-500"
              />
              <span>Nhãn hành chính</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Map (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          {/* Map Toolbar & Legend */}
          <div className="flex items-center justify-between mb-3 text-xs">
            {/* Dynamic Legend */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Chú giải lớp bản đồ:</span>
              {activeLayer === "TGTSP" && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#ea580c] inline-block" />
                    &gt; 400 tỷ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#f97316] inline-block" />
                    250 - 400 tỷ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#fb923c] inline-block" />
                    150 - 250 tỷ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#fed7aa] inline-block" />
                    &lt; 150 tỷ
                  </span>
                </div>
              )}
              {activeLayer === "TNBQ" && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#059669] inline-block" />
                    &ge; 78 tr.đ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#10b981] inline-block" />
                    70 - 78 tr.đ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#14b8a6] inline-block" />
                    65 - 70 tr.đ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#38bdf8] inline-block" />
                    &lt; 65 tr.đ
                  </span>
                </div>
              )}
              {activeLayer === "NTM" && (
                <div className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#22c55e] inline-block" />
                    NTM Nâng cao
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#f59e0b] inline-block" />
                    NTM Cơ bản
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#ef4444] inline-block" />
                    Chưa đạt
                  </span>
                </div>
              )}
              {activeLayer === "ECONOMIC_ZONE" && (
                <div className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#6366f1] inline-block" />
                    Đô thị - Dịch vụ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#d97706] inline-block" />
                    Thương mại
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#16a34a] inline-block" />
                    Nông nghiệp CNC
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-xs bg-[#0d9488] inline-block" />
                    Cà phê &amp; Chế biến
                  </span>
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 rounded hover:bg-white text-slate-700"
                title="Phóng to"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                className="p-1 rounded hover:bg-white text-slate-700"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded hover:bg-white text-slate-700"
                title="Đặt lại góc nhìn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-50 via-slate-100/60 to-emerald-50/30 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2">
            {/* North Compass Rose */}
            <div className="absolute top-3 right-3 flex flex-col items-center pointer-events-none opacity-80 z-10">
              <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-300 shadow-xs flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-700" />
              </div>
              <span className="text-[9px] font-black text-slate-600 mt-0.5">BẮC</span>
            </div>

            <svg
              viewBox="0 0 800 600"
              className="w-full h-full select-none transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Drop shadow filter for active commune */}
                <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
                </filter>
                {/* Water Pattern */}
                <pattern id="water-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 0 4 Q 2 2, 4 4 T 8 4" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />
                </pattern>
              </defs>

              {/* Surrounding Mountain / Plateau Contour lines */}
              <g className="opacity-30 stroke-slate-400 fill-none" strokeWidth="0.5" strokeDasharray="3,3">
                <circle cx="200" cy="120" r="80" />
                <circle cx="700" cy="500" r="110" />
                <path d="M 50 450 Q 120 520 200 580" />
              </g>

              {/* Natural Water Bodies (Biển Hồ & Rivers) */}
              {showWaterBodies && (
                <g id="water-layer">
                  {/* Biển Hồ T'Nưng (Hồ tự nhiên danh thắng phía Bắc) */}
                  <ellipse
                    cx="480"
                    cy="85"
                    rx="65"
                    ry="35"
                    className="fill-sky-200/80 stroke-sky-400"
                    strokeWidth="1.5"
                  />
                  <text
                    x="480"
                    y="88"
                    textAnchor="middle"
                    className="fill-sky-800 text-[10px] font-bold font-serif italic"
                  >
                    Hồ T&apos;Nưng (Biển Hồ)
                  </text>

                  {/* Suối Hội Phú - chảy qua phường Quy Nhơn */}
                  <path
                    d="M 120 250 Q 200 280 270 340 T 360 480"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.7"
                  />

                  {/* Hồ Ia Ring / Suối Chư Á */}
                  <ellipse
                    cx="650"
                    cy="290"
                    rx="25"
                    ry="18"
                    className="fill-cyan-200/80 stroke-cyan-400"
                    strokeWidth="1.2"
                  />
                </g>
              )}

              {/* Commune Administrative Polygons */}
              <g id="commune-polygons">
                {mapData.map((point) => {
                  const isSelected = point.feature.id === selectedCommuneId;
                  const isHovered = point.feature.id === hoveredCommuneId;
                  const fillColor = getPolygonFill(point, isSelected);

                  return (
                    <g
                      key={point.feature.id}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedCommuneId(point.feature.id)}
                      onMouseEnter={() => setHoveredCommuneId(point.feature.id)}
                      onMouseLeave={() => setHoveredCommuneId(null)}
                    >
                      {/* Polygon boundary */}
                      <path
                        d={point.feature.svgPath}
                        fill={fillColor}
                        stroke={isSelected ? "#0f172a" : "#475569"}
                        strokeWidth={isSelected ? "3" : "1.5"}
                        filter={isSelected ? "url(#map-glow)" : undefined}
                        className={`transition-all duration-200 ${
                          isHovered ? "brightness-110 opacity-95" : "opacity-90"
                        }`}
                      />

                      {/* Bubble Proportional Symbol (for TGTSP / TNBQ) */}
                      {activeLayer === "TGTSP" && (
                        <circle
                          cx={point.feature.centerPoint.x}
                          cy={point.feature.centerPoint.y - 12}
                          r={Math.max(14, Math.min(32, point.totalTGTSPCurrent / 14000))}
                          fill="#ffffff"
                          fillOpacity="0.4"
                          stroke="#c2410c"
                          strokeWidth="1.5"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Administrative Labels */}
                      {showLabels && (
                        <g className="pointer-events-none">
                          {/* Commune Name Pin */}
                          <rect
                            x={point.feature.centerPoint.x - 55}
                            y={point.feature.centerPoint.y - 8}
                            width="110"
                            height="24"
                            rx="5"
                            fill="#ffffff"
                            fillOpacity="0.92"
                            stroke={isSelected ? "#0f172a" : "#cbd5e1"}
                            strokeWidth="1"
                          />
                          <text
                            x={point.feature.centerPoint.x}
                            y={point.feature.centerPoint.y + 7}
                            textAnchor="middle"
                            className="font-bold text-[11px] fill-slate-900"
                          >
                            {point.feature.communeName}
                          </text>

                          {/* Stat Badge under name */}
                          <rect
                            x={point.feature.centerPoint.x - 42}
                            y={point.feature.centerPoint.y + 20}
                            width="84"
                            height="16"
                            rx="3"
                            fill={isSelected ? "#0f172a" : "#1e293b"}
                          />
                          <text
                            x={point.feature.centerPoint.x}
                            y={point.feature.centerPoint.y + 31}
                            textAnchor="middle"
                            className="font-mono font-bold text-[9px] fill-amber-300"
                          >
                            {activeLayer === "TGTSP" &&
                              `${Math.round(point.totalTGTSPCurrent / 1000)} tỷ đ`}
                            {activeLayer === "TNBQ" &&
                              `${point.tnbqMillionAnnual.toFixed(1)} tr.đ/người`}
                            {activeLayer === "NTM" &&
                              (point.ntmStatus === "NTM_ADVANCED"
                                ? "NTM Nâng cao"
                                : "NTM Cơ bản")}
                            {activeLayer === "ECONOMIC_ZONE" &&
                              point.feature.economicZone.slice(0, 14)}
                            {activeLayer === "DENSITY" &&
                              `${point.densityPeoplePerKm2} ng/km²`}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Main Transportation Arteries (National Highways) */}
              {showRoads && (
                <g id="road-network" className="pointer-events-none">
                  {/* Quốc lộ 14 (Bắc - Nam qua Phường Quy Nhơn) */}
                  <path
                    d="M 230 40 L 250 180 L 270 330 L 290 580"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    strokeDasharray="6,2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <text
                    x="245"
                    y="110"
                    className="fill-red-800 text-[9px] font-bold rotate-85"
                  >
                    Quốc lộ 14
                  </text>

                  {/* Quốc lộ 19 (Đông - Tây qua Thắng Lợi & Chư Á đi Bình Định) */}
                  <path
                    d="M 260 210 L 390 200 L 520 240 L 760 280"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <text
                    x="560"
                    y="245"
                    className="fill-amber-900 text-[9px] font-bold rotate-10"
                  >
                    Quốc lộ 19 (đi Quy Nhơn)
                  </text>

                  {/* Đường vành đai liên xã An Phú */}
                  <path
                    d="M 330 360 L 450 420 L 540 520"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.8"
                    strokeDasharray="4,3"
                    opacity="0.7"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Map Footnote */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              * Nhấp vào từng xã/phường trên bản đồ để xem phân tích chi tiết &amp; đối sánh
            </span>
            <span>Hệ quy chiếu: WGS-84 / Bản đồ chuyên đề cấp xã QĐ 2545</span>
          </div>
        </div>

        {/* Selected Commune Detailed Analysis (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Card for Selected Commune */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                    {selectedDataPoint.feature.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedDataPoint.feature.districtName}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedDataPoint.feature.communeName}
                </h3>
              </div>

              {/* Set as Active Commune in App */}
              {selectedDataPoint.feature.id !== currentCommuneId ? (
                <button
                  onClick={() => onSelectCommune(selectedDataPoint.feature.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Chọn làm xã làm việc chính thức cho toàn ứng dụng"
                >
                  Kích hoạt xã này
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang làm việc
                </span>
              )}
            </div>

            {/* Geographic & Natural Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Diện tích tự nhiên
                </span>
                <span className="font-bold text-slate-900">
                  {selectedDataPoint.feature.areaKm2} km²
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Mật độ dân số
                </span>
                <span className="font-bold text-slate-900">
                  {selectedDataPoint.densityPeoplePerKm2} người/km²
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Tổng dân số / Số hộ
                </span>
                <span className="font-bold text-slate-900">
                  {selectedDataPoint.population.toLocaleString()} ng /{" "}
                  {selectedDataPoint.households.toLocaleString()} hộ
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Địa hình đặc trưng
                </span>
                <span className="font-bold text-slate-800 text-[11px]">
                  {selectedDataPoint.feature.terrain}
                </span>
              </div>
            </div>

            {/* Core Statistical Metrics */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                Chỉ số kinh tế QĐ 2545/QĐ-BTC:
              </span>

              {/* Metric: TGTSP */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Tổng giá trị sản phẩm (TGTSP)
                    </span>
                    <span className="text-[10px] text-amber-700">
                      Giá hiện hành • Phụ lục I
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-800">
                  {formatVND(Math.round(selectedDataPoint.totalTGTSPCurrent / 1000), "tỷ đ")}
                </span>
              </div>

              {/* Metric: TNBQ */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Thu nhập bình quân (TNBQ)
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Phụ lục II • Tiêu chí số 10 NTM
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-800">
                  {selectedDataPoint.tnbqMillionAnnual.toFixed(2)} tr.đ
                </span>
              </div>

              {/* Metric: NTM Status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Đánh giá NTM Tiêu chí 10:</span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                    selectedDataPoint.ntmStatus === "NTM_ADVANCED"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedDataPoint.ntmStatus === "NTM_BASIC"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedDataPoint.ntmStatus === "NTM_ADVANCED" && "Đạt NTM Nâng cao"}
                  {selectedDataPoint.ntmStatus === "NTM_BASIC" && "Đạt NTM Cơ bản"}
                  {selectedDataPoint.ntmStatus === "NOT_QUALIFIED" && "Chưa đạt chuẩn"}
                </span>
              </div>
            </div>

            {/* Economic Sector Breakdown Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Cơ cấu 3 Khu vực kinh tế:</span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div
                  style={{ width: `${selectedDataPoint.sectorRatios.s1}%` }}
                  className="bg-emerald-600 h-full"
                  title={`Nông lâm thủy sản: ${selectedDataPoint.sectorRatios.s1.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${selectedDataPoint.sectorRatios.s2}%` }}
                  className="bg-indigo-600 h-full"
                  title={`Công nghiệp - Xây dựng: ${selectedDataPoint.sectorRatios.s2.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${selectedDataPoint.sectorRatios.s3}%` }}
                  className="bg-amber-500 h-full"
                  title={`Dịch vụ: ${selectedDataPoint.sectorRatios.s3.toFixed(1)}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-700">
                  I. Nông: {selectedDataPoint.sectorRatios.s1.toFixed(1)}%
                </span>
                <span className="text-indigo-700">
                  II. CN-XD: {selectedDataPoint.sectorRatios.s2.toFixed(1)}%
                </span>
                <span className="text-amber-700">
                  III. DV: {selectedDataPoint.sectorRatios.s3.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Quick Actions to Other Modules */}
            {onNavigateToTab && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateToTab("tgtsp")}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Xem TGTSP</span>
                </button>
                <button
                  onClick={() => onNavigateToTab("audit")}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Kiểm toán xã</span>
                </button>
              </div>
            )}
          </div>

          {/* Spatial Ranking Table */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Bảng xếp hạng kinh tế không gian</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {[...mapData]
                .sort((a, b) => b.tnbqMillionAnnual - a.tnbqMillionAnnual)
                .map((item, idx) => (
                  <div
                    key={item.feature.id}
                    onClick={() => setSelectedCommuneId(item.feature.id)}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      item.feature.id === selectedCommuneId
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span>{item.feature.communeName}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">
                      {item.tnbqMillionAnnual.toFixed(1)} tr.đ
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
