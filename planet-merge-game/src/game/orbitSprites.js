// ver2 거리 순서 모드 — 궤도 고리 그림 생성기 (concept2.md 7장)
//
// 공 하나 = 궤도 하나입니다.
//
//        ╭───────────────╮
//       ╱   (안쪽은 우주)  ╲
//      │      ^   ^        │   ← 얼굴 (ver1의 표정을 그대로 재사용)
//      │       ‿           │
//       ╲               ●  ╱   ← 고리 위에 올라탄 행성
//        ╰───────────────╯       (점 크기 = 실제 지름 비율)
//
// 중요한 규칙 두 가지 —
//  1) 고리(공)의 크기는 **궤도의 크기**입니다. 합칠수록 바깥 궤도가 되어 커집니다.
//  2) 고리 위 행성 점의 크기는 **행성의 실제 크기**입니다. 그래서 궤도가 가장 큰
//     해왕성보다 목성의 점이 더 큽니다. "궤도가 크다 ≠ 행성이 크다"를 눈으로 보게 하는 장치입니다.
//
// 고리·점·선의 두께는 **화면에 찍히는 픽셀 기준**으로 지정합니다.
// 스프라이트는 단계마다 다른 배율로 축소되어 그려지므로(작은 궤도일수록 많이 축소),
// 그 배율만큼 미리 키워서 그려야 화면에서 같은 두께로 보입니다. (아래 u 값)
// 아래 두 줄만 파일 확장자(.js)를 붙여 두었습니다.
// 브라우저 없이 npm run check:orbits 로 그림 크기를 검사할 수 있게 하기 위해서입니다.
import { ORBITS } from './orbits.js'
import { face, svgDoc, toDataUri, OUTLINE } from './sprites.js'

// 스프라이트 원본 크기. 물리 반지름에 맞춰 축소·확대됩니다.
export const ORBIT_SPRITE_DIAMETER = 180

const C = ORBIT_SPRITE_DIAMETER / 2 // 중심 좌표 (90, 90)
const R0 = ORBIT_SPRITE_DIAMETER / 2 // 원본에서의 공 반지름 (90)

// 화면 픽셀 기준 두께
const RING_WIDTH = 4 // 궤도 고리 굵기
const RING_EDGE = 2 // 고리 바깥·안쪽 검은 테두리 굵기
const DOT_EDGE = 1.6 // 행성 점 테두리 굵기

// 안쪽(궤도 안의 빈 우주) 색
const SPACE = '#1a1f3d'
// 얼굴 색. 어두운 우주 위에 그려야 하므로 ver1(어두운 색)과 반대로 밝은 색을 씁니다.
const INK = '#aeb9ff'

// 행성 점이 고리 위 어디에 놓일지 (단계마다 다르게 두어 심심하지 않게)
const DOT_ANGLE_DEG = [-55, -15, 25, 65, -125, 150, -160, 105]

// 안쪽 우주에 흩뿌릴 작은 별 (중심 대비 비율)
const STARS = [
  [-0.52, -0.5, 0.035],
  [0.46, -0.58, 0.028],
  [0.58, 0.42, 0.032],
  [-0.6, 0.36, 0.026],
  [0.1, 0.66, 0.024],
]

function starField(innerR) {
  return STARS.map(
    ([dx, dy, s]) =>
      `<circle cx="${(C + dx * innerR).toFixed(1)}" cy="${(C + dy * innerR).toFixed(1)}" r="${(s * innerR).toFixed(1)}" fill="#ffffff" opacity="0.5"/>`
  ).join('')
}

// 고리 위에 올라탄 행성 점
function planetDot(ringR, angleDeg, dotR, color) {
  const a = (angleDeg * Math.PI) / 180
  const x = C + Math.cos(a) * ringR
  const y = C + Math.sin(a) * ringR
  return (
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR.toFixed(1)}" fill="${color}"/>` +
    `<circle cx="${(x - dotR * 0.32).toFixed(1)}" cy="${(y - dotR * 0.32).toFixed(1)}" r="${(dotR * 0.3).toFixed(1)}" fill="#ffffff" opacity="0.55"/>` +
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR.toFixed(1)}" fill="none" stroke="${OUTLINE}" stroke-width="${(dotR * 0.28).toFixed(2)}"/>`
  )
}

function buildOrbit(stage, expression) {
  const o = ORBITS[stage]

  // u = 화면 1px 을 그리려면 원본에서 몇 칸이 필요한가
  //     (이 단계의 공은 화면에서 반지름 o.radius 로 줄어들어 그려집니다)
  const u = R0 / o.radius

  const edge = RING_EDGE * u
  const ringW = RING_WIDTH * u
  // 고리가 공 밖으로 삐져나가지 않도록 안쪽에 자리를 잡습니다
  const ringR = R0 - ringW / 2 - edge
  const innerR = ringR - ringW / 2 - edge // 고리 안쪽 우주의 반지름
  const dotR = Math.max(o.dot * u, 3)

  // 작은 궤도에서는 별까지 넣으면 복잡해 보여서 큰 궤도에만 별을 흩뿌립니다
  const 안쪽우주 =
    `<circle cx="${C}" cy="${C}" r="${innerR.toFixed(1)}" fill="${SPACE}"/>` +
    (o.radius >= 39 ? starField(innerR) : '')

  const 고리 =
    `<circle cx="${C}" cy="${C}" r="${ringR.toFixed(1)}" fill="none" stroke="${OUTLINE}" stroke-width="${(ringW + edge * 2).toFixed(1)}"/>` +
    `<circle cx="${C}" cy="${C}" r="${ringR.toFixed(1)}" fill="none" stroke="${o.color}" stroke-width="${ringW.toFixed(1)}"/>` +
    // 고리 위쪽에 살짝 빛나는 느낌
    `<path d="M ${(C - ringR * 0.72).toFixed(1)} ${(C - ringR * 0.72).toFixed(1)} A ${ringR.toFixed(1)} ${ringR.toFixed(1)} 0 0 1 ${(C + ringR * 0.35).toFixed(1)} ${(C - ringR * 0.94).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="${(ringW * 0.35).toFixed(1)}" stroke-linecap="round" opacity="0.5"/>`

  // ver1의 표정 그림을 그대로 가져오되, 선 색만 밝은 색으로 바꿔 칠합니다
  // (ver1은 밝은 행성 위에 어두운 선, 여기는 어두운 우주 위에 밝은 선)
  const 얼굴 = face(C, C, innerR * 0.82, expression, SPACE).split(OUTLINE).join(INK)

  return svgDoc(
    ORBIT_SPRITE_DIAMETER,
    안쪽우주 + 얼굴 + 고리 + planetDot(ringR, DOT_ANGLE_DEG[stage], dotR, o.color)
  )
}

const cache = new Map()

// 단계(0~7) + 표정에 해당하는 궤도 그림 data URI (한 번 만들면 캐시)
export function getOrbitSprite(stage, expression = 'normal') {
  const key = `${stage}:${expression}`
  if (!cache.has(key)) cache.set(key, toDataUri(buildOrbit(stage, expression)))
  return cache.get(key)
}
