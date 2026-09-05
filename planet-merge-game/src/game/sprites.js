// 천체 카툰 스프라이트 생성기 (SVG → data URI)
// 이미지 파일 없이 코드로 직접 그리므로 저작권 문제가 없고, 크기를 자유롭게 키워도 깨지지 않습니다.
// 모든 스프라이트는 "본체 원(disc)의 지름 = SPRITE_DISC_DIAMETER" 규칙을 따르며,
// 토성 고리·태양 광선처럼 본체 바깥으로 튀어나오는 요소는 더 큰 캔버스에 그립니다.

export const SPRITE_DISC_DIAMETER = 180

const OUTLINE = '#2b2340'
const SW = 7 // 외곽선 두께

function svgDoc(size, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`
}

function toDataUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function disc(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`
}

function outline(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${OUTLINE}" stroke-width="${SW}"/>`
}

function clipDef(cx, cy, r) {
  return `<defs><clipPath id="c"><circle cx="${cx}" cy="${cy}" r="${r - 1}"/></clipPath></defs>`
}

function shine(cx, cy, r) {
  return (
    `<circle cx="${cx - r * 0.42}" cy="${cy - r * 0.42}" r="${r * 0.15}" fill="#fff" opacity="0.5"/>` +
    `<circle cx="${cx - r * 0.2}" cy="${cy - r * 0.62}" r="${r * 0.07}" fill="#fff" opacity="0.5"/>`
  )
}

// 크레이터: [dx, dy, 반지름] 은 본체 반지름 대비 비율
function craters(cx, cy, r, color, list) {
  return list
    .map(
      ([dx, dy, rr]) =>
        `<circle cx="${cx + dx * r}" cy="${cy + dy * r}" r="${rr * r}" fill="${color}"/>`
    )
    .join('')
}

// 가로 줄무늬(목성·토성·금성용): [y비율, 두께비율, 색]
function bands(cx, cy, r, list) {
  return list
    .map(
      ([dy, th, color]) =>
        `<rect x="${cx - r}" y="${cy + dy * r - (th * r) / 2}" width="${r * 2}" height="${th * r}" fill="${color}"/>`
    )
    .join('')
}

// ---------- 표정 ----------
// normal: 기본 미소 / surprised: 부딪혔을 때 놀람 / happy: 병합 직후 기쁨
// bored: 지루함 / curious: 호기심 / sleepy: 졸림  (bored·curious·sleepy·happy·normal은 대기 중 랜덤)
export const EXPRESSIONS = ['normal', 'surprised', 'happy', 'bored', 'curious', 'sleepy']
export const IDLE_EXPRESSIONS = ['normal', 'bored', 'curious', 'sleepy', 'happy']

function dotEye(x, y, er, dx = 0, dy = 0) {
  return (
    `<circle cx="${x + dx}" cy="${y + dy}" r="${er}" fill="${OUTLINE}"/>` +
    `<circle cx="${x + dx + er * 0.35}" cy="${y + dy - er * 0.35}" r="${er * 0.35}" fill="#fff"/>`
  )
}

function arcEye(x, y, w, h, r) {
  // h > 0 이면 위로 볼록(^ 행복), h < 0 이면 아래로 볼록(︶ 졸림)
  return `<path d="M${x - w} ${y} Q${x} ${y - h} ${x + w} ${y}" fill="none" stroke="${OUTLINE}" stroke-width="${r * 0.06}" stroke-linecap="round"/>`
}

function smile(cx, my, mw, depth, r) {
  return `<path d="M${cx - mw} ${my} Q${cx} ${my + depth} ${cx + mw} ${my}" fill="none" stroke="${OUTLINE}" stroke-width="${r * 0.055}" stroke-linecap="round"/>`
}

