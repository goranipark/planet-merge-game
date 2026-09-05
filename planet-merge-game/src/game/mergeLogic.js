import { STAGES } from './objects'
import { MERGE_SCORES } from './config'

// 같은 단계 오브젝트인지 판별
export function canMerge(bodyA, bodyB) {
  return (
    bodyA.gameStage != null &&
    bodyB.gameStage != null &&
    bodyA.gameStage === bodyB.gameStage
  )
}

// 병합 후 다음 단계 인덱스 (태양끼리 충돌하면 더 이상 병합 불가 → null)
export function getNextStage(stage) {
  return stage + 1 < STAGES.length ? stage + 1 : null
}

// 병합 시 획득 점수 (config.js 의 MERGE_SCORES 에서 조정)
export function mergeScore(nextStage) {
  return MERGE_SCORES[nextStage] ?? (nextStage + 1) * 10
}
