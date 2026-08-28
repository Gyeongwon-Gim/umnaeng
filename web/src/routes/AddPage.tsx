// 등록 화면 (PRD FR-1, §7 등록 흐름)
// 카메라/갤러리 → AI 인식(로딩) → 확인·수정 → 저장. 저신뢰 시 직접 입력 폴백.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { recognizeImage } from "../lib/api";
import { prepareThumbnail } from "../lib/image";
import { useStore } from "../lib/store";
import { todayISO } from "../lib/freshness";
import { addDaysISO } from "../lib/rules";
import { ItemEditor } from "../components/ItemEditor";
import { Icon } from "../components/Icon";
import type { ItemProposal } from "../lib/types";
import {
  AddRow,
  AddRowText,
  BigBtn,
  BigBtnText,
  Card,
  Confirm,
  ErrorBox,
  HintBox,
  Loading,
  LoadingText,
  ManualEntryBtn,
  Pick,
  PickDesc,
  PickTitle,
  Preview,
  PreviewSmall,
  Rationale,
  SaveBtn,
  SaveBtnText,
  Spinner,
} from "./AddPage.styles";

type Phase = "pick" | "loading" | "confirm";

export default function AddPage() {
  const navigate = useNavigate();
  const { addItems } = useStore();
  const [phase, setPhase] = useState<Phase>("pick");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ItemProposal[]>([]);
  const [lowConf, setLowConf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runRecognition = async (file: Blob) => {
    setPhase("loading");
    setError(null);
    setThumbnail(await prepareThumbnail(file).catch(() => null));
    try {
      const res = await recognizeImage(file);
      setProposals(res.items.length ? res.items : [blankProposal()]);
      setLowConf(res.lowConfidence || res.items.length === 0);
      setPhase("confirm");
    } catch (e: unknown) {
      // 인식 실패 폴백 (FR-1.5): 직접 입력으로 진입
      setError(e instanceof Error ? e.message : "인식에 실패했습니다.");
      setProposals([blankProposal()]);
      setLowConf(true);
      setPhase("confirm");
    }
  };

  // Capacitor Camera 플러그인: 네이티브(WebView)에서는 실제 카메라/갤러리로,
  // 브라우저 개발 모드에서는 자동으로 파일 선택창으로 폴백된다.
  const pickPhoto = async (source: CameraSource) => {
    try {
      const photo = await Camera.getPhoto({
        source,
        resultType: CameraResultType.DataUrl,
        quality: 80,
      });
      if (photo.dataUrl) {
        const blob = await fetch(photo.dataUrl).then((r) => r.blob());
        runRecognition(blob);
      }
    } catch {
      // 사용자가 촬영/선택을 취소한 경우 — 선택 화면에 그대로 머문다
    }
  };

  // AI 인식을 거치지 않고 바로 빈 항목을 채워 확인 화면으로 진입 (직접 입력)
  const enterManual = () => {
    setThumbnail(null);
    setError(null);
    setLowConf(false);
    setProposals([blankProposal()]);
    setPhase("confirm");
  };

  const save = () => {
    const valid = proposals.filter((p) => p.name.trim().length > 0);
    if (valid.length === 0) return;
    addItems(valid, thumbnail ?? undefined);
    navigate(-1); // 리스트로 복귀 (FR-1: 정렬 위치에 삽입됨)
  };

  if (phase === "pick") {
    return (
      <Pick>
        <PickTitle>사진 한 장으로 등록</PickTitle>
        <PickDesc>냉장고나 반찬통을 찍으면 AI가 자동 인식해요.</PickDesc>
        <BigBtn onClick={() => pickPhoto(CameraSource.Camera)}>
          <BigBtnText>
            <Icon>photo_camera</Icon>카메라로 촬영
          </BigBtnText>
        </BigBtn>
        <BigBtn $alt onClick={() => pickPhoto(CameraSource.Photos)}>
          <BigBtnText $alt>
            <Icon>image</Icon>갤러리에서 선택
          </BigBtnText>
        </BigBtn>
        <ManualEntryBtn onClick={enterManual}>
          <Icon $size={18}>edit</Icon>직접 입력할게요
        </ManualEntryBtn>
      </Pick>
    );
  }

  if (phase === "loading") {
    return (
      <Loading>
        {thumbnail && <Preview src={thumbnail} alt="" />}
        <Spinner />
        <LoadingText>AI가 음식을 인식하고 있어요…</LoadingText>
      </Loading>
    );
  }

  // confirm
  return (
    <Confirm>
      {thumbnail && <PreviewSmall src={thumbnail} alt="" />}
      {error && <ErrorBox>{error} 아래에서 직접 입력할 수 있어요.</ErrorBox>}
      {lowConf && !error && (
        <HintBox>인식 신뢰도가 낮아요. 품목명과 기한을 확인해주세요.</HintBox>
      )}

      {proposals.map((p, i) => (
        <ProposalCard
          key={i}
          value={p}
          onChange={(next) => setProposals((prev) => prev.map((x, j) => (j === i ? next : x)))}
          onRemove={() => setProposals((prev) => prev.filter((_, j) => j !== i))}
        />
      ))}

      <AddRow onClick={() => setProposals((p) => [...p, blankProposal()])}>
        <AddRowText>
          <Icon $size={18}>add</Icon>항목 추가
        </AddRowText>
      </AddRow>

      <SaveBtn onClick={save}>
        <SaveBtnText>저장</SaveBtnText>
      </SaveBtn>
    </Confirm>
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
    <Card>
      <ItemEditor value={value} onChange={onChange} onRemove={onRemove} />
      <Rationale>{value.rationale}</Rationale>
    </Card>
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
