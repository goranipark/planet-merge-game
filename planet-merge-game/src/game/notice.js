// 첫 화면 안내 팝업
//
// 게임이 바뀌었을 때 접속한 사람에게 한 번 알려 주는 창입니다.
// 한 번 "확인했어요"를 누르면 그 기기에서는 다시 뜨지 않습니다.
//
// ─────────────────────────────────────────────────────────────
// 새 안내를 띄우고 싶을 때
//   1) 아래 NOTICE 의 내용을 고치고
//   2) **id 를 새 값으로 바꾸면** 이미 확인한 사람에게도 다시 한 번 보입니다
//   3) until 날짜가 지나면 저절로 안 뜹니다 (빈 문자열이면 계속 뜸)
//   4) show 를 false 로 두면 아예 끕니다
// ─────────────────────────────────────────────────────────────
export const NOTICE = {
  show: true,
  id: '2026-09-name-change',
  until: '2026-11-30', // 이 날짜까지만 표시 (YYYY-MM-DD)
  title: '게임이 새로워졌어요!',
  items: [
    {
      icon: '✨',
      title: '이름이 "천체 합치기 게임"으로 바뀌었어요',
      body: '태양과 달, 위성도 나오니까요. 게임 내용과 주소는 그대로예요.',
    },
    {
      icon: '🛰️',
      title: '거리 순서 게임이 생겼어요',
      body: '수성 → 금성 → 지구 → … → 해왕성. 태양에서 가까운 순서로 궤도를 넓혀 가요.',
    },
    {
      icon: '🔑',
      title: '이제 우리 반 코드가 필요해요',
      body: '같은 반끼리만 순위를 겨루도록 바뀌었어요. 전국 순위표는 닫았습니다.',
    },
  ],
  teacher:
    '선생님께 — 이 창을 닫으면 바로 코드 화면이 나옵니다. 거기서 "➕ 새 학급 만들기"를 ' +
    '누르면 6자리 코드가 나오니, 칠판에 적거나 링크를 복사해 나눠주세요. ' +
    '예전에 올라간 점수는 새 순위표에는 보이지 않습니다.',
  student:
    '학생은 선생님이 알려준 코드를 넣거나, 링크로 들어오면 돼요. ' +
    '코드가 없으면 "혼자 연습하기"로도 할 수 있어요.',
}

const KEY = 'planet-merge-game:notice'

// 오늘이 표시 기간 안인지
function inPeriod() {
  if (!NOTICE.until) return true
  try {
    const today = new Date()
    const end = new Date(`${NOTICE.until}T23:59:59`)
    return today <= end
  } catch {
    return true
  }
}

// 지금 안내를 띄워야 하는지
export function shouldShowNotice() {
  if (!NOTICE.show || !inPeriod()) return false
  try {
    // 안내 저장은 탭을 닫아도 남깁니다 (같은 기기에서 매번 뜨면 성가시므로)
    return window.localStorage.getItem(KEY) !== NOTICE.id
  } catch {
    return true
  }
}

export function dismissNotice() {
  try {
    window.localStorage.setItem(KEY, NOTICE.id)
  } catch {
    // 저장 불가 환경이면 이번 접속에만 적용됨
  }
}
