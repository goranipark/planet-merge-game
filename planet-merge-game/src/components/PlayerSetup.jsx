import { useState } from 'react'
import { CLASS_LIST, NICKNAME_MAX } from '../game/leaderboardConfig'

// 게임 시작 전 "반 + 별명" 입력 (Data.md 4장: 실명 대신 별명 사용)
function PlayerSetup({ initial, onSave, onCancel }) {
  const [className, setClassName] = useState(initial?.className ?? CLASS_LIST[0])
  const [nickname, setNickname] = useState(initial?.nickname ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const clean = nickname.trim().slice(0, NICKNAME_MAX)
    if (!clean) {
      setError('별명을 입력해 주세요.')
      return
    }
    onSave({ className, nickname: clean })
  }

  return (
    <div className="setup-backdrop">
      <form className="setup-card" onSubmit={handleSubmit}>
        <h2>기록을 남겨볼까요?</h2>
        <p className="setup-desc">
          반과 별명을 정하면 점수가 반 순위표에 올라가요.
        </p>

        <label className="setup-field">
          <span>우리 반</span>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            {CLASS_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="setup-field">
          <span>별명 ({NICKNAME_MAX}글자까지)</span>
          <input
            type="text"
            value={nickname}
            maxLength={NICKNAME_MAX}
            placeholder="예: 우주탐험가"
            onChange={(e) => {
              setNickname(e.target.value)
              setError('')
            }}
          />
        </label>

        <p className="setup-warning">
          이름·학번 같은 개인정보 대신 <strong>별명</strong>을 써 주세요.
        </p>

        {error && <p className="setup-error">{error}</p>}

        <div className="setup-actions">
          {onCancel && (
            <button type="button" className="btn-ghost" onClick={onCancel}>
              취소
            </button>
          )}
          <button type="submit" className="btn-primary">
            시작하기
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlayerSetup
