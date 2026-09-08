// 거리 순서 모드(ver2)의 행성 데이터가 규칙에 맞는지 확인하는 스크립트
//
//   실행: planet-merge-game 폴더에서  npm run check:orbits
//
// concept2.md 3장·8장에서 정한 규칙을 코드로 옮겨 둔 것입니다.
// 궤도 반지름이나 점수를 손본 뒤 이 스크립트를 돌리면, 게임이 깨지는 값인지 바로 알려 줍니다.
import { ORBITS, AU_KM } from '../planet-merge-game/src/game/orbits.js'
import { MODE_TUNING, CONTAINER_WIDTH } from '../planet-merge-game/src/game/config.js'

const problems = []
const notes = []

function check(ok, message) {
  if (!ok) problems.push(message)
}

// 1. 8행성이 순서대로 들어 있는지
check(ORBITS.length === 8, `행성이 8개여야 하는데 ${ORBITS.length}개입니다`)
ORBITS.forEach((o, i) => {
  check(o.id === i, `${o.name}의 id가 ${o.id} 입니다 (${i} 이어야 함)`)
})

const 이름순서 = ORBITS.map((o) => o.name).join(' ')
check(
  이름순서 === '수성 금성 지구 화성 목성 토성 천왕성 해왕성',
  `순서가 수금지화목토천해가 아닙니다: ${이름순서}`
)

// 2. 태양에서 먼 순서로 정렬되어 있는지 (거리 순서 모드의 존재 이유)
for (let i = 1; i < ORBITS.length; i++) {
  check(
    ORBITS[i].au > ORBITS[i - 1].au,
    `${ORBITS[i].name}이 ${ORBITS[i - 1].name}보다 태양에 가깝습니다 (거리 순서 어긋남)`
  )
  check(
    ORBITS[i].distanceKm > ORBITS[i - 1].distanceKm,
    `${ORBITS[i].name}의 거리(km)가 앞 행성보다 작습니다`
  )
}

// 3. AU 값이 실제 거리와 맞는지 (반올림 오차 5% 이내)
ORBITS.forEach((o) => {
  const 계산된AU = o.distanceKm / AU_KM
  const 오차 = Math.abs(계산된AU - o.au) / o.au
  check(오차 < 0.05, `${o.name}의 au(${o.au})와 거리(${o.distanceKm}km)가 서로 안 맞습니다`)
})

// 4. 궤도 반지름이 계속 커지는지 — 합칠수록 커져야 병이 차오르는 긴장감이 생깁니다
for (let i = 1; i < ORBITS.length; i++) {
  check(
    ORBITS[i].radius > ORBITS[i - 1].radius,
    `${ORBITS[i].name} 궤도가 ${ORBITS[i - 1].name} 궤도보다 작습니다`
  )
}

// 5. 가장 큰 궤도가 병 안에 들어가는지
const 최대지름 = ORBITS[ORBITS.length - 1].radius * 2
check(
  최대지름 < CONTAINER_WIDTH,
  `가장 큰 궤도(지름 ${최대지름}px)가 병 너비(${CONTAINER_WIDTH}px)보다 큽니다`
)
notes.push(`가장 큰 궤도는 병 너비의 ${Math.round((최대지름 / CONTAINER_WIDTH) * 100)}%`)

// 6. 행성 점 크기가 "실제 지름 순위"를 그대로 따르는지
//    이것이 어긋나면 "궤도가 크다 ≠ 행성이 크다"를 가르치는 장치가 무너집니다 (concept2.md 6장)
const 지름순위 = [...ORBITS].sort((a, b) => a.diameterKm - b.diameterKm).map((o) => o.name)
const 점크기순위 = [...ORBITS].sort((a, b) => a.dot - b.dot).map((o) => o.name)
check(
  지름순위.join(' ') === 점크기순위.join(' '),
  `행성 점 크기 순서가 실제 지름 순서와 다릅니다\n    실제 지름: ${지름순위.join(' < ')}\n    점 크기  : ${점크기순위.join(' < ')}`
)
const 가장큰행성 = 점크기순위[점크기순위.length - 1]
check(가장큰행성 === '목성', `점이 가장 큰 행성이 목성이 아니라 ${가장큰행성}입니다`)

