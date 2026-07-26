// 엄냉관 BFF 엔트리포인트

import "dotenv/config";
import express from "express";
import cors from "cors";
import { recognize } from "./recognize.js";

const app = express();
// 리사이즈된 이미지 base64를 수용 (NFR-2로 장변 1280px 권장이나 여유 확보)
app.use(express.json({ limit: "12mb" }));
app.use(cors());

app.get("/health", (_req, res) => {
  res.json({ ok: true, model: process.env.VISION_MODEL || "claude-opus-4-8" });
});

/**
 * POST /recognize
 * body: { base64: string, mediaType: "image/jpeg"|"image/png"|"image/webp", storedAt?: "YYYY-MM-DD" }
 * res:  RecognizeResponse
 */
app.post("/recognize", async (req, res) => {
  try {
    const { base64, mediaType, storedAt } = req.body ?? {};
    if (!base64 || typeof base64 !== "string") {
      return res.status(400).json({ error: "base64 이미지가 필요합니다." });
    }
    const mt = mediaType ?? "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mt)) {
      return res.status(400).json({ error: "지원하지 않는 mediaType 입니다." });
    }

    const result = await recognize({ base64, mediaType: mt, storedAt });
    res.json(result);
  } catch (err: any) {
    console.error("[/recognize] 실패:", err?.message ?? err);
    // NFR-1: 인식 실패도 사용자에게 폴백을 열어주기 위해 명시적 에러 반환
    res.status(502).json({ error: "AI 인식에 실패했습니다. 직접 입력으로 등록해주세요." });
  }
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`🥬 엄냉관 서버 실행 중 → http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY 미설정 — /recognize 호출이 실패합니다. .env를 확인하세요.");
  }
});
