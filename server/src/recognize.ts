// Claude Vision 기반 음식 인식 (PRD FR-1). 저신뢰 폴백/OCR 유통기한 포함.

import Anthropic from "@anthropic-ai/sdk";
import {
  clampShelfLife,
  addDaysISO,
  diffDaysISO,
  todayISO,
} from "./rules.js";
import type {
  FoodKind,
  ItemProposal,
  RecognizeResponse,
} from "./types.js";

const MODEL = process.env.VISION_MODEL || "claude-opus-4-8";

const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수 사용

// 비용 추적용 대략적 단가 (USD / 1M 토큰). 실제 청구액과 다를 수 있음 — 참고용.
const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-opus-4-7": { input: 5, output: 25 },
  "claude-opus-4-6": { input: 5, output: 25 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

function logUsage(usage: Anthropic.Messages.Usage): void {
  const pricing = PRICING_PER_MTOK[MODEL];
  const cost = pricing
    ? `$${((usage.input_tokens * pricing.input + usage.output_tokens * pricing.output) / 1_000_000).toFixed(4)}`
    : "단가 미등록";
  console.log(
    `[/recognize] usage model=${MODEL} input=${usage.input_tokens} output=${usage.output_tokens} cost≈${cost}`,
  );
}

/** 신뢰도 임계값 미만이면 폴백 (FR-1.5) */
const CONFIDENCE_THRESHOLD = 0.5;

// 인식 결과를 강제할 JSON 스키마 (structured outputs)
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "한국어 품목명, 예: '시금치나물'" },
          category: { type: "string", enum: ["ingredient", "sidedish", "product"] },
          kind: {
            type: "string",
            enum: [
              "sashimi", "raw_fish", "raw_meat", "cooked_namul", "cooked_sidedish",
              "kimchi", "tofu", "leafy", "root_veg", "fruit", "dairy", "egg",
              "cooked_rice", "sauce", "bread", "processed", "generic",
            ],
          },
          cookState: { type: "string", enum: ["raw", "cooked"] },
          location: { type: "string", enum: ["fridge", "freezer"] },
          quantity: { type: "integer", description: "추정 수량(개수), 최소 1" },
          confidence: { type: "number", description: "0~1 인식 신뢰도" },
          aiShelfLifeDays: {
            type: "integer",
            description: "이 음식의 권장 보관 일수 추정치(서버가 기준표로 클램핑함)",
          },
          printedExpiry: {
            type: "string",
            description: "포장에 인쇄된 유통기한을 OCR로 읽었으면 YYYY-MM-DD, 없으면 빈 문자열",
          },
        },
        required: [
          "name", "category", "kind", "cookState", "location",
          "quantity", "confidence", "aiShelfLifeDays", "printedExpiry",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;

const SYSTEM = `너는 냉장고 관리 앱의 음식 인식 엔진이다.
사용자가 올린 냉장고/반찬통/식재료 사진을 보고, 보이는 음식 품목을 각각 식별한다.

규칙:
- 한 사진에 여러 품목이 있으면 모두 분리해서 반환한다 (반찬통 3개 → 3개 항목).
- name은 자연스러운 한국어로 (예: "고등어구이", "방울토마토").
- category: 손질 안 된 원재료=ingredient, 조리된 반찬=sidedish, 포장 완제품=product.
- kind: 보관기한 산정용 분류. 애매하면 generic.
- cookState: 가열/조리 흔적이 있으면 cooked, 생물이면 raw.
- location: 사진 맥락상 냉동실이면 freezer, 아니면 fridge.
- aiShelfLifeDays: 해당 음식·보관위치에서의 통상 권장 보관 일수 추정(정수).
- confidence: 흐리거나 가려져 확신이 낮으면 0.5 미만으로 정직하게.
- printedExpiry: 포장에 유통기한 표기가 보이면 OCR로 읽어 YYYY-MM-DD, 아니면 "".
- 음식이 아니면 반환하지 않는다.`;

export interface RecognizeInput {
  base64: string; // 클라이언트가 리사이즈(장변 1280px)한 이미지 (NFR-2)
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  storedAt?: string; // 등록일, 기본 오늘 (FR-2.4)
}

export async function recognize(input: RecognizeInput): Promise<RecognizeResponse> {
  const storedAt = input.storedAt || todayISO();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: input.mediaType, data: input.base64 },
          },
          { type: "text", text: "이 사진 속 음식을 모두 인식해줘." },
        ],
      },
    ],
  });

  logUsage(message.usage);

  // structured outputs → 첫 text 블록이 유효 JSON
  const text = message.content.find((b) => b.type === "text");
  const raw = text && "text" in text ? JSON.parse(text.text) : { items: [] };

  const items: ItemProposal[] = (raw.items ?? []).map((r: any): ItemProposal => {
    const kind: FoodKind = r.kind ?? "generic";
    const clamp = clampShelfLife(kind, r.location, r.cookState, r.aiShelfLifeDays);

    // OCR 유통기한이 있으면 우선 적용 (FR-1.6)
    let expiresAt: string;
    let shelfLifeDays: number;
    let rationale: string;
    if (r.printedExpiry && /^\d{4}-\d{2}-\d{2}$/.test(r.printedExpiry)) {
      expiresAt = r.printedExpiry;
      shelfLifeDays = Math.max(1, diffDaysISO(storedAt, expiresAt));
      rationale = "포장 표기 유통기한 적용";
    } else {
      expiresAt = addDaysISO(storedAt, clamp.days);
      shelfLifeDays = clamp.days;
      rationale = clamp.rationale;
    }

    return {
      name: r.name,
      category: r.category,
      kind,
      cookState: r.cookState,
      location: r.location,
      quantity: Math.max(1, r.quantity ?? 1),
      confidence: r.confidence ?? 0,
      printedExpiry: r.printedExpiry || undefined,
      storedAt,
      expiresAt,
      shelfLifeDays,
      rationale,
    };
  });

  const lowConfidence =
    items.length === 0 || items.every((i) => i.confidence < CONFIDENCE_THRESHOLD);

  return { items, lowConfidence };
}
