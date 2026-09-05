// ---------------------------------------------------------------
// 게임 밸런싱 설정 — 숫자만 바꾸면 게임 느낌이 바뀝니다 (코드 수정 불필요)
// ---------------------------------------------------------------

// [병(컨테이너) 크기] px. 세로가 길수록 게임이 길어지고, 가로가 넓을수록 쉬워짐
export const CONTAINER_WIDTH = 400
export const CONTAINER_HEIGHT = 600

// [천체 크기 배율] 1 = objects.js 의 radius 그대로. 0.9 로 하면 전체가 10% 작아져 더 오래 버팀
export const SIZE_SCALE = 1

// [낙하 시작 높이] 병 맨 위에서 몇 px 아래에서 떨어뜨릴지
export const SPAWN_Y = 44

// [게임오버 라인] 병 맨 위에서 몇 px 아래인지. 이 선 위에 천체가 "멈춰서" 머물면 게임오버
export const GAME_OVER_LINE_Y = 120
// 선 위에 얼마나 오래(ms) 머물러야 게임오버인지. 짧으면 억울한 게임오버가 늘어남
export const GAME_OVER_HOLD_MS = 1500

// [연속 낙하 제한] 한 번 떨어뜨린 뒤 다음 낙하까지 기다리는 시간(ms)
export const DROP_COOLDOWN_MS = 450

// [등장 천체 범위] 처음 몇 단계까지만 랜덤으로 떨어질지 (5 = 소행성~금성)
export const SPAWN_POOL_SIZE = 5

// [물리]
export const GRAVITY_Y = 1 // 중력 세기 (1 = 기본, 1.3 = 더 빨리 떨어짐)
export const RESTITUTION = 0.12 // 튕김 (0 = 안 튕김, 0.3 = 통통 튐)
export const FRICTION = 0.15 // 표면 마찰 (높을수록 미끄러지지 않고 잘 쌓임)
export const FRICTION_STATIC = 0.5 // 멈춰 있을 때 버티는 힘
export const DENSITY = 0.0012 // 무게감 (큰 천체가 작은 천체를 얼마나 밀어내는지에 영향)

// [점수] 병합 결과 단계(0~10)에 따른 점수. 큰 천체일수록 많이 줌
export const MERGE_SCORES = [0, 10, 20, 35, 55, 80, 110, 150, 200, 270, 400]

// [표정] ms
export const SURPRISED_MS = 700
export const MERGE_HAPPY_MS = 1000
