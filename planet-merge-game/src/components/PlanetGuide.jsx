// 목록에 표시할 그림 크기(px). 실제 게임 크기 비율을 유지하되,
// 가장 작은 것이 너무 작아 안 보이지 않도록 최소/최대값 안에서 조절합니다.
const MIN_SIZE = 20
const MAX_SIZE = 42

function displaySize(stages, radius) {
  const smallest = stages[0].radius
  const largest = stages[stages.length - 1].radius
  const t = (radius - smallest) / (largest - smallest)
  return Math.round(MIN_SIZE + t * (MAX_SIZE - MIN_SIZE))
}

// 제목·안내 문구·목록은 모드가 정합니다 (game/modes/ 참고)
function PlanetGuide({ mode, maxStage = -1, onShowRuler }) {
  return (
    <aside className="card planet-guide">
      <h2 className="guide-title">{mode.guide.title}</h2>
      <p className="guide-hint">{mode.guide.hint}</p>
      <p className="guide-note">{mode.guide.note}</p>
      <ol className="guide-list">
        {mode.stages.map((stage, index) => {
          const size = displaySize(mode.stages, stage.radius)
          const found = index <= maxStage
          return (
            <li
              key={stage.id}
              className={`guide-item${found ? ' is-found' : ''}`}
            >
              <span className="guide-num">{index + 1}</span>
              <span className="guide-icon">
                <img
                  src={mode.getSprite(stage.id)}
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

      {/* 마지막 단계의 특별 규칙 (예: 해왕성 2개 → 태양계 완성) */}
      {mode.guide.footer && <p className="guide-footer">{mode.guide.footer}</p>}

      {/* 거리 순서 게임에서만: 수업 정리용으로 언제든 실제 거리를 볼 수 있게 */}
      {mode.hasDistanceRuler && onShowRuler && (
        <button type="button" className="guide-ruler-btn" onClick={onShowRuler}>
          🔭 실제 거리 보기
        </button>
      )}
    </aside>
  )
}

export default PlanetGuide
