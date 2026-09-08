// 병합 규칙
// 어떤 모드인지에 따라 단계 수와 점수표가 달라지므로, 모드를 함께 받습니다.

// 같은 단계 오브젝트인지 판별
export function canMerge(bodyA, bodyB) {
  return (
    bodyA.gameStage != null &&
    bodyB.gameStage != null &&
    bodyA.gameStage === bodyB.gameStage
  )
}

// 병합 후 다음 단계 번호 (마지막 단계끼리 부딪히면 더 이상 병합 불가 → null)
export function getNextStage(mode, stage) {
  return stage + 1 < mode.stages.length ? stage + 1 : null
}

// 병합 시 획득 점수 (config.js 의 MODE_TUNING 에서 조정)
export function mergeScore(mode, nextStage) {
  return mode.mergeScores[nextStage] ?? (nextStage + 1) * 10
}