function blush(cx, cy, r, opacity = 0.6) {
  return (
    `<circle cx="${cx - r * 0.5}" cy="${cy + r * 0.16}" r="${r * 0.1}" fill="#ff8fa3" opacity="${opacity}"/>` +
    `<circle cx="${cx + r * 0.5}" cy="${cy + r * 0.16}" r="${r * 0.1}" fill="#ff8fa3" opacity="${opacity}"/>`
  )
}

// 귀여운 얼굴 (표정별)
function face(cx, cy, r, expression = 'normal', skin = '#fff') {
  const ey = cy - r * 0.02
  const ex = r * 0.3
  const er = r * 0.09
  const lx = cx - ex
  const rx = cx + ex
  const my = cy + r * 0.22

  switch (expression) {
    case 'surprised': {
      const wr = r * 0.17
      const eyes =
        `<circle cx="${lx}" cy="${ey}" r="${wr}" fill="#fff" stroke="${OUTLINE}" stroke-width="${r * 0.045}"/>` +
        `<circle cx="${rx}" cy="${ey}" r="${wr}" fill="#fff" stroke="${OUTLINE}" stroke-width="${r * 0.045}"/>` +
        `<circle cx="${lx}" cy="${ey + r * 0.02}" r="${r * 0.075}" fill="${OUTLINE}"/>` +
        `<circle cx="${rx}" cy="${ey + r * 0.02}" r="${r * 0.075}" fill="${OUTLINE}"/>`
      const brows =
        arcEye(lx, ey - r * 0.3, r * 0.13, r * 0.08, r) +
        arcEye(rx, ey - r * 0.3, r * 0.13, r * 0.08, r)
      const mouth =
        `<ellipse cx="${cx}" cy="${my + r * 0.08}" rx="${r * 0.1}" ry="${r * 0.14}" fill="${OUTLINE}"/>` +
        `<ellipse cx="${cx}" cy="${my + r * 0.15}" rx="${r * 0.055}" ry="${r * 0.05}" fill="#ff6b81"/>`
      return eyes + brows + mouth + blush(cx, cy, r, 0.75)
    }
    case 'happy': {
      const eyes = arcEye(lx, ey, r * 0.12, r * 0.12, r) + arcEye(rx, ey, r * 0.12, r * 0.12, r)
      const mw = r * 0.24
      const mouth =
        `<path d="M${cx - mw} ${my - r * 0.02} A${mw} ${mw * 0.8} 0 0 0 ${cx + mw} ${my - r * 0.02} Z" fill="${OUTLINE}"/>` +
        `<ellipse cx="${cx}" cy="${my + r * 0.1}" rx="${r * 0.1}" ry="${r * 0.06}" fill="#ff6b81"/>`
      return eyes + mouth + blush(cx, cy, r, 0.7)
    }
    case 'bored': {
      // 반쯤 감긴 눈: 눈 위쪽 절반을 피부색으로 덮고 눈꺼풀 선
      const lid = (x) =>
        `<rect x="${x - er - 2}" y="${ey - er - 2}" width="${er * 2 + 4}" height="${er + 2}" fill="${skin}"/>` +
        `<line x1="${x - er * 1.3}" y1="${ey}" x2="${x + er * 1.3}" y2="${ey}" stroke="${OUTLINE}" stroke-width="${r * 0.05}" stroke-linecap="round"/>`
      const eyes = dotEye(lx, ey, er) + dotEye(rx, ey, er) + lid(lx) + lid(rx)
      const mouth = `<line x1="${cx - r * 0.12}" y1="${my + r * 0.04}" x2="${cx + r * 0.14}" y2="${my + r * 0.02}" stroke="${OUTLINE}" stroke-width="${r * 0.055}" stroke-linecap="round"/>`
      return eyes + mouth + blush(cx, cy, r, 0.4)
    }
    case 'curious': {
      // 한쪽 눈 크게 + 눈썹 올림 + 시선 위쪽 + 작은 'o' 입
      const big = r * 0.13
      const eyes =
        dotEye(lx, ey, er, r * 0.03, -r * 0.03) +
        `<circle cx="${rx}" cy="${ey - r * 0.02}" r="${big}" fill="#fff" stroke="${OUTLINE}" stroke-width="${r * 0.04}"/>` +
        `<circle cx="${rx + r * 0.03}" cy="${ey - r * 0.05}" r="${r * 0.07}" fill="${OUTLINE}"/>` +
        `<circle cx="${rx + r * 0.055}" cy="${ey - r * 0.075}" r="${r * 0.025}" fill="#fff"/>`
      const brow = arcEye(rx, ey - r * 0.26, r * 0.14, r * 0.07, r)
      const mouth = `<circle cx="${cx + r * 0.06}" cy="${my + r * 0.04}" r="${r * 0.06}" fill="${OUTLINE}"/>`
      return eyes + brow + mouth + blush(cx, cy, r, 0.55)
    }
    case 'sleepy': {
      const eyes = arcEye(lx, ey, r * 0.12, -r * 0.1, r) + arcEye(rx, ey, r * 0.12, -r * 0.1, r)
      const mouth = `<circle cx="${cx}" cy="${my + r * 0.05}" r="${r * 0.045}" fill="${OUTLINE}"/>`
      const zzz =
        `<text x="${cx + r * 0.5}" y="${cy - r * 0.45}" font-family="Arial, sans-serif" font-weight="bold" font-size="${r * 0.26}" fill="${OUTLINE}">z</text>` +
        `<text x="${cx + r * 0.68}" y="${cy - r * 0.68}" font-family="Arial, sans-serif" font-weight="bold" font-size="${r * 0.18}" fill="${OUTLINE}">z</text>`
      return eyes + mouth + zzz + blush(cx, cy, r, 0.5)
    }
    default: {
      const eyes = dotEye(lx, ey, er) + dotEye(rx, ey, er)
      return eyes + smile(cx, my, r * 0.2, r * 0.16, r) + blush(cx, cy, r)
    }
  }
}