// 7. 점이 고리 안에 들어가는지 (점이 고리보다 크면 그림이 깨집니다)
ORBITS.forEach((o) => {
  check(o.dot < o.radius * 0.6, `${o.name}의 행성 점(${o.dot})이 궤도(${o.radius})에 비해 너무 큽니다`)
})

// 8. 점수표가 단계 수와 맞는지
const 점수표 = MODE_TUNING.distance.mergeScores
check(점수표.length === ORBITS.length, `점수표가 ${점수표.length}칸입니다 (${ORBITS.length}칸이어야 함)`)
for (let i = 2; i < 점수표.length; i++) {
  check(점수표[i] > 점수표[i - 1], `점수표가 ${i}번째에서 줄어듭니다`)
}
check(
  MODE_TUNING.distance.spawnPoolSize < ORBITS.length,
  '처음 떨어지는 궤도 범위가 전체 단계 수보다 크거나 같습니다'
)

// ---------- 표로 출력 ----------
// 한글은 터미널에서 두 칸을 차지하므로, 글자 수가 아니라 화면 폭으로 맞춰 줍니다
const 폭 = (t) =>
  [...String(t)].reduce(
    (n, c) => n + (/[ᄀ-ᇿ　-鿿가-힯]/.test(c) ? 2 : 1),
    0
  )
const 왼쪽 = (t, n) => String(t) + ' '.repeat(Math.max(0, n - 폭(t)))
const 오른쪽 = (t, n) => ' '.repeat(Math.max(0, n - 폭(t))) + String(t)

const 열 = [
  ['  #', 3, 오른쪽],
  ['행성', 8, 왼쪽],
  ['태양까지 거리', 15, 오른쪽],
  ['AU', 6, 오른쪽],
  ['공전', 7, 오른쪽],
  ['궤도', 5, 오른쪽],
  ['행성점', 7, 오른쪽],
  ['점수', 6, 오른쪽],
]

console.log('\n거리 순서 모드 — 행성 데이터\n')
console.log(열.map(([h, n, f]) => f(h, n)).join(' '))
console.log('-'.repeat(열.reduce((sum, [, n]) => sum + n + 1, -1)))
ORBITS.forEach((o, i) => {
  const 값 = [i + 1, o.name, o.distanceText, o.au, o.orbitText, o.radius, o.dot, 점수표[i]]
  console.log(열.map(([, n, f], k) => f(값[k], n)).join(' '))
})

// 설계 의도 확인: 화성 → 목성 간격이 가장 크게 벌어졌는지 (소행성대가 있는 자리)
const 간격 = ORBITS.slice(1).map((o, i) => ({
  구간: `${ORBITS[i].name}→${o.name}`,
  배율: o.radius / ORBITS[i].radius,
}))
const 최대간격 = 간격.reduce((a, b) => (b.배율 > a.배율 ? b : a))
console.log('\n  궤도가 벌어지는 정도 (앞 단계 대비 배율)')
console.log('  ' + 간격.map((g) => `${g.구간} ${g.배율.toFixed(2)}`).join('  '))
console.log(`  → 가장 크게 벌어지는 구간: ${최대간격.구간} (${최대간격.배율.toFixed(2)}배)`)
if (최대간격.구간 !== '화성→목성') {
  notes.push(
    `설계 의도와 다름: 가장 벌어지는 구간이 "화성→목성"이 아니라 "${최대간격.구간}"입니다.` +
      ' 소행성대 이야기로 이어지지 않으니 반지름을 다시 보세요.'
  )
}

console.log('')
notes.forEach((n) => console.log('  참고: ' + n))

if (problems.length > 0) {
  console.log('\n문제를 찾았습니다:')
  problems.forEach((p) => console.log('  ✗ ' + p))
  console.log('')
  process.exit(1)
}

console.log('\n  ✓ 모두 통과했습니다.\n')
