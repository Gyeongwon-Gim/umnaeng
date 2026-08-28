# 엄냉관 (엄격한 냉장고 관리자)
<div align="center">
  <img width="300" height="300" align="center" alt="image" src="https://github.com/user-attachments/assets/4b2e1012-7652-413b-a0ce-e0c6f01e1a5e" />
</div>

사진 한 장으로 등록이 끝나는 생성형 AI 기반 냉장고 관리 앱.
Vision LLM(Claude)이 사진 속 음식을 인식하고 보관기한을 자동 산정하며,
사용자는 기한 임박 순 리스트에서 스와이프만으로 재고를 관리한다.

> **핵심 가치: "등록 3초, 관리 스와이프 1번."**

PRD: `[umnaeng_PRD.md](./docs/umnaeng_PRD.md)`

## 구조 (monorepo)

```
olive_fresh/
├── server/   # Node/TS BFF — Claude Vision 인식 + 보관기한 산정/클램핑 (API 키 서버 보관)
└── web/      # Vite + React 웹앱 — Capacitor로 iOS/Android 앱으로도 배포 가능
```

웹앱은 AI 호출을 서버(BFF)에 위임한다. Anthropic API 키는 서버에만 존재하며
클라이언트에 노출되지 않는다 (NFR-4/5, 보안).

카메라(`@capacitor/camera`)·알림(`@capacitor/local-notifications`)은 Capacitor
플러그인으로 구현되어 있다. 브라우저에서 `npm run dev`로 열면 각 플러그인이 제공하는
웹 폴백(파일 선택창 / Web Notification API)으로 자동 전환되므로, 네이티브 앱으로
패키징하기 전에도 브라우저에서 그대로 개발·테스트할 수 있다.

## 빠른 시작

### 1. 서버

```bash
cd server
cp .env.example .env          # ANTHROPIC_API_KEY 입력
npm install
npm run dev                   # http://localhost:8787
```



### 2. 웹앱

```bash
cd web
cp .env.example .env          # VITE_API_BASE 를 서버 주소로
npm install
npm run dev                   # http://localhost:5173
```

> 모바일 브라우저에서 테스트할 때는 `.env`의 `VITE_API_BASE`를 개발 PC의
> LAN IP(예: `http://192.168.0.10:8787`)로 지정한다. `localhost`는 기기에서
> PC를 가리키지 못한다.

### 3. 앱으로 배포 (Capacitor)

`web/`은 [Capacitor](https://capacitorjs.com)로 iOS/Android 네이티브 앱으로 패키징할 수
있게 구성되어 있다 (`web/capacitor.config.ts`). 네이티브 프로젝트 생성·빌드는 로컬
Xcode/Android Studio가 필요해 이 저장소에는 포함하지 않았다 — 처음 배포할 때 아래를
한 번만 실행한다.

```bash
cd web
npm run build                 # dist/ 생성
npx cap add ios               # ios/ 네이티브 프로젝트 생성 (최초 1회, Xcode 필요)
npx cap add android           # android/ 네이티브 프로젝트 생성 (최초 1회, Android Studio 필요)
```

이후 웹 코드를 수정할 때마다:

```bash
npm run build && npx cap sync   # dist/ 를 네이티브 프로젝트에 반영
npx cap open ios                # Xcode에서 실행/서명/배포
npx cap open android            # Android Studio에서 실행/서명/배포
```

> **배포 전 필수**: `capacitor.config.ts`의 `appId`(`com.umnaeng.app`)는 임시값이다.
> 실제 스토어에 올리기 전 본인이 소유한 역도메인 값으로 바꿔야 한다.

