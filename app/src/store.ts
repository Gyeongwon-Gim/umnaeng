// 재고 상태 저장소 — React Context + AsyncStorage (오프라인 조회/스와이프, NFR-3)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConsumedRecord, FridgeItem, ItemProposal } from "./types";
import { freshnessOf, remainingDays, todayISO } from "./freshness";
import { addDaysISO, freezerShelfLifeDays } from "./rules";

const ITEMS_KEY = "olivefresh.items.v1";
const HISTORY_KEY = "olivefresh.history.v1";

/** 우선순위 큐 정렬 (FR-3.2/3.4): 만료 경과 최상단, 그다음 남은 기한 오름차순 */
export function sortItems(items: FridgeItem[], today = todayISO()): FridgeItem[] {
  return [...items].sort((a, b) => {
    const ra = remainingDays(a, today);
    const rb = remainingDays(b, today);
    const aExpired = ra < 0;
    const bExpired = rb < 0;
    if (aExpired !== bExpired) return aExpired ? -1 : 1; // 만료 섹션이 위로
    return ra - rb; // 임박 순 오름차순
  });
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StoreValue {
  items: FridgeItem[];
  history: ConsumedRecord[];
  loading: boolean;
  /** 확인 화면에서 저장 (FR-1.4) */
  addItems: (proposals: ItemProposal[], thumbnailUri?: string) => void;
  /** 수동 등록 폴백 (FR-1.5) */
  addManual: (item: Omit<FridgeItem, "id">) => void;
  /** 소진 처리 + Undo용 복원 함수 반환 (FR-6) */
  consume: (id: string) => (() => void) | undefined;
  /** 냉동실 이동 + 기한 재계산 (FR-7) */
  moveToFreezer: (id: string) => void;
  updateItem: (id: string, patch: Partial<FridgeItem>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [history, setHistory] = useState<ConsumedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 최초 로드
  useEffect(() => {
    (async () => {
      try {
        const [i, h] = await Promise.all([
          AsyncStorage.getItem(ITEMS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (i) setItems(JSON.parse(i));
        if (h) setHistory(JSON.parse(h));
      } catch (e) {
        console.warn("저장소 로드 실패", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 변경 시 영속화
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, loading]);

  const addItems = useCallback((proposals: ItemProposal[], thumbnailUri?: string) => {
    setItems((prev) => [
      ...prev,
      ...proposals.map((p): FridgeItem => ({
        id: uid(),
        name: p.name,
        category: p.category,
        kind: p.kind,
        location: p.location,
        quantity: p.quantity,
        storedAt: p.storedAt,
        expiresAt: p.expiresAt,
        shelfLifeDays: p.shelfLifeDays,
        rationale: p.rationale,
        thumbnailUri,
      })),
    ]);
  }, []);

  const addManual = useCallback((item: Omit<FridgeItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: uid() }]);
  }, []);

  const consume = useCallback((id: string) => {
    let removed: FridgeItem | undefined;
    setItems((prev) => {
      removed = prev.find((it) => it.id === id);
      return prev.filter((it) => it.id !== id);
    });
    if (!removed) return undefined;

    const rec: ConsumedRecord = {
      id: removed.id,
      name: removed.name,
      consumedAt: todayISO(),
      expiresAt: removed.expiresAt,
    };
    setHistory((prev) => [rec, ...prev]);

    // Undo: 이력에서 제거하고 재고 복원 (FR-6.2)
    const snapshot = removed;
    return () => {
      setHistory((prev) => prev.filter((r) => r.id !== snapshot.id));
      setItems((prev) => [...prev, snapshot]);
    };
  }, []);

  const moveToFreezer = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id || it.location === "freezer") return it;
        const days = freezerShelfLifeDays(it.kind);
        const storedAt = todayISO(); // 냉동 이동일 기준으로 재계산
        return {
          ...it,
          location: "freezer",
          storedAt,
          shelfLifeDays: days,
          expiresAt: addDaysISO(storedAt, days),
          rationale: "냉동 이동으로 보관기한 재계산",
        };
      }),
    );
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<FridgeItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ items, history, loading, addItems, addManual, consume, moveToFreezer, updateItem }),
    [items, history, loading, addItems, addManual, consume, moveToFreezer, updateItem],
  );

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/** 파생 셀렉터: 임박 항목 수 (알림/배지용) */
export function imminentCount(items: FridgeItem[], today = todayISO()): number {
  return items.filter((it) => {
    const f = freshnessOf(it, today);
    return f === "red" || f === "expired";
  }).length;
}
