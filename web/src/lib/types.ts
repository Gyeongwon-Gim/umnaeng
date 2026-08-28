// 앱 공용 타입 (서버 types.ts와 개념 일치)

export type FoodCategory = "ingredient" | "sidedish" | "product";
export type StorageLocation = "fridge" | "freezer" | "kimchi";
export type CookState = "raw" | "cooked";

export type FoodKind =
  | "sashimi" | "raw_fish" | "raw_meat" | "cooked_namul" | "cooked_sidedish"
  | "kimchi" | "tofu" | "leafy" | "root_veg" | "fruit" | "dairy" | "egg"
  | "cooked_rice" | "sauce" | "bread" | "processed" | "generic";

/** 서버 /recognize 가 돌려주는 제안 항목 */
export interface ItemProposal {
  name: string;
  category: FoodCategory;
  kind: FoodKind;
  cookState: CookState;
  location: StorageLocation;
  quantity: number;
  confidence: number;
  printedExpiry?: string;
  storedAt: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  shelfLifeDays: number;
  rationale: string;
}

/** 냉장고에 저장된 재고 항목 */
export interface FridgeItem {
  id: string;
  name: string;
  category: FoodCategory;
  kind: FoodKind;
  location: StorageLocation;
  quantity: number;
  storedAt: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  shelfLifeDays: number; // 색상 비율 계산용 총 보관 일수
  rationale: string;
  thumbnailUri?: string; // 원본 미보관, 썸네일만 (NFR-4)
}

/** 소진 이력 (통계, FR-6.3) */
export interface ConsumedRecord {
  id: string;
  name: string;
  consumedAt: string; // YYYY-MM-DD
  expiresAt: string; // 만료 전/후 소진 판별용
}
