// 등록 화면 (PRD FR-1, §7 등록 흐름)
// 카메라/갤러리 → AI 인식(로딩) → 확인·수정 → 저장. 저신뢰 시 직접 입력 폴백.

import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { recognizeImage } from "../src/api";
import { useStore } from "../src/store";
import { todayISO } from "../src/freshness";
import { addDaysISO } from "../src/rules";
import { ItemEditor } from "../components/ItemEditor";
import type { ItemProposal } from "../src/types";

type Phase = "pick" | "loading" | "confirm";

export default function AddScreen() {
  const router = useRouter();
  const { addItems } = useStore();
  const [phase, setPhase] = useState<Phase>("pick");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ItemProposal[]>([]);
  const [lowConf, setLowConf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runRecognition = async (uri: string) => {
    setImageUri(uri);
    setPhase("loading");
    setError(null);
    try {
      const res = await recognizeImage(uri);
      setProposals(res.items.length ? res.items : [blankProposal()]);
      setLowConf(res.lowConfidence || res.items.length === 0);
      setPhase("confirm");
    } catch (e: any) {
      // 인식 실패 폴백 (FR-1.5): 직접 입력으로 진입
      setError(e?.message ?? "인식에 실패했습니다.");
      setProposals([blankProposal()]);
      setLowConf(true);
      setPhase("confirm");
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) runRecognition(res.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!res.canceled) runRecognition(res.assets[0].uri);
  };

  const save = () => {
    const valid = proposals.filter((p) => p.name.trim().length > 0);
    if (valid.length === 0) return;
    addItems(valid, imageUri ?? undefined);
    router.back(); // 리스트로 복귀 (FR-1: 정렬 위치에 삽입됨)
  };

  if (phase === "pick") {
    return (
      <View style={styles.pick}>
        <Text style={styles.pickTitle}>사진 한 장으로 등록</Text>
        <Text style={styles.pickDesc}>냉장고나 반찬통을 찍으면 AI가 자동 인식해요.</Text>
        <Pressable style={styles.bigBtn} onPress={pickFromCamera}>
          <Text style={styles.bigBtnText}>📷 카메라로 촬영</Text>
        </Pressable>
        <Pressable style={[styles.bigBtn, styles.bigBtnAlt]} onPress={pickFromLibrary}>
          <Text style={styles.bigBtnTextAlt}>🖼️ 갤러리에서 선택</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "loading") {
    return (
      <View style={styles.loading}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>AI가 음식을 인식하고 있어요…</Text>
      </View>
    );
  }

  // confirm
  return (
    <ScrollView contentContainerStyle={styles.confirm}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewSmall} />}
      {error && <Text style={styles.errorBox}>{error} 아래에서 직접 입력할 수 있어요.</Text>}
      {lowConf && !error && (
        <Text style={styles.hintBox}>인식 신뢰도가 낮아요. 품목명과 기한을 확인해주세요.</Text>
      )}

      {proposals.map((p, i) => (
        <ProposalCard
          key={i}
          value={p}
          onChange={(next) => setProposals((prev) => prev.map((x, j) => (j === i ? next : x)))}
          onRemove={() => setProposals((prev) => prev.filter((_, j) => j !== i))}
        />
      ))}

      <Pressable style={styles.addRow} onPress={() => setProposals((p) => [...p, blankProposal()])}>
        <Text style={styles.addRowText}>＋ 항목 추가</Text>
      </Pressable>

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>저장</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProposalCard({
  value,
  onChange,
  onRemove,
}: {
  value: ItemProposal;
  onChange: (next: ItemProposal) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <ItemEditor value={value} onChange={onChange} onRemove={onRemove} />
      <Text style={styles.rationale}>{value.rationale}</Text>
    </View>
  );
}

/** 폴백/직접 입력용 빈 제안 (냉장 generic, 기본 3일) */
function blankProposal(): ItemProposal {
  const storedAt = todayISO();
  const days = 3;
  return {
    name: "",
    category: "sidedish",
    kind: "generic",
    cookState: "cooked",
    location: "fridge",
    quantity: 1,
    confidence: 0,
    storedAt,
    expiresAt: addDaysISO(storedAt, days),
    shelfLifeDays: days,
    rationale: "직접 입력 (기본 보관 3일)",
  };
}

const styles = StyleSheet.create({
  pick: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  pickTitle: { fontSize: 22, fontWeight: "700", color: "#212121", textAlign: "center" },
  pickDesc: { fontSize: 14, color: "#757575", textAlign: "center", marginTop: 8, marginBottom: 32 },
  bigBtn: { backgroundColor: "#2E7D32", padding: 18, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  bigBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  bigBtnAlt: { backgroundColor: "#F1F8E9" },
  bigBtnTextAlt: { color: "#2E7D32", fontSize: 16, fontWeight: "700" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  preview: { width: 220, height: 220, borderRadius: 16 },
  loadingText: { marginTop: 16, color: "#555", fontSize: 15 },
  confirm: { padding: 16, backgroundColor: "#FAFAFA" },
  previewSmall: { width: "100%", height: 160, borderRadius: 14, marginBottom: 12 },
  errorBox: { backgroundColor: "#FFEBEE", color: "#C62828", padding: 12, borderRadius: 10, marginBottom: 12 },
  hintBox: { backgroundColor: "#FFF8E1", color: "#F57F17", padding: 12, borderRadius: 10, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12 },
  rationale: { marginTop: 8, fontSize: 12, color: "#9E9E9E" },
  addRow: { padding: 14, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#C8E6C9", borderStyle: "dashed", marginBottom: 20 },
  addRowText: { color: "#2E7D32", fontWeight: "600" },
  saveBtn: { backgroundColor: "#2E7D32", padding: 16, borderRadius: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
