// 게임 모드 목록
//
// 지금은 "크기 순서 게임" 하나뿐이고, 거리 순서 모드는 ToDo2.md 2~4번 단계에서 추가합니다.
// 새 모드를 만들면 아래 MODES 에 한 줄 추가하면 됩니다.
import { sizeMode } from './sizeMode'

export const MODES = {
  [sizeMode.id]: sizeMode,
}

// 주소에 아무것도 붙이지 않고 들어왔을 때 시작할 모드
export const DEFAULT_MODE_ID = sizeMode.id

// 모드 id로 모드를 찾습니다. 모르는 id면 기본 모드를 돌려줍니다.
export function getMode(id) {
  return MODES[id] ?? MODES[DEFAULT_MODE_ID]
}

// 화면에서 목록으로 보여줄 때 쓰는 배열
export function modeList() {
  return Object.values(MODES)
}
