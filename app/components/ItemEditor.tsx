// 항목 필드 공용 편집 폼 (PRD FR-1.4 확인·수정)
// 등록 확인 화면(add)과 저장 항목 수정 화면(edit/[id])에서 공유한다.

import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { diffDays, todayISO } from "../src/freshness";
import { addDaysISO } from "../src/rules";
import type { StorageLocation } from "../src/types";

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

export function ItemEditor<T extends EditableFields>({ value, onChange, onRemove }: Props<T>) {
  const toggleLocation = () =>
    onChange({ ...value, location: value.location === "fridge" ? "freezer" : "fridge" });

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
    <View>
      <View style={styles.nameRow}>
        <TextInput
          style={styles.nameInput}
          value={value.name}
          placeholder="품목명"
          onChangeText={(name) => onChange({ ...value, name })}
        />
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={toggleLocation}>
          <Text style={styles.chipText}>{value.location === "freezer" ? "냉동" : "냉장"}</Text>
        </Pressable>

        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setQuantity(-1)} hitSlop={8}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{value.quantity}개</Text>
          <Pressable style={styles.stepBtn} onPress={() => setQuantity(1)} hitSlop={8}>
            <Text style={styles.stepBtnText}>＋</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => shiftExpiry(-1)} hitSlop={8}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>
            ~{value.expiresAt} ({remainLabel})
          </Text>
          <Pressable style={styles.stepBtn} onPress={() => shiftExpiry(1)} hitSlop={8}>
            <Text style={styles.stepBtnText}>＋</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: "row", alignItems: "center" },
  nameInput: { flex: 1, fontSize: 17, fontWeight: "600", color: "#212121", paddingVertical: 4 },
  remove: { fontSize: 18, color: "#BDBDBD", paddingHorizontal: 8 },
  row: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" },
  chip: { backgroundColor: "#F1F8E9", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14 },
  chipText: { color: "#2E7D32", fontSize: 13, fontWeight: "600" },
  stepper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F1F8E9", borderRadius: 14, overflow: "hidden",
  },
  stepBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  stepBtnText: { color: "#2E7D32", fontSize: 14, fontWeight: "700" },
  stepValue: { color: "#2E7D32", fontSize: 13, fontWeight: "600" },
});
