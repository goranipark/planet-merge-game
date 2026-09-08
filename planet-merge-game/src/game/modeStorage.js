// 학생이 고른 게임 모드 기억하기
//
// 저장 위치(탭 닫으면 초기화 여부)는 별명과 같은 규칙을 따릅니다.
//   → config.js 의 RESET_ON_TAB_CLOSE
// 선생님이 `?mode=distance` 가 붙은 링크를 나눠주면 선택 화면 없이 바로 그 모드로 들어갑니다.
import { readValue, writeValue } from './storage'
import { isPlayable } from './modes'

const MODE_KEY = 'planet-merge-game:mode'

function readFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') ?? ''
  } catch {
    return ''
  }
}

export function loadMode() {
  const stored = readValue(MODE_KEY)
  return isPlayable(stored) ? stored : null
}

export function saveMode(id) {
  if (isPlayable(id)) writeValue(MODE_KEY, id)
}

// 처음 켤 때 쓸 모드.
// 주소에 있으면 그것을 쓰고 기억하고, 없으면 기억해 둔 값.
// 둘 다 없으면 null 을 돌려주고, 화면에서는 모드 선택 창을 띄웁니다.
// (아직 공사 중인 모드를 주소에 적어도 잠금이 풀리지 않고 선택 창이 뜹니다)
export function initMode() {
  const fromUrl = readFromUrl()
  if (isPlayable(fromUrl)) {
    saveMode(fromUrl)
    return fromUrl
  }
  return loadMode()
}
