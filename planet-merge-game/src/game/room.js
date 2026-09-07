// 학급 코드 (반별 순위표)
//
// 선생님이 `?room=코드` 가 붙은 링크를 학생에게 나눠주면, 그 반 학생들끼리만 순위가 집계됩니다.
// 코드가 없으면 모두가 함께 쓰는 전체 순위표(all)를 사용합니다.
import { DEFAULT_ROOM, ROOM_MAX } from './leaderboardConfig'

const ROOM_KEY = 'planet-merge-game:room'

// 주소에 넣기 쉽고 규칙 검사도 간단하도록 영문 소문자·숫자·하이픈만 허용
export function sanitizeRoom(value) {
  const cleaned = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, ROOM_MAX)
  return cleaned.length >= 2 ? cleaned : ''
}

export function isValidRoom(value) {
  return value === DEFAULT_ROOM || sanitizeRoom(value) === value
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
    const stored = sanitizeRoom(window.localStorage.getItem(ROOM_KEY))
    return stored || DEFAULT_ROOM
  } catch {
    return DEFAULT_ROOM
  }
}

export function saveRoom(room) {
  try {
    if (room && room !== DEFAULT_ROOM) {
      window.localStorage.setItem(ROOM_KEY, room)
    } else {
      window.localStorage.removeItem(ROOM_KEY)
    }
  } catch {
    // 저장 불가 환경이면 이번 접속에만 적용됨
  }
}

// 처음 켤 때 사용할 학급 코드: 주소에 있으면 그것을 쓰고 기억, 없으면 기억해 둔 값
export function initRoom() {
  const fromUrl = readFromUrl()
  if (fromUrl) {
    saveRoom(fromUrl)
    return fromUrl
  }
  return loadRoom()
}

// 선생님이 학생에게 나눠줄 링크
export function roomLink(room) {
  const base = `${window.location.origin}${window.location.pathname}`
  return room && room !== DEFAULT_ROOM ? `${base}?room=${room}` : base
}