// ---------- 천체별 스프라이트 ----------

function asteroid(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#b0aeb8') +
      `<g clip-path="url(#c)">` +
      craters(c, c, r, '#87859a', [
        [-0.45, -0.35, 0.16],
        [0.4, -0.5, 0.11],
        [0.5, 0.35, 0.18],
        [-0.3, 0.55, 0.1],
      ]) +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function moon(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#eceff3') +
      `<g clip-path="url(#c)">` +
      craters(c, c, r, '#c3c9d3', [
        [-0.5, -0.4, 0.13],
        [0.55, -0.3, 0.1],
        [0.45, 0.5, 0.15],
        [-0.55, 0.45, 0.09],
        [0.05, 0.75, 0.08],
      ]) +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function mercury(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#cdbba9') +
      `<g clip-path="url(#c)">` +
      craters(c, c, r, '#a8917c', [
        [-0.55, -0.3, 0.1],
        [0.5, -0.55, 0.09],
        [0.6, 0.4, 0.12],
        [-0.45, 0.55, 0.11],
      ]) +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function mars(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#e8673f') +
      `<g clip-path="url(#c)">` +
      craters(c, c, r, '#c24d2c', [
        [-0.5, 0.5, 0.2],
        [0.55, 0.45, 0.14],
        [0.6, -0.4, 0.1],
      ]) +
      // 극지방 얼음
      `<ellipse cx="${c}" cy="${c - r * 0.98}" rx="${r * 0.5}" ry="${r * 0.22}" fill="#fff" opacity="0.9"/>` +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function venus(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#f5d98f') +
      `<g clip-path="url(#c)">` +
      `<path d="M${c - r} ${c - r * 0.45} q ${r * 0.5} ${r * 0.25} ${r} 0 t ${r} 0" fill="none" stroke="#e9bf63" stroke-width="${r * 0.16}"/>` +
      `<path d="M${c - r} ${c + r * 0.55} q ${r * 0.5} -${r * 0.25} ${r} 0 t ${r} 0" fill="none" stroke="#e9bf63" stroke-width="${r * 0.14}"/>` +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function earth(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#4fa8ff') +
      `<g clip-path="url(#c)">` +
      // 대륙
      `<path d="M${c - r * 0.9} ${c - r * 0.4} q ${r * 0.3} -${r * 0.35} ${r * 0.6} -${r * 0.1} q ${r * 0.15} ${r * 0.3} -${r * 0.1} ${r * 0.5} q -${r * 0.35} ${r * 0.1} -${r * 0.5} -${r * 0.4} z" fill="#5fcf6f"/>` +
      `<path d="M${c + r * 0.25} ${c + r * 0.3} q ${r * 0.35} -${r * 0.2} ${r * 0.6} ${r * 0.1} q -${r * 0.05} ${r * 0.4} -${r * 0.4} ${r * 0.5} q -${r * 0.3} -${r * 0.1} -${r * 0.2} -${r * 0.6} z" fill="#5fcf6f"/>` +
      `<circle cx="${c + r * 0.35}" cy="${c - r * 0.6}" r="${r * 0.18}" fill="#5fcf6f"/>` +
      // 구름
      `<ellipse cx="${c - r * 0.2}" cy="${c + r * 0.6}" rx="${r * 0.32}" ry="${r * 0.1}" fill="#fff" opacity="0.85"/>` +
      `<ellipse cx="${c + r * 0.5}" cy="${c - r * 0.25}" rx="${r * 0.22}" ry="${r * 0.08}" fill="#fff" opacity="0.85"/>` +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function neptune(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#4a6cf0') +
      `<g clip-path="url(#c)">` +
      bands(c, c, r, [
        [-0.55, 0.12, '#6f8dff'],
        [0.5, 0.1, '#3a55c9'],
      ]) +
      `<ellipse cx="${c + r * 0.45}" cy="${c + r * 0.45}" rx="${r * 0.2}" ry="${r * 0.12}" fill="#2f47b5"/>` +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function uranus(expr, skin) {
  const S = 220, c = 110, r = 90
  // 누운 자전축을 표현하는 얇은 세로 고리 (얼굴을 가리지 않도록 행성 뒤에 배치)
  const ring =
    `<ellipse cx="${c}" cy="${c}" rx="${r * 1.16}" ry="${r * 0.3}" transform="rotate(-78 ${c} ${c})" fill="none" stroke="${OUTLINE}" stroke-width="${r * 0.16}"/>` +
    `<ellipse cx="${c}" cy="${c}" rx="${r * 1.16}" ry="${r * 0.3}" transform="rotate(-78 ${c} ${c})" fill="none" stroke="#dff8fb" stroke-width="${r * 0.08}"/>`
  return svgDoc(
    S,
    clipDef(c, c, r) +
      ring +
      disc(c, c, r, '#a6e6ec') +
      `<g clip-path="url(#c)">` +
      bands(c, c, r, [
        [-0.5, 0.12, '#8fd8e0'],
        [0.45, 0.14, '#8fd8e0'],
      ]) +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function saturn(expr, skin) {
  const S = 260, c = 130, r = 90
  const rx = r * 1.3
  const ry = r * 0.4
  const ringBackClip = `<defs><clipPath id="top"><rect x="0" y="0" width="${S}" height="${c}"/></clipPath><clipPath id="bottom"><rect x="0" y="${c}" width="${S}" height="${S - c}"/></clipPath></defs>`
  const ringShape = (clip) =>
    `<g clip-path="url(#${clip})">` +
    `<ellipse cx="${c}" cy="${c}" rx="${rx}" ry="${ry}" fill="none" stroke="${OUTLINE}" stroke-width="${r * 0.26}"/>` +
    `<ellipse cx="${c}" cy="${c}" rx="${rx}" ry="${ry}" fill="none" stroke="#f1dcae" stroke-width="${r * 0.18}"/>` +
    `<ellipse cx="${c}" cy="${c}" rx="${rx}" ry="${ry}" fill="none" stroke="#d3ad63" stroke-width="${r * 0.05}"/>` +
    `</g>`
  return svgDoc(
    S,
    ringBackClip +
      clipDef(c, c, r) +
      ringShape('top') +
      disc(c, c, r, '#f2c97a') +
      `<g clip-path="url(#c)">` +
      bands(c, c, r, [
        [-0.6, 0.12, '#e0aa52'],
        [-0.3, 0.06, '#f8dfa6'],
        [0.5, 0.14, '#e0aa52'],
      ]) +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r) +
      ringShape('bottom')
  )
}

function jupiter(expr, skin) {
  const S = 200, c = 100, r = 90
  return svgDoc(
    S,
    clipDef(c, c, r) +
      disc(c, c, r, '#ecb987') +
      `<g clip-path="url(#c)">` +
      bands(c, c, r, [
        [-0.7, 0.14, '#d3895a'],
        [-0.4, 0.08, '#f8dcc0'],
        [0.5, 0.16, '#d3895a'],
        [0.78, 0.1, '#f8dcc0'],
      ]) +
      // 대적점
      `<ellipse cx="${c + r * 0.4}" cy="${c + r * 0.5}" rx="${r * 0.22}" ry="${r * 0.13}" fill="#d95b3e"/>` +
      `</g>` +
      shine(c, c, r) +
      face(c, c, r, expr, skin) +
      outline(c, c, r)
  )
}

function sun(expr, skin) {
  const S = 260, c = 130, r = 90
  let rays = ''
  const n = 12
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const a1 = a - 0.16
    const a2 = a + 0.16
    const inner = r * 1.0
    const outer = r * 1.38
    const x1 = c + Math.cos(a1) * inner
    const y1 = c + Math.sin(a1) * inner
    const x2 = c + Math.cos(a) * outer
    const y2 = c + Math.sin(a) * outer
    const x3 = c + Math.cos(a2) * inner
    const y3 = c + Math.sin(a2) * inner
    rays += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="#ffb628" stroke="${OUTLINE}" stroke-width="${SW * 0.8}" stroke-linejoin="round"/>`
  }
  return svgDoc(
    S,
    rays +
      disc(c, c, r, '#ffd84d') +
      `<circle cx="${c}" cy="${c}" r="${r * 0.72}" fill="#ffe98a" opacity="0.7"/>` +
      shine(c, c, r) +
      face(c, c, r, expr === 'normal' ? 'happy' : expr, skin) +
      outline(c, c, r)
  )
}

const BUILDERS = [
  asteroid,
  moon,
  mercury,
  mars,
  venus,
  earth,
  neptune,
  uranus,
  saturn,
  jupiter,
  sun,
]

// 표정 그릴 때 눈꺼풀 등을 덮는 데 쓰는 각 천체의 얼굴 부위 바탕색
const SKINS = [
  '#b0aeb8', // 소행성
  '#eceff3', // 위성
  '#cdbba9', // 수성
  '#e8673f', // 화성
  '#f5d98f', // 금성
  '#4fa8ff', // 지구
  '#4a6cf0', // 해왕성
  '#a6e6ec', // 천왕성
  '#f2c97a', // 토성
  '#ecb987', // 목성
  '#ffe27a', // 태양
]

const cache = new Map()

// stage 인덱스(0~10) + 표정에 해당하는 스프라이트 data URI 반환 (한 번 만들면 캐시)
export function getSprite(stage, expression = 'normal') {
  const key = `${stage}:${expression}`
  if (!cache.has(key)) {
    cache.set(key, toDataUri(BUILDERS[stage](expression, SKINS[stage])))
  }
  return cache.get(key)
}
