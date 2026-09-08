// 게임 모드 목록
//
// 새 모드를 만들면 아래 MODES 에 한 줄 추가하면 모드 선택 화면에도 자동으로 나타납니다.
// 아직 준비가 안 된 모드는 모드 파일에 comingSoon: true 를 적어 두면 "공사 중"으로 잠깁니다.
import { MAINTENANCE } from '../config'
import { sizeMode } from './sizeMode'
import { distanceMode } from './distanceMode'

export const MODES = {
  [sizeMode.id]: sizeMode,
  [distanceMode.id]: distanceMode,
}

// 모드를 고르지 않았을 때 뒤에서 돌아가는 기본 모드
export const DEFAULT_MODE_ID = sizeMode.id

// 모드 id로 모드를 찾습니다. 모르는 id면 기본 모드를 돌려줍니다.
export function getMode(id) {
  return MODES[id] ?? MODES[DEFAULT_MODE_ID]
}

// 화면에서 목록으로 보여줄 때 쓰는 배열 (공사 중인 모드도 포함 — 잠긴 채로 보여줌)
export function modeList() {
  return Object.values(MODES)
}

// 이 모드가 잠겨 있는지 (점검 중이거나, 아직 만드는 중이거나)
export function isLocked(mode) {
  return MAINTENANCE || Boolean(mode?.comingSoon)
}

// 지금 실제로 플레이할 수 있는 모드인지
// 점검 중이면 예전에 골라 둔 모드가 있어도 잠기고 선택 화면이 뜹니다.
export function isPlayable(id) {
  const mode = MODES[id]
  return Boolean(mode) && !isLocked(mode)
}
