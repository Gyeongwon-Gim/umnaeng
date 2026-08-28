// 브라우저 canvas 기반 이미지 리사이즈/인코딩 (NFR-2 비용·지연 절감, NFR-4 원본 미보관)

async function loadBitmap(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/** 장변 기준으로 비율 유지 축소한 JPEG data URL 생성 */
async function resizeToDataURL(file: Blob, maxEdge: number, quality: number): Promise<string> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스를 생성할 수 없습니다.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}

function stripDataUrlPrefix(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

/** /recognize 전송용 — 장변 1280px, 저장하지 않고 즉시 폐기 */
export async function prepareForRecognition(
  file: Blob,
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const dataUrl = await resizeToDataURL(file, 1280, 0.7);
  return { base64: stripDataUrlPrefix(dataUrl), mediaType: "image/jpeg" };
}

/** 항목 썸네일 저장용 — 장변 320px, localStorage 용량을 고려한 작은 data URL */
export async function prepareThumbnail(file: Blob): Promise<string> {
  return resizeToDataURL(file, 320, 0.6);
}
