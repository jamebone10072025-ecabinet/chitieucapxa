import React, { useState, useRef } from "react";
import {
  Sparkles,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { CommuneProfile, HouseholdSurveyRecord } from "../types";

interface AISurveyScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  commune: CommuneProfile;
  onApplySurvey: (survey: HouseholdSurveyRecord) => void;
}

export const AISurveyScannerModal: React.FC<AISurveyScannerModalProps> = ({
  isOpen,
  onClose,
  commune,
  onApplySurvey,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"image" | "text">("image");
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const [notesText, setNotesText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedSurvey, setExtractedSurvey] =
    useState<HouseholdSurveyRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Clean = result.split(",")[1];
      setSelectedImage({
        base64: base64Clean,
        mimeType: file.type || "image/jpeg",
        previewUrl: result,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSampleText = () => {
    setNotesText(
      `Biên bản ghi chép phỏng vấn hộ điều tra:
- Chủ hộ: Nguyễn Văn Ba, sinh năm 1978, Tổ dân phố 2, Phường Quy Nhơn, SĐT: 0988776655.
- Nhân khẩu: 4 người. Vợ Trần Thị Lan (1982, làm giáo viên mầm non lương 9.5 triệu/tháng). Con đầu Nguyễn Văn Hải (2004, sinh viên đại học Tây Nguyên xa nhà được gia đình chu cấp hoàn toàn). Con thứ Nguyễn Thị Mai (2010, học sinh THCS).
- Hoạt động sản xuất:
  + Trồng 1.5 ha cà phê vối, sản lượng thu hoạch bán được 180 triệu đồng, giữ lại tiêu dùng 5 triệu. Chi phí phân bón và thuốc BVTV: 45 triệu, chi thuê công thu hoạch và tưới nước xăng dầu: 18 triệu, chi mua giống dặm: 4 triệu.
  + Chăn nuôi: Bán lứa heo thịt được 40 triệu đồng, chi tiền cám công nghiệp và phòng dịch 25 triệu đồng.
  + Người ngoài hộ: Bà con kiều hối dịp tết gửi tặng 15 triệu đồng.
- Lưu ý cán bộ: Hộ có rút 50 triệu tiền tiết kiệm để sửa sân phơi cà phê nhưng đã loại bỏ hoàn toàn khỏi mục thu nhập theo đúng hướng dẫn QĐ 2545.`
    );
  };

  const handleProcessAI = async () => {
    if (mode === "image" && !selectedImage) {
      setError("Vui lòng tải lên hoặc chọn ảnh chụp phiếu điều tra giấy.");
      return;
    }
    if (mode === "text" && !notesText.trim()) {
      setError("Vui lòng nhập nội dung phỏng vấn hoặc bấm 'Dùng mẫu ghi chép thực địa'.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        communeContext: {
          communeName: commune.communeName,
          provinceName: commune.provinceName,
        },
      };

      if (mode === "image" && selectedImage) {
        payload.imageBase64 = selectedImage.base64;
        payload.mimeType = selectedImage.mimeType;
      }
      if (notesText.trim()) {
        payload.notesText = notesText;
      }

      const res = await fetch("/api/ai-ocr-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.survey) {
        setExtractedSurvey(data.survey);
      } else {
        setError("Không nhận được dữ liệu cấu trúc từ AI.");
      }
    } catch (err: any) {
      setError("Lỗi kết nối máy chủ AI: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!extractedSurvey) return;
    onApplySurvey(extractedSurvey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>AI Smart Scanner - Số hóa Phiếu Hộ CAPI</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Gemini 3.8 Multimodal
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Tự động nhận diện ảnh chụp phiếu giấy hoặc ghi chú phỏng vấn và phân loại 7 mục thu nhập QĐ 2545
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setMode("image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                mode === "image"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quét ảnh phiếu điều tra</span>
            </button>
            <button
              onClick={() => setMode("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                mode === "text"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nhập nhanh văn bản / Ghi chép</span>
            </button>
          </div>

          {mode === "text" && (
            <button
              onClick={handleSampleText}
              className="text-emerald-700 hover:text-emerald-800 text-xs font-medium underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Dùng mẫu ghi chép thực địa</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!extractedSurvey ? (
            <div>
              {mode === "image" ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Chọn hoặc kéo thả ảnh chụp phiếu điều tra CAPI
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Hỗ trợ PNG, JPG, JPEG (chụp từ điện thoại hoặc bản scan giấy)
                      </span>
                    </div>
                  </div>

                  {selectedImage && (
                    <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedImage.previewUrl}
                          alt="Preview"
                          className="w-14 h-14 object-cover rounded-md border border-slate-300"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {selectedImage.fileName}
                          </div>
                          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã tải ảnh sẵn sàng nhận diện</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80">
                    💡 <strong>Gợi ý:</strong> Có thể nhập thêm ghi chú bổ sung (nếu có) dưới đây để AI đối soát chính xác hơn.
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Ghi chú thêm về hoàn cảnh hộ, các trường hợp nhân khẩu đặc biệt nếu ảnh chụp bị mờ..."
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Nhập ghi chép phỏng vấn nhanh từ thực địa:
                  </label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Nhập thông tin chủ hộ, các thành viên, thu nhập lương, cây trồng, vật nuôi, buôn bán..."
                    rows={8}
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed font-mono"
                  />
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                    💡 Trợ lý AI sẽ tự động tách số liệu thành: 7 mục thu nhập, trừ tiền chi phí (giống, phân bón, thức ăn gia súc), kiểm tra 5 ngoại lệ nhân khẩu và loại bỏ các giao dịch vốn luân chuyển.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Extracted Result View */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      AI đã trích xuất & cấu trúc thành công phiếu điều tra!
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Chủ hộ: <strong>{extractedSurvey.headName}</strong> ({extractedSurvey.code}) - {extractedSurvey.villageName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExtractedSurvey(null)}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 bg-white px-2.5 py-1 rounded cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Quét lại</span>
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Số nhân khẩu hợp lệ:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {extractedSurvey.members?.filter((m) => m.isCountedAsMember).length || 0} người
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Lương & Phụ cấp:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {extractedSurvey.salaryItems?.length || 0} khoản
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Cây trồng & Vật nuôi:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {(extractedSurvey.cropItems?.length || 0) + (extractedSurvey.livestockItems?.length || 0)} mục
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Loại trừ giao dịch vốn:</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {extractedSurvey.hasExcludedCapitalTransaction ? "Đã loại trừ" : "Chưa kiểm tra"}
                  </span>
                </div>
              </div>

              {/* Members preview */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                <h5 className="font-bold text-xs text-slate-800 mb-2">
                  Danh sách nhân khẩu đã nhận diện:
                </h5>
                <div className="space-y-1.5 text-xs">
                  {extractedSurvey.members?.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-white border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {m.fullName}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          ({m.relationship}, sinh {m.birthYear})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          m.isCountedAsMember
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {m.isCountedAsMember ? "Hợp lệ" : "Loại trừ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Verification Note */}
              {extractedSurvey.verificationNotes && (
                <div className="text-xs p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                  <span className="font-bold block mb-1">Ghi chú đối soát AI:</span>
                  <p className="text-[11px] leading-relaxed">
                    {extractedSurvey.verificationNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>

          {!extractedSurvey ? (
            <button
              onClick={handleProcessAI}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini đang đọc và bóc tách dữ liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu phân tích & bóc tách</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Xem và lưu vào danh sách hộ CAPI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
