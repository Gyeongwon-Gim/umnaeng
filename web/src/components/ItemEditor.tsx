// 항목 필드 공용 편집 폼 (PRD FR-1.4 확인·수정)
// 등록 확인 화면(Add)과 저장 항목 수정 화면(Edit)에서 공유한다.

import { diffDays, todayISO } from "../lib/freshness";
import { addDaysISO } from "../lib/rules";
import type { StorageLocation } from "../lib/types";
import { Icon } from "./Icon";
import {
  Chip,
  NameInput,
  NameRow,
  RemoveButton,
  Row,
  StepBtn,
  Stepper,
  StepValue,
} from "./ItemEditor.styles";

/** ItemProposal과 FridgeItem이 공유하는 편집 가능 필드 */
export interface EditableFields {
  name: string;
  location: StorageLocation;
  quantity: number;
  storedAt: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  shelfLifeDays: number;
}

interface Props<T extends EditableFields> {
  value: T;
  onChange: (next: T) => void;
  /** 지정 시 품목명 옆에 삭제(✕) 버튼 표시 (등록 확인 화면용) */
  onRemove?: () => void;
}

const LOCATION_LABEL: Record<StorageLocation, string> = {
  fridge: "냉장",
  freezer: "냉동",
  kimchi: "김치냉장고",
};
const LOCATION_ORDER: StorageLocation[] = ["fridge", "freezer", "kimchi"];

export function ItemEditor<T extends EditableFields>({ value, onChange, onRemove }: Props<T>) {
  const cycleLocation = () => {
    const next = LOCATION_ORDER[(LOCATION_ORDER.indexOf(value.location) + 1) % LOCATION_ORDER.length];
    onChange({ ...value, location: next });
  };

  const setQuantity = (delta: number) =>
    onChange({ ...value, quantity: Math.max(1, value.quantity + delta) });

  // 기한 ±1일. 색상 비율 계산용 shelfLifeDays도 함께 재계산 (FR-4)
  const shiftExpiry = (delta: number) => {
    const expiresAt = addDaysISO(value.expiresAt, delta);
    if (diffDays(value.storedAt, expiresAt) < 0) return; // 보관 시작일 이전으로는 불가
    onChange({ ...value, expiresAt, shelfLifeDays: diffDays(value.storedAt, expiresAt) });
  };

  const remaining = diffDays(todayISO(), value.expiresAt);
  const remainLabel = remaining < 0 ? `D+${Math.abs(remaining)}` : remaining === 0 ? "D-DAY" : `D-${remaining}`;

  return (
    <div>
      <NameRow>
        <NameInput
          value={value.name}
          placeholder="품목명"
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        {onRemove && (
          <RemoveButton onClick={onRemove}>
            <Icon $size={18}>close</Icon>
          </RemoveButton>
        )}
      </NameRow>

      <Row>
        <Chip onClick={cycleLocation}>{LOCATION_LABEL[value.location]}</Chip>

        <Stepper>
          <StepBtn onClick={() => setQuantity(-1)}>
            <Icon $size={18}>remove</Icon>
          </StepBtn>
          <StepValue>{value.quantity}개</StepValue>
          <StepBtn onClick={() => setQuantity(1)}>
            <Icon $size={18}>add</Icon>
          </StepBtn>
        </Stepper>
      </Row>

      <Row>
        <Stepper>
          <StepBtn onClick={() => shiftExpiry(-1)}>
            <Icon $size={18}>remove</Icon>
          </StepBtn>
          <StepValue>
            ~{value.expiresAt} ({remainLabel})
          </StepValue>
          <StepBtn onClick={() => shiftExpiry(1)}>
            <Icon $size={18}>add</Icon>
          </StepBtn>
        </Stepper>
      </Row>
    </div>
  );
}
