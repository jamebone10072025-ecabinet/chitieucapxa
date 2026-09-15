import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  X,
  Loader2,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { CommuneProfile } from "../types";

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  commune: CommuneProfile;
}

const PRESET_QUESTIONS = [
  "Chủ hộ đi làm ăn xa trên 6 tháng nhưng gửi tiền về nuôi gia đình có được tính là nhân khẩu không?",
  "Hộ gia đình nhận 200 triệu tiền bồi thường đền bù giải tỏa đất đai có được tính vào thu nhập không?",
  "Chi phí đàn lợn thịt đang nuôi dở dang (chưa xuất chuồng) hạch toán thế nào theo QĐ 2545?",
  "Nếu tổng TGTSP các xã cộng lại lớn hơn GTSX toàn tỉnh thì nguyên tắc điều chỉnh ra sao?",
  "Thương nghiệp hộ cá thể: Tính theo tổng doanh thu bán hàng hay thặng dư thương mại?",
];

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({
  isOpen,
  onClose,
  commune,
}) => {
  if (!isOpen) return null;

  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content: `Xin chào đồng chí! Tôi là Trợ lý Nghiệp vụ Thống kê hỗ trợ triển khai **Quyết định số 2545/QĐ-BTC ngày 14/9/2026** của Bộ Tài chính.\n\nTôi có thể giải đáp ngay mọi vướng mắc về:\n- 02 Chỉ tiêu: **TGTSP** (Tổng giá trị sản phẩm) & **TNBQ** (Thu nhập bình quân đầu người).\n- Quy tắc xác định nhân khẩu (5 trường hợp được tính, 2 trường hợp loại trừ).\n- Quy tắc loại trừ giao dịch vốn và chi phí dở dang trong nông nghiệp.\n- 14 Bảng nguồn biểu mẫu khai thác quốc gia và thuật toán khống chế trần GTSX Tỉnh.\n\nĐồng chí cần giải đáp vấn đề gì về số liệu của **${commune.communeName}**?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputPrompt;
    if (!q.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: q }];
    setMessages(newMessages);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          context: {
            communeName: commune.communeName,
            districtName: commune.districtName,
            provinceName: commune.provinceName,
            reportingYear: commune.reportingYear,
            totalHouseholds: commune.totalHouseholds,
            totalPopulation: commune.totalPopulation,
            surveysCount: (commune.surveys || []).length,
            tgtspRowsCount: (commune.tgtspRows || []).length,
          },
        }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Không nhận được phản hồi từ hệ thống. Vui lòng kiểm tra lại kết nối.",
          },
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Hệ thống đang hoạt động ở chế độ Offline. Theo Quyết định 2545/QĐ-BTC: Mọi thắc mắc đã được quy định chi tiết trong Cẩm nang nghiệp vụ và các Biểu mẫu hướng dẫn tại menu 'Cẩm Nang QĐ 2545'.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Trợ lý nghiệp vụ QĐ 2545/QĐ-BTC</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  AI Thống kê
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Tư vấn chuẩn hóa phương pháp tính TGTSP, TNBQ & Biểu mẫu cấp xã
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

        {/* Quick Presets */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Gợi ý:
          </span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-white hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded border border-slate-300 shrink-0 cursor-pointer transition max-w-xs truncate"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white rounded-tr-xs"
                    : "bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Chuyên gia thống kê AI đang tra cứu QĐ 2545...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Hỏi về quy tắc nhân khẩu, chi phí dở dang, trần GTSX..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
