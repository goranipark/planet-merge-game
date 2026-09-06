# Data.md — 온라인 리더보드 데이터 계층 To-Do

여러 반이 함께 플레이하는 것이 확정되어, ToDo.md 2장에서 "MVP는 서버/DB 불필요"로 보류했던 온라인 리더보드를 지금 도입합니다.

---

## 1. 백엔드 선택: Firebase Firestore 추천

| 기준 | Firebase Firestore | Google Sheets + Apps Script |
|---|---|---|
| 여러 반 동시 제출 처리 | 안정적 (분산 DB) | 동시 쓰기 많으면 지연/오류 가능성 |
| 일간/주간/월간 집계 | 쿼리로 간단히 처리 | 날짜 필터 로직 직접 구현 필요 |
| 실시간 갱신 | 지원(onSnapshot) | 미지원(새로고침 필요) |
| 기존 익숙도 | 신규 학습 필요 | 이미 익숙함(GAS) |
| 비용 | 무료 Spark 플랜으로 충분 | 완전 무료 |

**결정**: 여러 반 동시 접속·실시간성을 고려해 **Firebase Firestore**로 진행합니다. (GAS+Sheets에 더 익숙하셔서 그쪽을 원하시면 6장 구조를 Apps Script Web App으로 그대로 치환 가능합니다.)

---

## 2. 데이터 모델 설계

```
scores (컬렉션)
 └─ {문서ID} (자동 생성)
     - className: string      // 예: "3-2"
     - nickname: string       // 실명 대신 별명 (아래 4장 참고)
     - score: number
     - stageReached: string   // 도달한 최고 천체, 예: "목성"
     - createdAt: timestamp
```

- 별도 집계 테이블 없이 `createdAt` 범위 필터(일/주/월)로 조회 → 학교 규모 트래픽에서는 이 방식으로 충분

---

## 3. To-Do: Firebase 프로젝트 설정

- [ ] Firebase 콘솔에서 프로젝트 생성 (무료 Spark 플랜)
- [ ] Firestore Database 활성화 (우선 테스트 모드로 시작)
- [ ] 웹 앱 등록 → SDK config 키 발급
- [ ] React 프로젝트에 설치: `npm install firebase`
- [ ] `src/firebase.js` 초기화 코드 작성
- [ ] Firestore Security Rules 작성 → **테스트 모드로 배포하지 않기** (9장 참고)

---

## 4. To-Do: 개인정보/안전 체크리스트 (초등 대상 — 반드시 확인)

- [ ] 리더보드에 **실명 대신** "반+번호"(예: "3-2 7번") 또는 학생이 직접 정하는 닉네임 사용
- [ ] 개인정보 활용 관련 학교 규정·가정통신문 필요 여부 확인 (닉네임만 쓰면 대부분 불필요하지만 학교 방침 우선 확인)
- [ ] 리더보드 URL이 교외에서도 열리는 구조라면, 전체 공개로 둘지 학급 코드 입력 등으로 접근을 제한할지 결정

---

## 5. To-Do: 부정 점수 방지

클라이언트에서 직접 Firestore에 쓰는 구조는 개발자도구로 점수 조작이 가능합니다. 완벽 차단은 어렵지만:

- [ ] Firestore Security Rules에 "이론적 최대 점수 초과 시 쓰기 거부" 조건 추가
- [ ] (여유 있으면) Cloud Functions로 점수 제출을 검증 후 기록 — 학교 규모에서는 필수는 아님

---

## 6. To-Do: React 연동

- [ ] `submitScore(className, nickname, score, stage)` 함수 작성
- [ ] 기간별 조회 함수 — 매일/매주/매월 탭별 쿼리 (`orderBy('score','desc').limit(5)` + 날짜 필터)
- [ ] `LeaderboardPanel.jsx` 컴포넌트 — 탭 UI(매일/매주/매월) + 순위 리스트 (design.md 레이아웃 참고)
- [ ] 게임 시작 전 "반 선택" 입력 UI (드롭다운 또는 교사 사전 설정 코드)
- [ ] 오프라인 대비: 제출 실패 시 로컬 임시 저장 후 재시도 (학교 와이파이 불안정 고려)

---

## 7. To-Do: 테스트

- [ ] 여러 브라우저 탭으로 동시 제출 시뮬레이션 (여러 반 동시 플레이 상황 재현)
- [ ] 빈 반이름/음수 점수 등 이상값 방어 테스트
- [ ] 무료 할당량(일일 읽기/쓰기 한도) 대비 전교 학생 수 여유 확인

---

## 8. To-Do: 배포 전 최종 점검

- [ ] Security Rules를 프로덕션 기준으로 전환했는지 확인 (테스트 모드 방치 금지)
- [ ] 리더보드 초기화 방법 정리 (새 학기·새 대회 시작 시 데이터 리셋 절차)
- [ ] ToDo.md 6장 배포 방식(GitHub Pages)과 Firebase 연동이 정상 동작하는지 최종 확인
