// ---------------------------------------------------------------
// 리더보드 설정 — 여기 값만 바꾸면 됩니다 (Data.md 참고)
// ---------------------------------------------------------------

// [1] Firebase 설정
// 비워두면 "이 기기에만 저장되는 연습용 리더보드"로 동작합니다.
// Firebase 콘솔에서 발급받은 값을 아래에 붙여넣으면 자동으로 온라인(반 전체 공유)으로 바뀝니다.
// 붙여넣는 방법은 저장소의 FIREBASE-설정안내.md 를 참고하세요.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDmC1-tv4u5am7v2p3fZRPZAsO0KoDj9to',
  authDomain: 'planet-merge-game-gorani.firebaseapp.com',
  projectId: 'planet-merge-game-gorani',
  storageBucket: 'planet-merge-game-gorani.firebasestorage.app',
  messagingSenderId: '1033179506423',
  appId: '1:1033179506423:web:953aeb42fe1745bcda95f2',
}

// [2] 리더보드에 보여줄 순위 개수 (design.md 기준 1~5위)
export const TOP_LIMIT = 5

// [3] 별명 최대 글자 수
// nicknames.js 가 "성격 + 모습 + 동물" 세 낱말을 띄어쓰기로 이어 만들므로 넉넉히 잡습니다.
// (예: "용감한 안경쓴 코끼리" = 12자)
export const NICKNAME_MAX = 20

// [4] 별명을 학생이 직접 입력하게 할지 여부
// false(기본) = 미리 준비된 안전한 별명 중에서 고르기 → 부적절한 말이 올라올 수 없음
// true        = 자유 입력 허용 (권장하지 않음. 금지어 필터는 변형 입력을 완전히 막지 못합니다)
export const ALLOW_CUSTOM_NICKNAME = false

// [5] 부정 점수 방지 — 이 점수를 넘으면 등록을 거부합니다.
// 실제 플레이로 도달하기 매우 어려운 값으로 잡되, 정상 최고 기록은 막지 않도록 여유를 둡니다.
// (Firestore 보안 규칙에도 같은 값을 넣어야 실제로 차단됩니다 — FIREBASE-설정안내.md 참고)
export const MAX_SCORE = 100000

// [6] 순위표 초기화 주기 설정
// 각 순위는 아래 기준이 바뀌는 순간 "새 순위"로 넘어갑니다. (예전 기록이 지워지는 것은 아니고,
// 해당 기간 순위표에서만 빠집니다. 완전 삭제는 FIREBASE-설정안내.md 의 초기화 명령 참고)
export const RESET = {
  // 하루의 시작 시각 (0~23). 0 = 매일 자정에 초기화
  // 예: 9로 두면 매일 오전 9시에 새 순위가 시작됩니다 (등교 후 시작을 원할 때)
  dayStartHour: 0,

  // 주의 시작 요일 (0=일요일, 1=월요일 … 6=토요일). 1 = 매주 월요일 0시에 초기화
  weekStartsOn: 1,

  // 달의 시작 날짜 (1~28). 1 = 매월 1일에 초기화
  monthStartsOnDay: 1,
}

// [7] 학급 코드 (반별 순위표)
// 선생님이 `게임주소?room=코드` 링크를 나눠주면 그 반 학생들끼리만 순위가 집계됩니다.
// 코드가 없으면 모두가 함께 쓰는 전체 순위표를 사용합니다.
export const DEFAULT_ROOM = 'all' // 전체 순위표를 뜻하는 값
export const ROOM_MAX = 20 // 학급 코드 최대 길이

// [8] 순위표 기간 탭
// label 은 화면에 보이는 이름입니다. 필요 없는 탭은 지워도 됩니다.
export const PERIODS = [
  { id: 'daily', label: '오늘', field: 'dayKey' },
  { id: 'weekly', label: '이번 주', field: 'weekKey' },
  { id: 'monthly', label: '이번 달', field: 'monthKey' },
]
