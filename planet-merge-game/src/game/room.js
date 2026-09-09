// 학급 코드 (반별 순위표)
//
// 이 게임은 **학급 단위로 쓰는 것을 기본**으로 합니다.
// 반 친구들끼리 겨뤄야 "내가 3등이네!"가 생기기 때문입니다.
// 전국 순위표에 섞이면 4학년 학생은 상위권에 이름을 올릴 수가 없습니다.
//
// room 값은 셋 중 하나입니다.
//   'a7k2m9' 같은 문자열 → 그 학급의 순위표
//   PRACTICE            → 혼자 연습 (순위표에 올리지도, 불러오지도 않음)
//   null                → 아직 정하지 않음 (학급 코드 화면을 띄움)
import { DEFAULT_ROOM, ROOM_MAX } from './leaderboardConfig'

const ROOM_KEY = 'planet-merge-game:room'

// 순위표 없이 혼자 해보는 상태
export const PRACTICE = 'practice'

// 학급 코드로 쓸 수 없는 말
//   all      = 예전 전국 순위표 (지금은 닫혀 있음)
//   practice = 혼자 연습을 뜻하는 값
const RESERVED = [DEFAULT_ROOM, PRACTICE]

// 자동 발급 코드에 쓰는 글자
// 헷갈리기 쉬운 0·1·i·l·o 는 뺐습니다. (학생이 칠판을 보고 칩니다)
const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'
const CODE_LENGTH = 6

// 새 학급 코드 발급 (예: 'k7m2xq')
export function generateRoomCode() {
  let code = ''
  const values = new Uint32Array(CODE_LENGTH)
  try {
    crypto.getRandomValues(values)
    for (const v of values) code += CODE_CHARS[v % CODE_CHARS.length]
  } catch {
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    }
  }
  return code
}

// 화면에 보여줄 때는 크게, 세 글자씩 끊어서 (예: 'K7M 2XQ')
export function formatRoomCode(room) {
  if (!room || room === PRACTICE) return ''
  const upper = room.toUpperCase()
  return upper.length === 6 ? `${upper.slice(0, 3)} ${upper.slice(3)}` : upper
}

// 주소에 넣기 쉽고 규칙 검사도 간단하도록 영문 소문자·숫자·하이픈만 허용
export function sanitizeRoom(value) {
  const cleaned = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s/g, '') // 학생이 'K7M 2XQ' 처럼 띄어 써도 받아 줍니다
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, ROOM_MAX)
  if (cleaned.length < 2) return ''
  if (RESERVED.includes(cleaned)) return '' // 예약어는 학급 코드로 쓸 수 없음
  return cleaned
}

export function isValidRoom(value) {
  return sanitizeRoom(value) === value
}

// 순위표를 쓰는 상태인지 (혼자 연습이거나 아직 안 정했으면 false)
export function hasLeaderboard(room) {
  return Boolean(room) && room !== PRACTICE
}

function readFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    return sanitizeRoom(params.get('room'))
  } catch {
    return ''
  }
}

export function loadRoom() {
  try {
    const stored = window.localStorage.getItem(ROOM_KEY)
    if (stored === PRACTICE) return PRACTICE
    return sanitizeRoom(stored) || null
  } catch {
    return null
  }
}

export function saveRoom(room) {
  try {
    if (room === PRACTICE || sanitizeRoom(room)) {
      window.localStorage.setItem(ROOM_KEY, room)
    } else {
      window.localStorage.removeItem(ROOM_KEY)
    }
  } catch {
    // 저장 불가 환경이면 이번 접속에만 적용됨
  }
}

// 처음 켤 때 쓸 학급 코드.
// 주소에 있으면 그것을 쓰고 기억하고, 없으면 기억해 둔 값.
// 둘 다 없으면 null 을 돌려주고 화면에서 학급 코드 창을 띄웁니다.
// (예전 버전에서 쓰던 'all' 이 저장돼 있으면 무시되어 코드 창이 뜹니다)
export function initRoom() {
  const fromUrl = readFromUrl()
  if (fromUrl) {
    saveRoom(fromUrl)
    return fromUrl
  }
  return loadRoom()
}

// 선생님이 학생에게 나눠줄 링크
export function roomLink(room, modeId) {
  const base = `${window.location.origin}${window.location.pathname}`
  if (!hasLeaderboard(room)) return base
  const params = new URLSearchParams({ room })
  if (modeId) params.set('mode', modeId)
  return `${base}?${params}`
}
