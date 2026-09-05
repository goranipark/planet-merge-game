// 브라우저 localStorage 저장 (기기별 로컬 기록)
// 시크릿 모드·저장 차단 환경에서는 예외가 날 수 있으므로 항상 try/catch 로 감쌈
const BEST_SCORE_KEY = 'planet-merge-game:best-score'

export function loadBestScore() {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY)
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // 저장 불가 환경이면 조용히 무시 (게임은 계속 진행)
  }
}
