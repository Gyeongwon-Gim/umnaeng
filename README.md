# 엄냉관 (엄격한 냉장고 관리자)

사진 한 장으로 등록이 끝나는 생성형 AI 기반 냉장고 관리 앱.
Vision LLM(Claude)이 사진 속 음식을 인식하고 보관기한을 자동 산정하며,
사용자는 기한 임박 순 리스트에서 스와이프만으로 재고를 관리한다.

> **핵심 가치: "등록 3초, 관리 스와이프 1번."**

PRD: [`umnaeng_PRD.md`](./docs/umnaeng_PRD.md)

## 구조 (monorepo)

```
olive_fresh/
├── server/   # Node/TS BFF — Claude Vision 인식 + 보관기한 산정/클램핑 (API 키 서버 보관)
└── app/      # Expo (React Native) — 리스트/스와이프/알림/카메라
```

앱은 AI 호출을 서버(BFF)에 위임한다. Anthropic API 키는 서버에만 존재하며
클라이언트에 노출되지 않는다 (NFR-4/5, 보안).

## 빠른 시작

### 1. 서버

```bash
cd server
cp .env.example .env          # ANTHROPIC_API_KEY 입력
npm install
npm run dev                   # http://localhost:8787
```

### 2. 앱

```bash
cd app
cp .env.example .env          # EXPO_PUBLIC_API_BASE 를 서버 주소로
npm install
npm start                     # Expo Dev Server → Expo Go 앱으로 스캔
```

> 실기기에서 테스트할 때는 `.env`의 `EXPO_PUBLIC_API_BASE`를 개발 PC의
> LAN IP(예: `http://192.168.0.10:8787`)로 지정한다. `localhost`는 기기에서
> PC를 가리키지 못한다.

## 기능 매핑 (PRD → 구현)

| PRD | 구현 위치 |
|---|---|
| FR-1 사진 자동 등록 | `server/src/recognize.ts`, `app/app/add.tsx` |
| FR-2 보관기간 자동 설정 + 클램핑 | `server/src/rules.ts` |
| FR-3 우선순위 큐 정렬 | `app/src/store.ts` (`sortItems`) |
| FR-4 임박도 색상 | `app/src/freshness.ts` |
| FR-5 임박 알림 | `app/src/notifications.ts` |
| FR-6 좌측 스와이프 소진 + Undo | `app/components/SwipeableRow.tsx` |
| FR-7 우측 스와이프 냉동 이동 | `app/components/SwipeableRow.tsx`, `app/src/store.ts` |

## 마일스톤 (PRD §10 기준)

- **M1** 리스트 + 수동 등록 + 정렬/색상 + 스와이프 ← 현재 스캐폴드 완성
- **M2** AI 사진 인식 + 자동 기한 산정 + 확인/수정 ← 서버 `/recognize` 완성
- **M3** 푸시 알림 + 냉동 이동 정책 + Undo/통계 기초
- **M4** 베타 출시 계측/튜닝
