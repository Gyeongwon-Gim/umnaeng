// BFF /recognize 클라이언트. 업로드 전 클라이언트 리사이즈로 비용·지연 절감 (NFR-2).

import { prepareForRecognition } from "./image";
import type { ItemProposal } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

export interface RecognizeResult {
  items: ItemProposal[];
  lowConfidence: boolean;
}

/** 사진 파일 → 인식 결과 */
export async function recognizeImage(file: Blob): Promise<RecognizeResult> {
  const { base64, mediaType } = await prepareForRecognition(file);
  const res = await fetch(`${API_BASE}/recognize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mediaType }),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error ?? `인식 실패 (${res.status})`);
  }
  return res.json();
}
