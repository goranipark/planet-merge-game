// ---------------------------------------------------------------
// 리더보드 설정 — 여기 값만 바꾸면 됩니다 (Data.md 참고)
// ---------------------------------------------------------------

// [1] Firebase 설정
// 비워두면 "이 기기에만 저장되는 연습용 리더보드"로 동작합니다.
// Firebase 콘솔에서 발급받은 값을 아래에 붙여넣으면 자동으로 온라인(반 전체 공유)으로 바뀝니다.
// 붙여넣는 방법은 저장소의 FIREBASE-설정안내.md 를 참고하세요.
export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

// [2] 리더보드에 보여줄 순위 개수 (design.md 기준 1~5위)
export const TOP_LIMIT = 5

// [3] 별명 최대 글자 수 (nicknames.js 의 조합이 최대 8글자)
export const NICKNAME_MAX = 8

// [4] 별명을 학생이 직접 입력하게 할지 여부
// false(기본) = 미리 준비된 안전한 별명 중에서 고르기 → 부적절한 말이 올라올 수 없음
// true        = 자유 입력 허용 (권장하지 않음. 금지어 필터는 변형 입력을 완전히 막지 못합니다)
export const ALLOW_CUSTOM_NICKNAME = false

// [5] 부정 점수 방지 — 이 점수를 넘으면 등록을 거부합니다.
// 실제 플레이로 도달하기 매우 어려운 값으로 잡되, 정상 최고 기록은 막지 않도록 여유를 둡니다.
// (Firestore 보안 규칙에도 같은 값을 넣어야 실제로 차단됩니다 — FIREBASE-설정안내.md 참고)
export const MAX_SCORE = 100000

// [6] 리더보드 기간 탭
export const PERIODS = [
  { id: 'daily', label: '매일', days: 1 },
  { id: 'weekly', label: '매주', days: 7 },
  { id: 'monthly', label: '매월', days: 30 },
]
