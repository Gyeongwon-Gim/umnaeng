// 저장된 항목 수정 화면 — 리스트에서 항목 탭으로 진입 (FR-1.4 확장)
// AI가 채운 값을 사용자가 확인·수정할 수 있게 한다. 저장 시 store.updateItem 반영.

import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../src/store";
import { ItemEditor } from "../../components/ItemEditor";
import type { FridgeItem } from "../../src/types";

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, updateItem } = useStore();
  // 진입 시점 스냅샷으로 편집 — 저장 전까지 리스트에 반영되지 않음
  const [draft, setDraft] = useState<FridgeItem | undefined>(() =>
    items.find((it) => it.id === id),
  );

  if (!draft) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>항목을 찾을 수 없어요.</Text>
      </View>
    );
  }

  const save = () => {
    if (!draft.name.trim()) return;
    updateItem(draft.id, draft);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {draft.thumbnailUri && <Image source={{ uri: draft.thumbnailUri }} style={styles.preview} />}
      <View style={styles.card}>
        <ItemEditor value={draft} onChange={setDraft} />
        <Text style={styles.rationale}>{draft.rationale}</Text>
      </View>
      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>저장</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#FAFAFA", flexGrow: 1 },
  preview: { width: "100%", height: 160, borderRadius: 14, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 20 },
  rationale: { marginTop: 8, fontSize: 12, color: "#9E9E9E" },
  saveBtn: { backgroundColor: "#2E7D32", padding: 16, borderRadius: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center" },
  missingText: { color: "#9E9E9E", fontSize: 15 },
});
