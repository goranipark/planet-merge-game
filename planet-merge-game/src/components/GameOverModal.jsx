function GameOverModal({ score, best, onRestart }) {
  return (
    <div className="game-over-backdrop">
      <div className="game-over-modal">
        <div className="game-over-emoji" aria-hidden="true">
          🪐
        </div>
        <h2>게임 오버</h2>
        <div className="game-over-scores">
          <div>
            <span className="label">당신의 점수</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span className="label">최고의 점수</span>
            <strong>{best}</strong>
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={onRestart}>
          다시 시작
        </button>
      </div>
    </div>
  )
}

export default GameOverModal
