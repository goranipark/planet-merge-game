// 학생이 정한 "반 + 별명"을 기기에 저장 (매번 다시 입력하지 않도록)
const PLAYER_KEY = 'planet-merge-game:player'

export function loadPlayer() {
  try {
    const raw = window.localStorage.getItem(PLAYER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.className || !parsed?.nickname) return null
    return { className: parsed.className, nickname: parsed.nickname }
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
