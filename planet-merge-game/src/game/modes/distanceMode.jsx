// ver2 — 거리 순서 모드
//
// 태양에서 가까운 순서(수-금-지-화-목-토-천-해)로, 같은 궤도 둘을 합쳐
// 한 단계 바깥 궤도로 넓혀 가는 모드입니다. 해왕성 궤도를 만들면 완성입니다.
//
// 공의 크기 = 공전 궤도의 크기 (행성 자체의 크기가 아님)
// 고리 위 행성 점의 크기 = 행성의 실제 크기 → 궤도가 가장 큰 해왕성보다 목성 점이 더 큼
import { ORBITS } from '../orbits'
import { getOrbitSprite, ORBIT_SPRITE_DIAMETER } from '../orbitSprites'
import { MODE_TUNING } from '../config'

// 지구와의 거리 비교 문구 (4학년이 읽기 쉬운 표현으로)
function compareToEarth(au) {
  if (Math.abs(au - 1) < 0.01) return '거리를 재는 기준이에요'
  if (au < 0.5) return '지구보다 훨씬 태양에 가까워요'
  if (au < 1) return '지구보다 태양에 가까워요'
  const n = au >= 10 ? Math.round(au) : Math.round(au * 10) / 10
  return `지구보다 약 ${n}배 멀어요`
}

export const distanceMode = {
  id: 'distance',
  name: '거리 순서 게임',

  // 모드 선택 화면에 보여줄 소개
  select: {
    emoji: '🛰️',
    tagline: '태양에서 가까운 순서로',
    lines: ['수성 → 금성 → 지구 → 화성 →', '목성 → 토성 → 천왕성 → 해왕성'],
    footnote: '8단계 · 태양에서 가까운 순서',
  },

  // 이 모드에 등장하는 궤도 목록 (태양에서 가까운 순서)
  stages: ORBITS,
  spawnPoolSize: MODE_TUNING.distance.spawnPoolSize,
  mergeScores: MODE_TUNING.distance.mergeScores,

  // 궤도 고리 그림 (orbitSprites.js)
  getSprite: getOrbitSprite,
  spriteDiscDiameter: ORBIT_SPRITE_DIAMETER,

  // 병 안의 공 위에 표시할 이름표.
  // 그림 안에 글자를 넣으면 공이 구를 때 글자도 돌아가므로, 엔진이 화면 위에 똑바로 그립니다.
  label: (stage) => `${stage + 1} ${ORBITS[stage].name}`,

  // 정보 카드에 무엇을 보여줄지 — 거리 순서 모드는 "거리"가 주인공입니다
  card: {
    badge: '✨ 새로운 궤도 발견!',
    stats: (def) => [
      { label: '태양까지 거리', value: def.distanceText },
      { label: '지구와 비교', value: compareToEarth(def.au) },
    ],
  },

  // 화면 왼쪽 순서표 패널 문구
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
