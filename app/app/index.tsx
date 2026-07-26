// 리스트 뷰 — 우선순위 큐 정렬 + 냉장/냉동 필터 + Undo 스낵바 (PRD FR-3/6)

import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore, sortItems } from "../src/store";
import { remainingDays } from "../src/freshness";
import { SwipeableRow } from "../components/SwipeableRow";
import {
  requestNotificationPermission,
  scheduleDailyImminentNotice,
} from "../src/notifications";
import type { FridgeItem, StorageLocation } from "../src/types";

type Filter = StorageLocation;

export default function ListScreen() {
  const { items, consume, moveToFreezer, loading } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("fridge");
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);

  // 앱 진입 시 알림 권한 + 임박 알림 재예약 (FR-5)
  useEffect(() => {
    if (loading) return;
    (async () => {
      const ok = await requestNotificationPermission();
      if (ok) await scheduleDailyImminentNotice(items);
    })();
  }, [loading, items]);

  const filtered = useMemo(
    () => items.filter((it) => it.location === filter),
    [items, filter],
  );

  // 위치별 전체 재고 수 (만료 여부 무관, 필터 버튼 표시용)
  const locationCounts = useMemo(() => {
    const counts: Record<StorageLocation, number> = { fridge: 0, freezer: 0 };
    for (const it of items) counts[it.location]++;
    return counts;
  }, [items]);

  // 만료 섹션 분리 (FR-3.4)
  const sections = useMemo(() => {
    const sorted = sortItems(filtered);
    const expired = sorted.filter((it) => remainingDays(it) < 0);
    const active = sorted.filter((it) => remainingDays(it) >= 0);
    const out: { title: string; data: FridgeItem[] }[] = [];
    if (expired.length) out.push({ title: `만료 · ${expired.length}`, data: expired });
    if (active.length) out.push({ title: "", data: active });
    return out;
  }, [filtered]);

  const handleConsume = (id: string) => {
    const restore = consume(id);
    if (restore) {
      setUndo({ label: "소진 처리됨", restore });
      setTimeout(() => setUndo((u) => (u?.restore === restore ? null : u)), 5000); // 5초 (FR-6.2)
    }
  };

  return (
    <View style={styles.container}>
      <FilterBar filter={filter} onChange={setFilter} counts={locationCounts} />

      {sections.length === 0 ? (
        <Empty />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <SwipeableRow
              item={item}
              onConsume={handleConsume}
              onFreeze={moveToFreezer}
              onPress={(id) => router.push({ pathname: "/edit/[id]", params: { id } })}
            />
          )}
          renderSectionHeader={({ section }) =>
            section.title ? <Text style={styles.sectionHeader}>{section.title}</Text> : null
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* Undo 스낵바 (FR-6.2) */}
      {undo && (
        <View style={[styles.snackbar, { bottom: insets.bottom + 88 }]}>
          <Text style={styles.snackText}>{undo.label}</Text>
          <Pressable onPress={() => { undo.restore(); setUndo(null); }}>
            <Text style={styles.snackAction}>실행 취소</Text>
          </Pressable>
        </View>
      )}

      {/* 등록 FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push("/add")}
        hitSlop={12}
      >
        <Text style={styles.fabPlus}>＋</Text>
      </Pressable>
    </View>
  );
}

function FilterBar({
  filter,
  onChange,
  counts,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "fridge", label: "냉장", count: counts.fridge },
    { key: "freezer", label: "냉동", count: counts.freezer },
  ];
  return (
    <View style={styles.filterBar}>
      {tabs.map((t) => {
        const active = filter === t.key;
        return (
          <Pressable
            key={t.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(t.key)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            <View style={[styles.countBadge, active && styles.countBadgeActive]}>
              <Text style={[styles.countText, active && styles.countTextActive]}>{t.count}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Empty() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🧊</Text>
      <Text style={styles.emptyTitle}>냉장고가 비어 있어요</Text>
      <Text style={styles.emptyDesc}>＋ 버튼으로 사진을 찍어 등록해보세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  filterBar: { flexDirection: "row", padding: 12, gap: 8, backgroundColor: "#fff" },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E0E0E0",
  },
  tabActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  tabText: { color: "#555", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  countBadge: {
    minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4,
    alignItems: "center", justifyContent: "center", backgroundColor: "#E8F5E9",
  },
  countBadgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  countText: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  countTextActive: { color: "#fff" },
  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 6, backgroundColor: "#FAFAFA",
    color: "#9E9E9E", fontSize: 12, fontWeight: "700",
  },
  sep: { height: 1, backgroundColor: "#EEE", marginLeft: 118 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#424242" },
  emptyDesc: { fontSize: 14, color: "#9E9E9E", marginTop: 6, textAlign: "center" },
  snackbar: {
    position: "absolute", left: 16, right: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#323232", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16,
  },
  snackText: { color: "#fff", fontSize: 14 },
  snackAction: { color: "#81C784", fontWeight: "700", fontSize: 14 },
  fab: {
    position: "absolute", right: 20, width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center",
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  fabPlus: { color: "#fff", fontSize: 32, lineHeight: 36, fontWeight: "300" },
});
