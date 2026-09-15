import React, { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Loader2,
  X,
  Tag,
  CheckCircle2,
  Globe,
  DollarSign,
  Info,
} from "lucide-react";
import { CommuneProfile } from "../types";

interface AIMarketPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  commune: CommuneProfile;
  initialCommodity?: string;
  onSelectPrice?: (priceInThousandVND: number, commodityName: string) => void;
}

const COMMON_COMMODITIES = [
  "Cà phê vối (nhân xô)",
  "Hồ tiêu đen khô",
  "Sầu riêng Ri6 / Dona",
  "Cao su mủ đông",
  "Thịt heo hơi xuất chuồng",
  "Bò thịt lai Sind",
  "Lúa tươi vụ hè thu",
  "Phân bón NPK 16-16-8",
  "Thuốc BVTV sinh học",
  "Củi gỗ keo tràm",
];

export const AIMarketPriceModal: React.FC<AIMarketPriceModalProps> = ({
  isOpen,
  onClose,
  commune,
  initialCommodity = "",
  onSelectPrice,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState(initialCommodity || "Cà phê vối (nhân xô)");
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; uri?: string }>>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm?: string) => {
    const term = (searchTerm || query).trim();
    if (!term) return;

    setIsLoading(true);
    setError(null);
    setResultText(null);
    setSources([]);

    try {
      const res = await fetch("/api/ai-market-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: term,
          province: commune.provinceName || "tỉnh Gia Lai",
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResultText(data.text);
        setSources(data.sources || []);
        setIsOffline(!!data.isOffline);
      }
    } catch (e: any) {
      setError("Lỗi kết nối máy chủ tra cứu: " + (e.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold">
                  Tra Cứu Giá Thị Trường Thời Gian Thực
                </h2>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Google Search
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Đối chiếu đơn giá nông sản, vật tư & dịch vụ phục vụ biên soạn chỉ tiêu cấp xã ({commune.communeName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Search Box */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nhập tên nông sản, cây trồng, vật nuôi (ví dụ: Giá cà phê hôm nay, Tiêu Chư Sê...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition cursor-pointer shrink-0 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Tra cứu</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Mặt hàng phổ biến tại địa phương:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COMMODITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    query === item
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                AI đang tìm kiếm & tổng hợp thông tin thị trường qua Google Search...
              </p>
              <p className="text-xs text-slate-500">
                Đang đối soát đơn giá hiện hành theo niên vụ và địa bàn {commune.provinceName || "Tây Nguyên"}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Không thể tra cứu giá thị trường:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Offline Notice */}
          {isOffline && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Đang sử dụng dữ liệu tham chiếu cơ sở hoặc mẫu QĐ 2545 (chế độ dự phòng).
              </span>
            </div>
          )}

          {/* Results Box */}
          {resultText && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Báo cáo khảo sát giá thị trường AI</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 text-xs md:text-sm whitespace-pre-wrap font-sans">
                  {resultText}
                </div>
              </div>

              {/* Citations / Web Sources */}
              {sources.length > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nguồn dữ liệu trích xuất từ Google Search:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-2xs text-xs text-emerald-800 transition group"
                      >
                        <span className="truncate font-medium">{s.title}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-500 group-hover:text-emerald-700 shrink-0 ml-1.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đơn giá tham khảo hỗ trợ cán bộ thống kê cấp xã theo QĐ 2545/QĐ-BTC</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
