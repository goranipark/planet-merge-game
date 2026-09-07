// 개인 기록 저장 (최고 점수, 별명, 본 정보 카드)
//
// config.js 의 RESET_ON_TAB_CLOSE 값에 따라 저장 위치가 달라집니다.
//   true  → sessionStorage: 탭을 닫으면 사라짐 (공용 기기에서 다음 학생이 깨끗하게 시작)
//   false → localStorage:   같은 기기에서 계속 이어짐
// 어느 쪽이든 새로고침(F5)으로는 지워지지 않습니다.
//
// 시크릿 모드·저장 차단 환경에서는 예외가 날 수 있으므로 항상 try/catch 로 감쌉니다.
import { RESET_ON_TAB_CLOSE } from './config'

const BEST_SCORE_KEY = 'planet-merge-game:best-score'

function store() {
  try {
    return RESET_ON_TAB_CLOSE ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

export function readValue(key) {
  try {
    return store()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeValue(key, value) {
  try {
    store()?.setItem(key, value)
  } catch {
    // 저장 불가 환경이면 조용히 무시 (게임은 계속 진행)
  }
}

// 저장 방식을 "탭 닫으면 초기화"로 바꾼 뒤에도 예전에 기기에 남아 있던 값이
// 계속 떠돌지 않도록 한 번 정리합니다.
if (RESET_ON_TAB_CLOSE) {
  try {
    window.localStorage.removeItem(BEST_SCORE_KEY)
    window.localStorage.removeItem('planet-merge-game:player')
  } catch {
    // 무시
  }
}

export function loadBestScore() {
  const n = Number(readValue(BEST_SCORE_KEY))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function saveBestScore(score) {
  writeValue(BEST_SCORE_KEY, String(score))
}

// 이번 판에 이미 본 천체 정보 카드 (같은 탭에서는 새로고침해도 다시 뜨지 않음)
const SEEN_STAGES_KEY = 'planet-merge-game:seen-stages'

export function loadSeenStages() {
  try {
    const raw = readValue(SEEN_STAGES_KEY)
    const list = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(list) ? list : [])
  } catch {
    return new Set()
  }
}

export function saveSeenStages(seenSet) {
  writeValue(SEEN_STAGES_KEY, JSON.stringify([...seenSet]))
}
