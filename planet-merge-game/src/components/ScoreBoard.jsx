function ScoreBoard({ score, best }) {
  return (
    <div className="card scoreboard">
      <div className="scoreboard-item">
        <span className="label">스코어</span>
        <span className="value">{score}</span>
      </div>
      <div className="scoreboard-divider" />
      <div className="scoreboard-item">
        <span className="label">최고 점수</span>
        <span className="value">{best}</span>
      </div>
    </div>
  )
}

export default ScoreBoard
