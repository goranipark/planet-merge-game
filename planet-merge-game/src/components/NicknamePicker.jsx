import { useState } from 'react'
import { generateChoices } from '../game/nicknames'
import { ALLOW_CUSTOM_NICKNAME, NICKNAME_MAX } from '../game/leaderboardConfig'

// 별명 고르기 (Data.md 4장: 개인정보 대신 별명 사용)
// 기본은 "고르기" 방식이라 학생이 이상한 말을 적을 수 없습니다.
function NicknamePicker({ initial, onSave, onCancel }) {
  const [choices, setChoices] = useState(() => generateChoices(6))
  const [selected, setSelected] = useState(initial?.nickname ?? null)
  const [custom, setCustom] = useState('')

  function reroll() {
    const next = generateChoices(6)
    setChoices(next)
    if (!next.includes(selected)) setSelected(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const value = ALLOW_CUSTOM_NICKNAME && custom.trim() ? custom.trim() : selected
    if (!value) return
    onSave({ nickname: value.slice(0, NICKNAME_MAX) })
  }

  return (
    <div className="setup-backdrop">
      <form className="setup-card" onSubmit={handleSubmit}>
        <h2>별명을 골라요!</h2>
        <p className="setup-desc">
          마음에 드는 별명을 하나 고르면 점수가 순위표에 올라가요.
        </p>

        <div className="nick-choices">
          {choices.map((name) => (
            <button
              key={name}
              type="button"
              className={`nick-chip${name === selected ? ' is-selected' : ''}`}
              onClick={() => setSelected(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <button type="button" className="nick-reroll" onClick={reroll}>
          🎲 다른 별명 보기
        </button>

        {ALLOW_CUSTOM_NICKNAME && (
          <label className="setup-field nick-custom">
            <span>직접 쓰기 ({NICKNAME_MAX}글자까지)</span>
            <input
              type="text"
              value={custom}
              maxLength={NICKNAME_MAX}
              placeholder="비워두면 위에서 고른 별명"
              onChange={(e) => setCustom(e.target.value)}
            />
          </label>
        )}

        <p className="setup-warning">
          이름·학번 같은 <strong>개인정보는 저장하지 않아요.</strong> 별명만 순위표에
          올라가요.
        </p>

        <div className="setup-actions">
          {onCancel && (
            <button type="button" className="btn-ghost" onClick={onCancel}>
              취소
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={!selected && !(ALLOW_CUSTOM_NICKNAME && custom.trim())}
          >
            시작하기
          </button>
        </div>
      </form>
    </div>
  )
}

export default NicknamePicker
