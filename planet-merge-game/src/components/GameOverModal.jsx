const SUBMIT_MESSAGE = {
  submitting: '순위표에 올리는 중…',
  saved: '순위표에 등록했어요!',
  queued: '인터넷이 불안정해요. 연결되면 자동으로 올릴게요.',
  rejected: '순위표에 올리지 못했어요.',
  skipped: '반과 별명을 정하면 순위표에 올릴 수 있어요.',
}

function GameOverModal({ score, best, onRestart, submitState }) {
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
        {submitState && (
          <p className={`game-over-submit is-${submitState}`}>
            {SUBMIT_MESSAGE[submitState]}
          </p>
        )}

        <button type="button" className="btn-primary" onClick={onRestart}>
          다시 시작
        </button>
      </div>
    </div>
  )
}

export default GameOverModal
