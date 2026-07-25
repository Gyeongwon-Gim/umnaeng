// 보관기한 기준표 + 클램핑 (PRD FR-2, §64 기한 산정 정책)
//
// 식품안전 가이드라인(식약처 등)을 참고한 카테고리별 보관 일수 범위를 내장한다.
// AI가 산정한 일수는 이 범위로 클램핑하여 환각(예: 생선회 냉장 14일)을 방지한다.
//
// ⚠️ 아래 수치는 제품 스캐폴드용 근사값이다. 출시 전 식약처 「식품별 보관기준」
//    최신판으로 검수·보정할 것.

import type { CookState, FoodKind, StorageLocation } from "./types.js";

interface Range {
  min: number; // 최소 권장 일수
  max: number; // 최대 권장 일수
}

interface KindRule {
  fridge: Range; // 냉장 기준
  freezer: Range; // 냉동 기준
  /** 근거 문구 템플릿 (FR-2.2) */
  note: string;
}

// kind별 냉장/냉동 권장 보관 일수 범위
const TABLE: Record<FoodKind, KindRule> = {
  sashimi: { fridge: { min: 1, max: 1 }, freezer: { min: 14, max: 30 }, note: "생선회는 당일 섭취 권장" },
  raw_fish: { fridge: { min: 1, max: 2 }, freezer: { min: 30, max: 90 }, note: "비가열 생선은 냉장 1~2일" },
  raw_meat: { fridge: { min: 2, max: 3 }, freezer: { min: 30, max: 90 }, note: "생고기는 냉장 2~3일 권장" },
  cooked_namul: { fridge: { min: 3, max: 4 }, freezer: { min: 14, max: 30 }, note: "조리된 나물류는 냉장 3~4일 권장" },
  cooked_sidedish: { fridge: { min: 3, max: 5 }, freezer: { min: 14, max: 30 }, note: "조리 반찬은 냉장 3~5일 권장" },
  kimchi: { fridge: { min: 14, max: 60 }, freezer: { min: 60, max: 180 }, note: "김치는 냉장 보관, 익을수록 신맛 증가" },
  tofu: { fridge: { min: 3, max: 5 }, freezer: { min: 30, max: 60 }, note: "개봉 두부는 물 갈아 냉장 3~5일" },
  leafy: { fridge: { min: 3, max: 5 }, freezer: { min: 30, max: 60 }, note: "잎채소는 냉장 3~5일" },
  root_veg: { fridge: { min: 14, max: 30 }, freezer: { min: 90, max: 180 }, note: "뿌리채소는 냉장 2~4주" },
  fruit: { fridge: { min: 5, max: 10 }, freezer: { min: 90, max: 180 }, note: "과일은 종류별 편차, 냉장 5~10일" },
  dairy: { fridge: { min: 5, max: 10 }, freezer: { min: 30, max: 60 }, note: "유제품은 표기 유통기한 우선" },
  egg: { fridge: { min: 21, max: 35 }, freezer: { min: 0, max: 0 }, note: "계란은 냉장 3~5주, 냉동 비권장" },
  cooked_rice: { fridge: { min: 1, max: 2 }, freezer: { min: 30, max: 30 }, note: "밥/떡은 냉장 1~2일, 냉동 권장" },
  sauce: { fridge: { min: 30, max: 90 }, freezer: { min: 180, max: 365 }, note: "개봉 소스/장류는 냉장 1~3개월" },
  bread: { fridge: { min: 3, max: 5 }, freezer: { min: 30, max: 60 }, note: "빵은 냉동 보관이 품질 유지에 유리" },
  processed: { fridge: { min: 5, max: 10 }, freezer: { min: 60, max: 120 }, note: "개봉 가공식품은 냉장 5~10일" },
  generic: { fridge: { min: 3, max: 5 }, freezer: { min: 30, max: 30 }, note: "보수적 기본값 적용" },
};

/** 조리 상태에 따른 보정: 생물을 조리하면 약간 늘고, 조리물을 오래 두면 위험 */
function applyCookState(range: Range, cook: CookState): Range {
  // 현재 기준표는 kind에 조리상태가 이미 반영되어 있어 미세 보정만 수행
  if (cook === "raw") return range;
  return range;
}

export interface ClampResult {
  days: number; // 최종 보관 일수
  clamped: boolean; // AI 값이 범위를 벗어나 조정되었는지
  rationale: string; // 근거 문구
}

/**
 * AI가 제안한 보관 일수를 기준표 범위로 클램핑한다.
 * @param kind 식품 종류
 * @param location 냉장/냉동
 * @param cook 조리 상태
 * @param aiDays AI가 제안한 일수 (없으면 범위 중앙값 사용)
 */
export function clampShelfLife(
  kind: FoodKind,
  location: StorageLocation,
  cook: CookState,
  aiDays?: number,
): ClampResult {
  const rule = TABLE[kind] ?? TABLE.generic;
  const range = applyCookState(location === "freezer" ? rule.freezer : rule.fridge, cook);

  // 냉동 0일(비권장) → 최소 냉장 기준으로 폴백
  const effective = range.max === 0 ? applyCookState(rule.fridge, cook) : range;

  const mid = Math.round((effective.min + effective.max) / 2);
  const proposed = aiDays == null ? mid : aiDays;
  const days = Math.min(Math.max(proposed, effective.min), effective.max);
  const clamped = aiDays != null && days !== aiDays;

  const locWord = location === "freezer" ? "냉동" : "냉장";
  const rationale = clamped
    ? `${rule.note} (AI 제안 ${aiDays}일 → 기준 범위 ${effective.min}~${effective.max}일로 조정)`
    : `${rule.note} · ${locWord} ${effective.min}~${effective.max}일 기준`;

  return { days, clamped, rationale };
}

/** YYYY-MM-DD 오늘 (로컬 기준) */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** storedAt(YYYY-MM-DD)에 days를 더한 만료일 */
export function addDaysISO(startISO: string, days: number): string {
  const [y, m, d] = startISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

/** 두 YYYY-MM-DD 사이 일수 차 (b - a) */
export function diffDaysISO(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split("-").map(Number);
  const [by, bm, bd] = bISO.split("-").map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86_400_000);
}
