// 리스트 항목 행 + 스와이프 제스처 (PRD FR-6 좌측 소진 / FR-7 우측 냉동)
// 접근성: 스와이프 대체로 길게 눌러 메뉴 제공 (NFR-6).

import React, { useRef } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import type { FridgeItem } from "../src/types";
import {
  dLabel,
  freshnessOf,
  FRESHNESS_BG,
  FRESHNESS_COLOR,
  FRESHNESS_LABEL,
} from "../src/freshness";

interface Props {
  item: FridgeItem;
  onConsume: (id: string) => void; // 좌측 스와이프
  onFreeze: (id: string) => void; // 우측 스와이프 (냉장→냉동)
}

const LOCATION_LABEL = { fridge: "냉장", freezer: "냉동" } as const;
const CATEGORY_LABEL = {
  ingredient: "식재료",
  sidedish: "반찬",
  product: "완제품",
} as const;

export function SwipeableRow({ item, onConsume, onFreeze }: Props) {
  const ref = useRef<Swipeable>(null);
  const fresh = freshnessOf(item);
  const color = FRESHNESS_COLOR[fresh];
  const isFreezer = item.location === "freezer";

  const close = () => ref.current?.close();

  const doFreeze = () => {
    if (isFreezer) {
      // 이미 냉동 상태 (§9-1 정책 결정 필요) — v1은 안내만
      Alert.alert("이미 냉동 보관 중", "냉장 해동 이동은 다음 버전에서 지원됩니다.");
      close();
      return;
    }
    // FR-7.3: 냉동=무기한 인식 교정 카피
    Alert.alert(
      "냉동실로 이동",
      "냉동해도 품질은 계속 떨어져요. 늦어도 권장 기한 안에 드시는 걸 권장해요.",
      [
        { text: "취소", style: "cancel", onPress: close },
        { text: "냉동 이동", onPress: () => { onFreeze(item.id); close(); } },
      ],
    );
  };

  // 길게 눌러 메뉴 (스와이프 대체 수단, NFR-6)
  const longPressMenu = () => {
    Alert.alert(item.name, undefined, [
      { text: "소진 처리", onPress: () => onConsume(item.id) },
      ...(isFreezer ? [] : [{ text: "냉동실로 이동", onPress: doFreeze }]),
      { text: "닫기", style: "cancel" as const },
    ]);
  };

  const renderLeftActions = () => (
    <RectButton style={[styles.action, styles.consume]} onPress={() => { onConsume(item.id); close(); }}>
      <Text style={styles.actionText}>소진</Text>
    </RectButton>
  );

  const renderRightActions = () =>
    isFreezer ? null : (
      <RectButton style={[styles.action, styles.freeze]} onPress={doFreeze}>
        <Text style={[styles.actionText, styles.freezeActionText]}>{"냉동실로\ntoss"}</Text>
      </RectButton>
    );

  return (
    <Swipeable
      ref={ref}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(dir) => {
        if (dir === "left") { onConsume(item.id); close(); }
        else doFreeze();
      }}
    >
      <RectButton
        style={[styles.row, { backgroundColor: FRESHNESS_BG[fresh] }]}
        onLongPress={longPressMenu}
      >
        {/* 임박도 색상 바 (텍스트 D-n과 병기, 색각 접근성) */}
        <View style={[styles.bar, { backgroundColor: color }]} />
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbEmoji}>🥗</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.meta}>
            {LOCATION_LABEL[item.location]} · {CATEGORY_LABEL[item.category]}
            {item.quantity > 1 ? ` · ${item.quantity}개` : ""}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.dday, { color }]}>{dLabel(item)}</Text>
          <Text style={[styles.badge, { color }]}>{FRESHNESS_LABEL[fresh]}</Text>
        </View>
      </RectButton>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 32,
    paddingRight: 16,
  },
  bar: { width: 8, height: "100%", borderRadius: 4, marginRight: 14 },
  thumb: { width: 80, height: 80, borderRadius: 16, marginRight: 16 },
  thumbPlaceholder: { backgroundColor: "#F1F8E9", alignItems: "center", justifyContent: "center" },
  thumbEmoji: { fontSize: 32 },
  body: { flex: 1 },
  name: { fontSize: 19, fontWeight: "600", color: "#212121" },
  meta: { fontSize: 14, color: "#757575", marginTop: 4 },
  right: { alignItems: "flex-end", minWidth: 64 },
  dday: { fontSize: 20, fontWeight: "700" },
  badge: { fontSize: 13, marginTop: 4, fontWeight: "600" },
  action: { justifyContent: "center", alignItems: "center", width: 80 },
  consume: { backgroundColor: "#43A047" },
  freeze: { backgroundColor: "#1E88E5", width: 112 },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  freezeActionText: { fontSize: 13, textAlign: "center" },
});
