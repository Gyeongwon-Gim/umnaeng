// 저장된 항목 수정 화면 — 리스트에서 항목 탭으로 진입 (FR-1.4 확장)
// AI가 채운 값을 사용자가 확인·수정할 수 있게 한다. 저장 시 store.updateItem 반영.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { ItemEditor } from "../components/ItemEditor";
import type { FridgeItem } from "../lib/types";
import {
  Card,
  Container,
  Missing,
  MissingText,
  Preview,
  Rationale,
  SaveBtn,
  SaveBtnText,
} from "./EditPage.styles";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, updateItem } = useStore();
  // 진입 시점 스냅샷으로 편집 — 저장 전까지 리스트에 반영되지 않음
  const [draft, setDraft] = useState<FridgeItem | undefined>(() =>
    items.find((it) => it.id === id),
  );

  if (!draft) {
    return (
      <Missing>
        <MissingText>항목을 찾을 수 없어요.</MissingText>
      </Missing>
    );
  }

  const save = () => {
    if (!draft.name.trim()) return;
    updateItem(draft.id, draft);
    navigate(-1);
  };

  return (
    <Container>
      {draft.thumbnailUri && <Preview src={draft.thumbnailUri} alt="" />}
      <Card>
        <ItemEditor value={draft} onChange={setDraft} />
        <Rationale>{draft.rationale}</Rationale>
      </Card>
      <SaveBtn onClick={save}>
        <SaveBtnText>저장</SaveBtnText>
      </SaveBtn>
    </Container>
  );
}
