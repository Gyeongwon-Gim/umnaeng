// 엄냉관 서버 공용 타입

/** 음식 분류 (PRD FR-1.2) */
export type FoodCategory = "ingredient" | "sidedish" | "product";
// ingredient=식재료, sidedish=반찬, product=완제품

/** 보관 위치 */
export type StorageLocation = "fridge" | "freezer"; // 냉장 / 냉동

/** 조리 상태 (기한 산정 입력, PRD FR-2.1) */
export type CookState = "raw" | "cooked"; // 생물 / 조리됨

/** 기한 산정에 쓰이는 식품 종류 키 (rules.ts의 기준표 키) */
export type FoodKind =
  | "sashimi" // 회/생선회
  | "raw_fish" // 생선(비가열)
  | "raw_meat" // 정육/생고기
  | "cooked_namul" // 조리된 나물류
  | "cooked_sidedish" // 조리 반찬 일반
  | "kimchi" // 김치류
  | "tofu" // 두부
  | "leafy" // 잎채소
  | "root_veg" // 뿌리채소
  | "fruit" // 과일
  | "dairy" // 유제품
  | "egg" // 계란
  | "cooked_rice" // 밥/떡
  | "sauce" // 소스/장류
  | "bread" // 빵류
  | "processed" // 가공식품(개봉)
  | "generic"; // 알 수 없음 → 보수적 기본값

/** AI가 사진에서 인식한 단일 품목 (저장 전 후보) */
export interface RecognizedItem {
  name: string; // 품목명
  category: FoodCategory; // 식재료/반찬/완제품
  kind: FoodKind; // 기한 산정 키
  cookState: CookState; // 생물/조리됨
  location: StorageLocation; // 권장 보관 위치
  quantity: number; // 추정 수량 (개수)
  confidence: number; // 0~1 신뢰도
  /** 사진에서 OCR로 읽은 유통기한(YYYY-MM-DD). 있으면 우선 적용 (FR-1.6) */
  printedExpiry?: string;
}

/** 서버가 후보에 기한을 붙여 돌려주는 최종 제안 */
export interface ItemProposal extends RecognizedItem {
  /** 등록일(오늘 기준) YYYY-MM-DD */
  storedAt: string;
  /** 산정된 보관기한 YYYY-MM-DD */
  expiresAt: string;
  /** 총 보관 일수 (색상 비율 계산용) */
  shelfLifeDays: number;
  /** 기한 산정 근거 문구 (FR-2.2) */
  rationale: string;
}

/** /recognize 응답 */
export interface RecognizeResponse {
  items: ItemProposal[];
  /** 전부 저신뢰/인식 실패 시 폴백 안내 (FR-1.5) */
  lowConfidence: boolean;
}
