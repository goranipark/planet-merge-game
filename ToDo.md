# 행성 합치기 게임 — ToDo & 기술 결정 문서

concept.md 기준으로 플랫폼/기술 스택을 결정하고, 로컬 실행 Setup까지 정리한 실행 문서입니다.

---

## 1. 웹 vs 앱 추천 → **웹(Web) 추천**

| 기준 | 웹 (React) | 앱 (Flutter) |
|---|---|---|
| 학생 배포 | 링크/QR코드 하나로 즉시 접근 | 스토어 심사 or MDM 배포 필요 |
| 기기 호환성 | Chromebook·iPad·Windows·Android 전부 대응 | OS별 빌드/서명 각각 필요 |
| 유지보수 | 서버 1곳만 업데이트하면 전체 반영 | 업데이트마다 재배포·재심사 가능성 |
| 기존 작업 방식과의 정합성 | 기존 "학생 배포용 단일 HTML/JS" 방식과 동일 선상 | 신규 빌드/배포 파이프라인 필요 |
| 게임 성능 요구치 | Matter.js 2D 물리로 충분 (고사양 불필요) | 성능 이점이 크게 체감되지 않음 |

**결론**: 이 게임은 2D 물리 기반 캐주얼 게임이라 네이티브 앱의 성능 이점이 필요하지 않고, 태백 지역처럼 기기 환경이 다양한 학급에서는 **설치 없이 링크로 바로 실행되는 웹**이 압도적으로 유리합니다. 황지초 iPad는 Apple School Manager로 관리 중이라 앱 푸시 배포 자체는 가능하지만, 그 경우 Android/Chromebook 학생은 소외되므로 웹이 더 적합합니다.

→ **플랫폼: 웹 / 프레임워크: React (Vite 기반)**

> 참고: concept.md 7장에서는 "순수 HTML/CSS/JS 단일 파일"을 제안했으나, 점수·다음 미리보기·게임오버·교육 정보카드 등 **상태(state)가 얽힌 UI가 많아** 이번엔 React로 구조화하는 것을 권장합니다. Matter.js(물리 엔진) 자체는 그대로 사용합니다.

---

## 2. 서버 / DB 필요 여부 → **MVP는 불필요**

- **핵심 게임 플레이(병합, 점수, 게임오버)**: 100% 클라이언트 사이드로 동작 가능 → 서버 불필요
- **최고 점수 저장**: 브라우저 `localStorage`로 충분 (기기별 로컬 기록)
- **온라인 리더보드(확장 기능, concept.md 10장)를 실제로 넣고 싶을 경우에만** 아래 중 택1:
  - **Firebase Firestore** — 서버리스, 무료 티어로 학급 단위 트래픽 충분, React 연동 쉬움
  - **Google Sheets + Apps Script** — 기존에 익숙한 GAS로 점수 기록용 API 대체 가능 (별도 신규 서비스 학습 불필요, 다만 동시접속·응답속도는 Firebase보다 불리)
- **결론**: 1차 개발(파일럿 테스트 단계)에서는 서버/DB 없이 로컬 기록만으로 진행하고, 정식 배포 후 필요성이 확인되면 Firebase를 붙이는 순서를 권장합니다.

---

## 3. 프로젝트 구조 (React + Vite 기준)

```
planet-merge-game/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ game/
│  │  ├─ engine.js        # Matter.js 초기화, 컨테이너/중력
│  │  ├─ mergeLogic.js     # 11단계 병합 로직
│  │  └─ objects.js        # 천체별 크기·색상·정보 데이터
│  ├─ components/
│  │  ├─ ScoreBoard.jsx
│  │  ├─ NextPreview.jsx
│  │  ├─ GameOverModal.jsx
│  │  └─ InfoCard.jsx      # 교육 모드 천체 정보 팝업
│  ├─ assets/
│  │  ├─ images/
│  │  └─ audio/
│  └─ styles/
│     └─ index.css
└─ ToDo.md / concept.md / design.md
```

---

## 4. 로컬 실행 Setup 스크립트

**사전 준비**: Node.js 18 이상 설치 여부만 확인하면 됩니다.

`setup.sh` (Claude Code 터미널 / Git Bash 에서 실행)
```bash
#!/bin/bash
set -e

echo "[1/4] Node.js 버전 확인"
node -v || { echo "Node.js가 필요합니다: https://nodejs.org 에서 LTS 설치 후 재실행하세요."; exit 1; }

echo "[2/4] Vite + React 프로젝트 생성"
npm create vite@latest planet-merge-game -- --template react

cd planet-merge-game

echo "[3/4] 필수 패키지 설치 (Matter.js 물리 엔진)"
npm install
npm install matter-js

echo "[4/4] 개발 서버 실행"
npm run dev
```

**Windows PowerShell로 실행하는 경우** (Claude Code 없이 바로 CMD/PowerShell 사용 시):
```powershell
node -v
npm create vite@latest planet-merge-game -- --template react
cd planet-merge-game
npm install
npm install matter-js
npm run dev
```

실행 후 터미널에 뜨는 `http://localhost:5173` 주소를 브라우저에서 열면 바로 확인 가능합니다.

---

## 5. 개발 To-Do 체크리스트 (concept.md 8장 절차 매핑)

- [x] Vite+React 프로젝트 초기화 (Setup 스크립트 실행)
- [x] Matter.js 컨테이너 + 중력 + 원형 오브젝트 낙하 프로토타입 (병합 로직 제외)
- [x] 11단계 오브젝트 데이터 정의 (`objects.js` — 크기·이름·색상·지름 정보)
- [x] 충돌 감지 → 동일 단계 판별 → 병합 로직 구현 (`mergeLogic.js`)
- [x] UI 컴포넌트 연결: 점수판, 다음 미리보기, 게임오버 모달
- [x] 우주 배경 + 천체 스프라이트 적용 (`sprites.js` — SVG 카툰 스프라이트, 표정 6종)
- [x] BGM/효과음 연결 (음소거 토글 포함) — 코드 합성, `soundAssets.js`에서 파일로 교체 가능
- [x] 교육 모드: 병합 시 천체 정보 카드 팝업 (처음 만든 천체만, 게임 일시정지)
- [x] `localStorage` 최고 점수 저장 기능
- [x] 밸런싱 (조준 미리보기, 낙하 쿨다운, 물리값 — 모두 `config.js`에서 조정)
- [ ] 학생 대상 파일럿 테스트
- [x] 배포 설정 (`.github/workflows/deploy.yml` — GitHub Desktop으로 push하면 자동 배포)
- [ ] 배포 실행: GitHub Desktop으로 저장소 publish → Settings → Pages → Source "GitHub Actions"

---

## 6. 배포 추천

**GitHub Pages** 권장 — 별도 서버 비용 없이 정적 파일만으로 배포 가능하고, 기존에 사용하시는 GitHub Desktop으로 push하면 자동 반영되도록 설정 가능합니다(GitHub Actions 워크플로우 1회 설정 필요). Vercel/Netlify도 대안이지만, 기존 GitHub 중심 워크플로우와의 정합성을 고려하면 GitHub Pages가 가장 자연스럽습니다.
