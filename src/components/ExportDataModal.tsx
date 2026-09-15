import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Table,
  Users,
  TrendingUp,
  Building2,
  X,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";
import { CommuneProfile } from "../types";
import {
  exportCommuneToExcel,
  exportTGTSPToCSV,
  exportTNBQSurveysToCSV,
  exportTNBQHistoryToCSV,
} from "../utils/exportData";
import { calculateCommuneTNBQ } from "../utils/calculations";

interface ExportDataModalProps {
  commune: CommuneProfile;
  isOpen: boolean;
  onClose: () => void;
  defaultFormat?: "xlsx" | "csv";
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  commune,
  isOpen,
  onClose,
  defaultFormat = "xlsx",
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const year = commune.reportingYear || 2026;
  const tnbqCalc = calculateCommuneTNBQ(commune);
  const surveyCount = commune.surveys?.length || 0;
  const sectorCount = commune.tgtspRows?.length || 0;
  const historyCount = commune.tnbqHistory?.length || 0;

  const handleExportExcel = () => {
    exportCommuneToExcel(commune);
    setDownloadSuccess("Đã xuất thành công file Excel (.xlsx) đa Sheet!");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportTGTSPCSV = () => {
    exportTGTSPToCSV(commune);
    setDownloadSuccess("Đã tải file CSV Phụ lục I - TGTSP!");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportTNBQCSV = () => {
    exportTNBQSurveysToCSV(commune);
    setDownloadSuccess("Đã tải file CSV Phụ lục II - Danh sách hộ mẫu TNBQ!");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportHistoryCSV = () => {
    exportTNBQHistoryToCSV(commune);
    setDownloadSuccess("Đã tải file CSV Chuỗi dữ liệu lịch sử TNBQ!");
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 backdrop-blur-xs border border-white/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Xuất dữ liệu chỉ tiêu thống kê cấp xã
              </h3>
              <p className="text-xs text-emerald-200">
                Đơn vị: {commune.communeName} ({commune.districtName}, {commune.provinceName}) • Kỳ báo cáo {year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {downloadSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{downloadSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Summary of Data */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center">
            <div>
              <span className="text-slate-500 block text-[11px]">Chỉ tiêu 1 (TGTSP)</span>
              <span className="font-bold text-slate-800">{sectorCount} ngành kinh tế</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Chỉ tiêu 2 (TNBQ)</span>
              <span className="font-bold text-emerald-700">{surveyCount} phiếu mẫu hộ</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Lịch sử TNBQ</span>
              <span className="font-bold text-amber-700">{historyCount} mốc năm</span>
            </div>
          </div>

          {/* Option 1: Full Workbook Excel (Recommended) */}
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3 relative">
            <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              Khuyên dùng cho công vụ
            </span>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  Sổ bảng tính Excel toàn diện (.xlsx) đa Sheet
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tích hợp đồng bộ cả 4 Sheet theo mẫu quy định tại Quyết định số 2545/QĐ-BTC:
                </p>
                <ul className="text-xs text-slate-600 list-disc list-inside mt-1.5 space-y-0.5">
                  <li><strong>Sheet 1 (TongHop_BaoCao):</strong> Tổng quan hành chính, dân số, kết luận tiêu chí NTM số 10.</li>
                  <li><strong>Sheet 2 (1.TGTSP_PhuLuc_I):</strong> Toàn bộ bảng tính GO, IC, VA (hiện hành, so sánh) và tăng trưởng.</li>
                  <li><strong>Sheet 3 (2.TNBQ_PhuLuc_II):</strong> Chi tiết từng phiếu điều tra 7 nguồn thu nhập của các hộ dân.</li>
                  <li><strong>Sheet 4 (3.LichSu_TNBQ):</strong> Chuỗi số liệu thời gian, tốc độ tăng trưởng và so sánh chuẩn NTM.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200/70">
              <span className="text-[11px] text-emerald-800 font-medium">
                Định dạng: Microsoft Excel (.xlsx) • Tương thích Excel 2010-2024, Google Sheets
              </span>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition"
              >
                <Download className="w-4 h-4" />
                <span>Tải sổ Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Option 2: CSV Files Separated */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-slate-500" />
              <span>Hoặc xuất từng bảng dữ liệu dạng CSV (UTF-8)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* CSV TGTSP */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>CSV Phụ lục I (TGTSP)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bao gồm {sectorCount} ngành kinh tế, doanh thu GO, chi phí IC, VA hiện hành & so sánh.
                  </p>
                </div>
                <button
                  onClick={handleExportTGTSPCSV}
                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải CSV TGTSP</span>
                </button>
              </div>

              {/* CSV TNBQ */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 transition space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>CSV Phụ lục II (TNBQ)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bao gồm {surveyCount} hộ điều tra mẫu, chi tiết 7 nguồn thu nhập và quy đổi bình quân.
                  </p>
                </div>
                <button
                  onClick={handleExportTNBQCSV}
                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải CSV Mẫu hộ</span>
                </button>
              </div>

              {/* CSV History */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>CSV Lịch sử TNBQ</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Chuỗi số liệu {historyCount} năm, tốc độ tăng trưởng liên năm và đối chiếu chuẩn NTM.
                  </p>
                </div>
                <button
                  onClick={handleExportHistoryCSV}
                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải CSV Lịch sử</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Lưu ý hiển thị tiếng Việt:</strong> Các file CSV đã được mã hóa UTF-8 với ký tự nhận dạng BOM (Byte Order Mark) để Microsoft Excel tự động hiển thị đúng dấu tiếng Việt không bị lỗi font khi mở trực tiếp.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
