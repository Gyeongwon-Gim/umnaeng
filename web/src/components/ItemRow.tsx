// 리스트 항목 행 + 드래그(포인터 이벤트) 스와이프 (PRD FR-6 소진 / FR-7 냉동)
// 접근성: 스와이프 대체로 "⋮" 메뉴 버튼 제공 (NFR-6).

import { useRef, useState } from "react";
import type { FridgeItem } from "../lib/types";
import {
  dLabel,
  freshnessOf,
  FRESHNESS_BG,
  FRESHNESS_COLOR,
  FRESHNESS_LABEL,
} from "../lib/freshness";
import { ActionSheet, type ActionSheetOption } from "./ActionSheet";
import { Icon } from "./Icon";
import {
  ActionsLeft,
  ActionsRight,
  Badge,
  Body,
  Card,
  Dday,
  Meta,
  MoreBtn,
  Name,
  Right,
  Thumb,
  ThumbPlaceholder,
  Wrap,
} from "./ItemRow.styles";

interface Props {
  item: FridgeItem;
  onConsume: (id: string) => void; // 우측 드래그(consume 패널 노출)
  onFreeze: (id: string) => void; // 좌측 드래그(freeze 패널 노출), 냉장→냉동
  onPress?: (id: string) => void; // 탭 → 수정 화면
}

const LOCATION_LABEL = { fridge: "냉장", freezer: "냉동", kimchi: "김치냉장고" } as const;
const CATEGORY_LABEL = {
  ingredient: "식재료",
  sidedish: "반찬",
  product: "완제품",
} as const;

const THRESHOLD_RATIO = 0.35; // 이 비율 이상 끌어야 액션 확정 ("주욱" 미는 느낌)
const DRAG_CLAMP_RATIO = 0.6; // 드래그 중 손가락을 따라가는 최대 비율
const EXIT_RATIO = 1.15; // 확정 시 화면 밖으로 완전히 사라지는 지점
const EXIT_DURATION_MS = 220;

type Sheet = {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel: string;
} | null;

export function ItemRow({ item, onConsume, onFreeze, onPress }: Props) {
  const fresh = freshnessOf(item);
  const color = FRESHNESS_COLOR[fresh];
  const isFreezer = item.location === "freezer";

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const moved = useRef(false);
  // 포인터 시퀀스 도중 React 상태 배칭 타이밍에 의존하지 않도록 ref로 실시간 값을 별도 추적
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);

  const getWidth = () => cardRef.current?.getBoundingClientRect().width || 320;

  /** 액션을 확정하고, 카드가 화면 밖으로 완전히 사라진 뒤 실제 상태 변경을 반영한다 */
  const runExit = (direction: "consume" | "freeze") => {
    const width = getWidth();
    setDragging(false);
    setDragX(direction === "consume" ? width * EXIT_RATIO : -width * EXIT_RATIO);
    window.setTimeout(() => {
      if (direction === "consume") onConsume(item.id);
      else onFreeze(item.id);
    }, EXIT_DURATION_MS);
  };

  const askFreeze = () => {
    if (isFreezer) {
      setSheet({
        title: "이미 냉동 보관 중",
        message: "냉장 해동 이동은 다음 버전에서 지원됩니다.",
        options: [],
        cancelLabel: "확인",
      });
      return;
    }
    setSheet({
      title: "냉동실로 이동",
      message: "냉동해도 품질은 계속 떨어져요. 늦어도 권장 기한 안에 드시는 걸 권장해요.",
      options: [{ key: "freeze", label: "냉동 이동", onSelect: () => runExit("freeze") }],
      cancelLabel: "취소",
    });
  };

  const openMenu = () => {
    setSheet({
      title: item.name,
      options: [
        { key: "consume", label: "소진 처리", onSelect: () => runExit("consume") },
        ...(isFreezer
          ? []
          : [{ key: "freeze", label: "냉동실로 이동", onSelect: () => setTimeout(askFreeze, 0) }]),
      ],
      cancelLabel: "닫기",
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    moved.current = false;
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const raw = e.clientX - startX.current;
    if (Math.abs(raw) > 6) moved.current = true;
    const max = getWidth() * DRAG_CLAMP_RATIO;
    const clamped = Math.max(-max, Math.min(max, raw));
    dragXRef.current = clamped;
    setDragX(clamped);
  };

  const endDrag = () => {
    draggingRef.current = false;
    const x = dragXRef.current;
    dragXRef.current = 0;
    const threshold = getWidth() * THRESHOLD_RATIO;

    if (x > threshold) {
      runExit("consume");
      return;
    }
    if (x < -threshold) {
      setDragging(false);
      setDragX(0);
      askFreeze();
      return;
    }
    setDragging(false);
    setDragX(0);
    if (!moved.current) onPress?.(item.id);
  };

  return (
    <Wrap>
      <ActionsLeft $visible={dragX > 0}>소진</ActionsLeft>
      <ActionsRight $visible={dragX < 0}>{isFreezer ? "" : "냉동실로\n이동"}</ActionsRight>
      <Card
        ref={cardRef}
        $bg={FRESHNESS_BG[fresh]}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : `transform ${EXIT_DURATION_MS}ms ease-out`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {item.thumbnailUri ? (
          <Thumb src={item.thumbnailUri} alt="" />
        ) : (
          <ThumbPlaceholder>
            <Icon $size={32}>restaurant</Icon>
          </ThumbPlaceholder>
        )}
        <Body>
          <Name>{item.name}</Name>
          <Meta>
            {LOCATION_LABEL[item.location]} · {CATEGORY_LABEL[item.category]}
            {item.quantity > 1 ? ` · ${item.quantity}개` : ""}
          </Meta>
        </Body>
        <Right>
          <Dday $color={color}>{dLabel(item)}</Dday>
          <Badge $color={color}>{FRESHNESS_LABEL[fresh]}</Badge>
        </Right>
        <MoreBtn
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            openMenu();
          }}
        >
          <Icon>more_vert</Icon>
        </MoreBtn>
      </Card>

      {sheet && (
        <ActionSheet
          title={sheet.title}
          message={sheet.message}
          options={sheet.options}
          cancelLabel={sheet.cancelLabel}
          onClose={() => setSheet(null)}
        />
      )}
    </Wrap>
  );
}
