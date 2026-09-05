import { STAGES } from '../game/objects'
import { getSprite } from '../game/sprites'

// 목록에 표시할 그림 크기(px). 실제 게임 크기 비율을 유지하되,
// 소행성이 너무 작아 안 보이지 않도록 최소/최대값 안에서 조절합니다.
const MIN_SIZE = 20
const MAX_SIZE = 42

function displaySize(radius) {
  const smallest = STAGES[0].radius
  const largest = STAGES[STAGES.length - 1].radius
  const t = (radius - smallest) / (largest - smallest)
  return Math.round(MIN_SIZE + t * (MAX_SIZE - MIN_SIZE))
}

function PlanetGuide({ maxStage = -1 }) {
  return (
    <aside className="card planet-guide">
      <h2 className="guide-title">크기 순서표</h2>
      <p className="guide-hint">같은 천체 2개 → 다음 천체</p>
      <p className="guide-note">
        실제 <strong>지름이 작은 것부터 큰 순서</strong>예요.
        태양에서 가까운 순서(태양계 배열)가 아니에요!
      </p>
      <ol className="guide-list">
        {STAGES.map((stage, index) => {
          const size = displaySize(stage.radius)
          const found = index <= maxStage
          return (
            <li
              key={stage.id}
              className={`guide-item${found ? ' is-found' : ''}`}
            >
              <span className="guide-num">{index + 1}</span>
              <span className="guide-icon">
                <img
                  src={getSprite(stage.id)}
                  alt=""
                  width={size}
                  height={size}
                />
              </span>
              <span className="guide-name">{stage.name}</span>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

export default PlanetGuide
