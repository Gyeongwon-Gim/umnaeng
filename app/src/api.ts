// BFF /recognize 클라이언트. 업로드 전 클라이언트 리사이즈로 비용·지연 절감 (NFR-2).

import * as ImageManipulator from "expo-image-manipulator";
import type { ItemProposal } from "./types";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8787";

export interface RecognizeResult {
  items: ItemProposal[];
  lowConfidence: boolean;
}

/** 장변 1280px로 리사이즈 + JPEG base64 인코딩 */
export async function prepareImage(uri: string): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }], // 비율 유지, 장변 기준 축소
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  if (!result.base64) throw new Error("이미지 인코딩 실패");
  return { base64: result.base64, mediaType: "image/jpeg" };
}

/** 사진 URI → 인식 결과 */
export async function recognizeImage(uri: string): Promise<RecognizeResult> {
  const { base64, mediaType } = await prepareImage(uri);
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
