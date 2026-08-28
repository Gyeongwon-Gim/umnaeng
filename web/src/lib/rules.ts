// 클라이언트 보관기한 룰 (냉동 이동 재계산용, PRD FR-7.2)
// 서버 rules.ts의 냉동 기준과 일치시킨다.

import type { FoodKind } from "./types";

// kind별 냉동 권장 보관 일수(중앙값). 서버 TABLE.freezer의 대표값.
const FREEZER_DAYS: Record<FoodKind, number> = {
  sashimi: 21,
  raw_fish: 60,
  raw_meat: 60,
  cooked_namul: 21,
  cooked_sidedish: 21,
  kimchi: 120,
  tofu: 45,
  leafy: 45,
  root_veg: 135,
  fruit: 135,
  dairy: 45,
  egg: 30, // 냉동 비권장이나 이동은 허용
  cooked_rice: 30,
  sauce: 270,
  bread: 45,
  processed: 90,
  generic: 30,
};

export function freezerShelfLifeDays(kind: FoodKind): number {
  return FREEZER_DAYS[kind] ?? FREEZER_DAYS.generic;
}

export function addDaysISO(startISO: string, days: number): string {
  const [y, m, d] = startISO.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
