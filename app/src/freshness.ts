// 임박도 계산 + 색상 정책 (PRD FR-4)
//
// 색상 정책 (기본값, 추후 A/B):
//  🟢 여유(green)  : 남은 기한이 총 보관기간의 50% 초과
//  🟡 주의(yellow) : 남은 기한 50% 이하 또는 D-3 이내
//  🔴 임박(red)    : D-1 이하
//  ⚫ 만료(expired): D+0 경과
//
// 절대 일수(D-3)와 비율(50%) 중 "더 임박한" 기준을 적용한다.

import type { FridgeItem } from "./types";

export type Freshness = "green" | "yellow" | "red" | "expired";

/** 두 YYYY-MM-DD 사이 일수 차 (b - a). UTC 기준으로 DST 영향 제거 */
export function diffDays(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split("-").map(Number);
  const [by, bm, bd] = bISO.split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000,
  );
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 남은 일수 (음수면 만료 경과). D-n의 n */
export function remainingDays(item: FridgeItem, today = todayISO()): number {
  return diffDays(today, item.expiresAt);
}

/** 임박도 상태 결정 */
export function freshnessOf(item: FridgeItem, today = todayISO()): Freshness {
  const remaining = remainingDays(item, today);
  if (remaining < 0) return "expired"; // D+0 경과
  if (remaining <= 1) return "red"; // D-1 이하

  // 절대(D-3)와 비율(50%) 중 더 임박한 기준
  const ratio = item.shelfLifeDays > 0 ? remaining / item.shelfLifeDays : 1;
  if (remaining <= 3 || ratio <= 0.5) return "yellow";
  return "green";
}

/** D-표기 텍스트 (색각 이상 접근성 — 색상과 병기, FR-4.2) */
export function dLabel(item: FridgeItem, today = todayISO()): string {
  const r = remainingDays(item, today);
  if (r < 0) return `D+${Math.abs(r)}`;
  if (r === 0) return "D-DAY";
  return `D-${r}`;
}

export const FRESHNESS_COLOR: Record<Freshness, string> = {
  green: "#43A047",
  yellow: "#F9A825",
  red: "#E53935",
  expired: "#616161",
};

/** 행 배경용 연한 톤 (FRESHNESS_COLOR와 짝을 이루는 MD 50번대 색) */
export const FRESHNESS_BG: Record<Freshness, string> = {
  green: "#E8F5E9",
  yellow: "#FFF8E1",
  red: "#FFEBEE",
  expired: "#EEEEEE",
};

export const FRESHNESS_LABEL: Record<Freshness, string> = {
  green: "여유",
  yellow: "주의",
  red: "임박",
  expired: "만료",
};
