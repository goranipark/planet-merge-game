// ver2 — 거리 순서 모드 (준비 중)
//
// 태양에서 가까운 순서(수-금-지-화-목-토-천-해)로, 같은 궤도 둘을 합쳐
// 한 단계 바깥 궤도로 넓혀 가는 모드입니다.
//
// 지금은 **모드 선택 화면에 "공사 중"으로만 표시**되고 실제로 플레이할 수 없습니다.
// 천체 데이터·궤도 그림·엔진 연결은 ToDo2.md 3~5번 단계에서 채웁니다.
// (comingSoon 을 지우면 잠금이 풀리므로, 데이터가 다 준비된 뒤에 지워야 합니다)

import { ORBITS } from '../orbits'
import { MODE_TUNING } from '../config'

export const distanceMode = {
  id: 'distance',
  name: '거리 순서 게임',

  // 아직 플레이할 수 없음 — 모드 선택 화면에서 잠기고, 눌러도 시작되지 않습니다
  comingSoon: true,

  // 모드 선택 화면에 보여줄 소개
  select: {
    emoji: '🛰️',
    tagline: '태양에서 가까운 순서로',
    lines: [
      '수성 → 금성 → 지구 → 화성 →',
      '목성 → 토성 → 천왕성 → 해왕성',
    ],
    footnote: '8단계 · 태양에서 가까운 순서',
  },

  // 이 모드에 등장하는 궤도 목록 (태양에서 가까운 순서)
  stages: ORBITS,
  spawnPoolSize: MODE_TUNING.distance.spawnPoolSize,
  mergeScores: MODE_TUNING.distance.mergeScores,

  // --- 궤도 고리 그림은 ToDo2.md 4번 단계에서 채웁니다 ---
  getSprite: null,
  spriteDiscDiameter: 0,
  guide: {
    title: '거리 순서표',
    hint: '같은 궤도 2개 → 한 단계 바깥 궤도',
    note: (
      <>
        <strong>태양에서 가까운 순서</strong>예요. 공의 크기는{' '}
        <strong>공전 궤도</strong>의 크기이고, 행성 자체의 크기가 아니에요!
      </>
    ),
  },
}
