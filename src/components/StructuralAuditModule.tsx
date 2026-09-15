import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Printer,
  FileCheck,
  TrendingDown,
  Building2,
  Users,
  Percent,
  Sliders,
  Sparkles,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Search,
} from "lucide-react";
import { CommuneProfile } from "../types";
import {
  runStructuralAudit,
  applyStructuralAutoFix,
  AuditIssue,
  AuditCategory,
  AuditIssueSeverity,
  AuditReportResult,
} from "../utils/structuralAudit";
import { formatVND } from "../utils/calculations";

interface StructuralAuditModuleProps {
  commune: CommuneProfile;
  onUpdateCommune: (updated: CommuneProfile) => void;
  onNavigateToTab?: (tab: "tgtsp" | "tnbq" | "report") => void;
}

export const StructuralAuditModule: React.FC<StructuralAuditModuleProps> = ({
  commune,
  onUpdateCommune,
  onNavigateToTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | AuditCategory
  >("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<
    "ALL" | AuditIssueSeverity
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoFixSuccessMsg, setAutoFixSuccessMsg] = useState<string | null>(null);

  // Run audit engine
  const auditResult: AuditReportResult = useMemo(() => {
    return runStructuralAudit(commune);
  }, [commune]);

  // Handle auto-fix single issue
  const handleAutoFix = (issue: AuditIssue) => {
    if (!issue.autoFixActionKey) return;
    const updated = applyStructuralAutoFix(
      commune,
      issue.autoFixActionKey,
      issue.affectedRowId || issue.affectedHouseholdId
    );
    onUpdateCommune(updated);
    setAutoFixSuccessMsg(
      `Đã tự động xử lý thành công: "${issue.title}". Số liệu đã được cập nhật!`
    );
    setTimeout(() => setAutoFixSuccessMsg(null), 4000);
  };

  // Handle auto-fix all
  const handleAutoFixAll = () => {
    let current = JSON.parse(JSON.stringify(commune)) as CommuneProfile;
    auditResult.issues.forEach((iss) => {
      if (iss.canAutoFix && iss.autoFixActionKey) {
        current = applyStructuralAutoFix(
          current,
          iss.autoFixActionKey,
          iss.affectedRowId || iss.affectedHouseholdId
        );
      }
    });
    onUpdateCommune(current);
    setAutoFixSuccessMsg(
      "Đã tự động xử lý toàn bộ các điểm cảnh báo cấu trúc có thể can thiệp!"
    );
    setTimeout(() => setAutoFixSuccessMsg(null), 5000);
  };

  // Filter issues
  const filteredIssues = auditResult.issues.filter((issue) => {
    if (selectedCategory !== "ALL" && issue.category !== selectedCategory) {
      return false;
    }
    if (selectedSeverity !== "ALL" && issue.severity !== selectedSeverity) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.clause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fixableCount = auditResult.issues.filter((i) => i.canAutoFix).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Audit Score */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Header info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Công cụ tự động hóa kiểm tra dữ liệu
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Kiểm toán Số liệu Cấu trúc Cấp xã
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Hệ thống tự động đối chiếu các quan hệ cân đối vĩ mô - vi mô giữa{" "}
              <strong>Tổng giá trị sản phẩm (TGTSP)</strong> và{" "}
              <strong>Thu nhập bình quân (TNBQ)</strong>, kiểm tra khống chế trần cấp tỉnh, tỷ suất chi phí trung gian và quy tắc loại trừ giao dịch vốn theo{" "}
              <strong>Quyết định số 2545/QĐ-BTC</strong>.
            </p>
          </div>

          {/* Audit Score Card */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 min-w-[280px]">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    auditResult.auditScore >= 85
                      ? "text-emerald-600"
                      : auditResult.auditScore >= 70
                      ? "text-amber-500"
                      : "text-rose-600"
                  }
                  strokeDasharray={`${auditResult.auditScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {auditResult.auditScore}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">/100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 block">Độ tin cậy số liệu:</span>
              <span
                className={`text-sm font-black uppercase ${
                  auditResult.healthStatus === "EXCELLENT"
                    ? "text-emerald-700"
                    : auditResult.healthStatus === "GOOD"
                    ? "text-emerald-600"
                    : auditResult.healthStatus === "NEEDS_ATTENTION"
                    ? "text-amber-600"
                    : "text-rose-700"
                }`}
              >
                {auditResult.healthStatus === "EXCELLENT" && "Rất tốt / Đạt chuẩn"}
                {auditResult.healthStatus === "GOOD" && "Tốt / Đạt nghiệm thu"}
                {auditResult.healthStatus === "NEEDS_ATTENTION" && "Cần rà soát bổ sung"}
                {auditResult.healthStatus === "CRITICAL_RISK" && "Rủi ro sai lệch cao"}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="text-rose-700 font-bold">{auditResult.criticalCount} lỗi</span>
                <span>•</span>
                <span className="text-amber-700 font-bold">{auditResult.warningCount} cảnh báo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {autoFixSuccessMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{autoFixSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Structural Macro Balance 4-Card Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Macro Ratio TNBQ / TGTSP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Tỷ số TNBQ / TGTSP</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {auditResult.metrics.ratioTNBQToTGTSP.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Thu nhập toàn xã: {auditResult.metrics.communeTotalIncomeEstimatedBillion.toFixed(1)} tỷ /{" "}
            {(auditResult.metrics.totalTGTSPCurrent / 1000).toFixed(1)} tỷ TGTSP
          </p>
          <div className="mt-2">
            {auditResult.metrics.ratioTNBQToTGTSP > 100 ? (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Thu nhập &gt; TGTSP (Cần giải trình)
              </span>
            ) : auditResult.metrics.ratioTNBQToTGTSP >= 35 ? (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Cân đối hợp lý (35% - 80%)
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                Tỷ lệ thấp (Dân cư thù lao thấp)
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Provincial Cap */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Khống chế trần tỉnh</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {auditResult.metrics.provincialExcessRatio.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tổng các xã: {(commune.sumAllCommunesTGTSP / 1000).toFixed(1)} tỷ /{" "}
            {(commune.provincialGTSX / 1000).toFixed(1)} tỷ tỉnh
          </p>
          <div className="mt-2">
            {commune.sumAllCommunesTGTSP > commune.provincialGTSX ? (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                Bị vượt trần ({((commune.sumAllCommunesTGTSP / commune.provincialGTSX - 1) * 100).toFixed(1)}%)
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                An toàn (Đạt chuẩn QĐ 2545)
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Sector Structure Proportions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Cơ cấu 3 Khu vực</span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-700">I. Nông nghiệp:</span>
              <span>{auditResult.metrics.sector1Ratio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-indigo-700">II. CN - Xây dựng:</span>
              <span>{auditResult.metrics.sector2Ratio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-700">III. Dịch vụ:</span>
              <span>{auditResult.metrics.sector3Ratio.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-slate-500 font-medium">
              Chuẩn SNA hệ thống tài khoản quốc gia
            </span>
          </div>
        </div>

        {/* Card 4: Sampling Representation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Độ đại diện mẫu điều tra</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {commune.surveys?.length || 0} / {commune.sampleCount || 30} hộ
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đạt {auditResult.metrics.sampleSizeAdequacy}% cỡ mẫu phân bổ • {auditResult.metrics.outlierHouseholdsCount} hộ dị biệt
          </p>
          <div className="mt-2">
            {auditResult.metrics.sampleSizeAdequacy >= 100 ? (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Đủ cơ số mẫu đại diện
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Thiếu {Math.max(0, (commune.sampleCount || 30) - (commune.surveys?.length || 0))} phiếu mẫu
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Auto-Fix Action */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category & Severity Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Lọc theo nhóm:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">Tất cả nhóm kiểm toán ({auditResult.totalIssues})</option>
            <option value="MACRO_MICRO_BALANCE">Cân đối vĩ mô TGTSP - TNBQ</option>
            <option value="PROVINCIAL_CAP">Khống chế trần cấp tỉnh</option>
            <option value="CALCULATION_METHOD">Phương pháp biên soạn từng ngành</option>
            <option value="HOUSEHOLD_SURVEY">Thu nhập hộ mẫu & Loại trừ vốn</option>
            <option value="SECTOR_STRUCTURE">Cơ cấu 3 khu vực kinh tế</option>
            <option value="STATISTICAL_SAMPLE">Mẫu điều tra & Mẫu dị biệt</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
          >
            <option value="ALL">Tất cả mức độ rủi ro</option>
            <option value="CRITICAL">Nghiêm trọng ({auditResult.criticalCount})</option>
            <option value="WARNING">Cảnh báo ({auditResult.warningCount})</option>
            <option value="INFO">Gợi ý ({auditResult.infoCount})</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-44 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {fixableCount > 0 && (
            <button
              onClick={handleAutoFixAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Tự động áp dụng hệ số trần tỉnh k, chuẩn hóa xác nhận loại trừ vốn và thặng dư thương mại"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Sửa nhanh tất cả ({fixableCount})</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="In hoặc lưu Biên bản kiểm toán cấu trúc thống kê"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In biên bản</span>
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Không phát hiện vi phạm cấu trúc nào!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Bộ dữ liệu của {commune.communeName} hoàn toàn thỏa mãn các tiêu chí kiểm toán logic, cân đối vĩ mô - vi mô và quy tắc nghiệm thu theo QĐ 2545/QĐ-BTC.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`bg-white rounded-xl p-4 sm:p-5 border transition shadow-2xs hover:shadow-xs ${
                issue.severity === "CRITICAL"
                  ? "border-rose-200 hover:border-rose-300 bg-gradient-to-r from-rose-50/20 to-transparent"
                  : issue.severity === "WARNING"
                  ? "border-amber-200 hover:border-amber-300 bg-gradient-to-r from-amber-50/20 to-transparent"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {issue.severity === "CRITICAL" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        LỖI NGHIÊM TRỌNG
                      </span>
                    ) : issue.severity === "WARNING" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        CẢNH BÁO CẤU TRÚC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        <Info className="w-3 h-3 text-blue-600" />
                        GỢI Ý TỐI ƯU
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {issue.category === "MACRO_MICRO_BALANCE" && "Cân đối vĩ mô"}
                      {issue.category === "PROVINCIAL_CAP" && "Trần cấp tỉnh"}
                      {issue.category === "CALCULATION_METHOD" && "Phương pháp tính"}
                      {issue.category === "HOUSEHOLD_SURVEY" && "Khảo sát hộ mẫu"}
                      {issue.category === "SECTOR_STRUCTURE" && "Cơ cấu ngành"}
                      {issue.category === "PRICE_INDEX" && "Chỉ số giá"}
                      {issue.category === "STATISTICAL_SAMPLE" && "Mẫu & Dị biệt"}
                    </span>

                    <span className="text-[11px] text-slate-400 italic">
                      {issue.clause}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {issue.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {issue.description}
                  </p>

                  {/* Values contrast */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[11px] font-sans font-medium text-slate-500 block">
                        Giá trị thực tế ghi nhận:
                      </span>
                      <strong className="text-rose-700">{issue.currentValueText}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[11px] font-sans font-medium text-slate-500 block">
                        Ngưỡng chuẩn kiểm toán QĐ 2545:
                      </span>
                      <strong className="text-emerald-700">{issue.expectedBenchmark}</strong>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-amber-900 font-semibold">Đề xuất xử lý: </strong>
                      <span>{issue.recommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Single Fix Action */}
                <div className="sm:text-right shrink-0 pt-1 sm:pt-0">
                  {issue.canAutoFix && (
                    <button
                      onClick={() => handleAutoFix(issue)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Sửa nhanh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Audit Certificate / Reference Footer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Biên bản kiểm toán số liệu cấu trúc được lập tự động vào lúc:{" "}
            <strong>{auditResult.auditTimestamp}</strong>
          </span>
        </div>
        <div className="text-slate-500">
          Căn cứ Quyết định 2545/QĐ-BTC Bộ Tài chính & Chuẩn mực Thống kê SNA
        </div>
      </div>
    </div>
  );
};
