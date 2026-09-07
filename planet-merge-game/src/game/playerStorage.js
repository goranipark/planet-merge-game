// 학생이 고른 별명 저장
// 별명 외의 개인정보(이름·반·학번)는 저장하지 않습니다.
// 저장 위치(탭 닫으면 초기화 여부)는 config.js 의 RESET_ON_TAB_CLOSE 를 따릅니다.
import { readValue, writeValue } from './storage'

const PLAYER_KEY = 'planet-merge-game:player'

export function loadPlayer() {
  try {
    const raw = readValue(PLAYER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.nickname) return null
    return { nickname: parsed.nickname } // 예전에 저장된 반 정보가 있어도 버림
  } catch {
    return null
  }
}

export function savePlayer(player) {
  writeValue(PLAYER_KEY, JSON.stringify(player))
}
