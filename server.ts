import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Q&A and Verification endpoint for QĐ 2545/QĐ-BTC
app.post("/api/ai-consult", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const client = getGeminiClient();
    if (!client) {
      // Fallback knowledge response if no API key is provided
      return res.json({
        response:
          "Hệ thống đang hoạt động ở chế độ Offline (chưa cấu hình GEMINI_API_KEY). Tuy nhiên, bạn có thể tra cứu toàn bộ quy tắc nghiệp vụ, công thức và bảng biểu của Quyết định 2545/QĐ-BTC được tích hợp sẵn trong ứng dụng.",
        isOffline: true,
      });
    }

    const systemInstruction = `Bạn là Trợ lý Chuyên gia Thống kê cao cấp của Cục Thống kê và Bộ Tài chính, chuyên sâu về Quyết định số 2545/QĐ-BTC ngày 14/09/2026 hướng dẫn biên soạn 02 chỉ tiêu tổng hợp cấp xã:
1. Tổng giá trị sản phẩm trên địa bàn cấp xã (TGTSP - Phụ lục I).
2. Thu nhập bình quân đầu người trên địa bàn cấp xã (TNBQ - Phụ lục II).

Nhiệm vụ của bạn:
- Hướng dẫn tính toán, giải thích chi tiết các bước tính trực tiếp, gián tiếp (phân bổ), điều chỉnh trần GTSX tỉnh.
- Hướng dẫn xác định đơn vị thường trú, cơ sở SXKD, nguyên tắc không tính trùng lặp (không phân bổ dầu thô, khí đốt, vận tải hàng không, đường sắt cho xã).
- Hướng dẫn 7 mục thu nhập của hộ, 5 trường hợp nhân khẩu được tính dù ở < 6 tháng, 2 trường hợp loại trừ, các khoản tuyệt đối không tính vào thu nhập (rút tiết kiệm, bán nhà đất...).
- Trả lời bằng tiếng Việt trang trọng, chính xác theo điều khoản của Quyết định 2545/QĐ-BTC.`;

    // Call Gemini API using GoogleGenAI standard client
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemInstruction}\n\nNgữ cảnh dữ liệu người dùng đang thao tác: ${JSON.stringify(
                context || {}
              )}\n\nCâu hỏi/Yêu cầu nghiệp vụ: ${prompt}`,
            },
          ],
        },
      ],
    });

    const responseText = result.text || "Không có phản hồi từ mô hình.";
    return res.json({ response: responseText });
  } catch (error: any) {
    console.error("AI Consult error:", error);
    return res.status(500).json({
      error: "Lỗi xử lý tư vấn AI: " + (error.message || "Unknown error"),
    });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
