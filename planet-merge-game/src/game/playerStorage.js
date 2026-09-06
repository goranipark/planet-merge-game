// 학생이 고른 별명을 기기에 저장 (매번 다시 고르지 않도록)
// 별명 외의 개인정보(이름·반·학번)는 저장하지 않습니다.
const PLAYER_KEY = 'planet-merge-game:player'

export function loadPlayer() {
  try {
    const raw = window.localStorage.getItem(PLAYER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.nickname) return null
    return { nickname: parsed.nickname } // 예전에 저장된 반 정보가 있어도 버림
  } catch {
    return null
  }
}

export function savePlayer(player) {
  try {
    window.localStorage.setItem(PLAYER_KEY, JSON.stringify(player))
  } catch {
    // 저장 불가 환경이면 이번 판에만 적용됨
  }
}
