import { useState } from 'react'
import { DEFAULT_ROOM, ROOM_MAX } from '../game/leaderboardConfig'
import { sanitizeRoom, roomLink } from '../game/room'

// 학급 코드 설정 (선생님용)
// 코드를 정하면 그 반 학생들끼리만 순위가 집계됩니다.
function RoomSetup({ room, onSave, onClose }) {
  const [value, setValue] = useState(room === DEFAULT_ROOM ? '' : room)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const preview = sanitizeRoom(value)
  const link = roomLink(preview || DEFAULT_ROOM)

  function handleSubmit(event) {
    event.preventDefault()
    if (!value.trim()) {
      onSave(DEFAULT_ROOM) // 비우면 전체 순위표로
      return
    }
    if (!preview) {
      setError('영문 소문자·숫자·하이픈으로 2글자 이상 적어 주세요.')
      return
    }
    onSave(preview)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('복사가 안 되면 아래 주소를 직접 선택해 복사해 주세요.')
    }
  }

  return (
    <div className="setup-backdrop">
      <form className="setup-card room-card" onSubmit={handleSubmit}>
        <h2>학급 순위표</h2>
        <p className="setup-desc">
          학급 코드를 정하면 <strong>그 코드를 가진 학생들끼리만</strong> 순위를 겨룹니다.
        </p>

        <label className="setup-field">
          <span>학급 코드 (영문 소문자·숫자·하이픈)</span>
          <input
            type="text"
            value={value}
            maxLength={ROOM_MAX}
            placeholder="예: haneul-4-2"
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
          />
        </label>

        <p className="setup-warning">
          다른 학교와 겹치지 않도록 <strong>학교 이름을 넣어</strong> 만들어 주세요.
          (예: <code>haneul-4-2</code>) 코드가 같으면 다른 학교와 순위표를 함께 쓰게 됩니다.
        </p>

        <div className="room-link-box">
          <span className="room-link-label">
            {preview ? '학생에게 나눠줄 링크' : '전체(공개) 순위표 링크'}
          </span>
          <code className="room-link">{link}</code>
          <button type="button" className="btn-ghost room-copy" onClick={copyLink}>
            {copied ? '복사됨!' : '링크 복사'}
          </button>
        </div>

        <p className="room-note">
          이 링크로 접속한 학생은 코드가 자동으로 적용됩니다.
          {room !== DEFAULT_ROOM && ' 코드를 지우고 저장하면 전체 순위표로 돌아갑니다.'}
        </p>

        {error && <p className="setup-error">{error}</p>}

        <div className="setup-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            닫기
          </button>
          <button type="submit" className="btn-primary">
            저장
          </button>
        </div>
      </form>
    </div>
  )
}

export default RoomSetup
