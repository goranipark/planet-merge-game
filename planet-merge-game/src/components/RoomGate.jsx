import { useState } from 'react'
import { ROOM_MAX } from '../game/leaderboardConfig'
import {
  PRACTICE,
  sanitizeRoom,
  generateRoomCode,
  formatRoomCode,
  roomLink,
} from '../game/room'

// 학급 코드 화면 (모드를 고른 다음, 별명을 고르기 전)
//
// 세 갈래입니다.
//   학생  → 칠판에 적힌 코드를 입력  (선생님이 링크를 줬다면 이 화면은 아예 안 뜸)
//   교사  → "새 학급 만들기"로 코드를 발급받아 학생에게 링크·코드 배부
//   구경  → "혼자 연습하기" (순위표 없이 바로 플레이)
function RoomGate({ modeId, onEnter, onCancel }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [made, setMade] = useState(null) // 방금 발급한 코드
  const [copied, setCopied] = useState('')

  function handleJoin(event) {
    event.preventDefault()
    const code = sanitizeRoom(value)
    if (!code) {
      setError('칠판에 적힌 코드를 그대로 적어 주세요. (2글자 이상)')
      return
    }
    onEnter(code)
  }

  function makeCode() {
    setMade(generateRoomCode())
    setError('')
  }

  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setError('복사가 안 되면 화면의 글자를 직접 선택해 복사해 주세요.')
    }
  }

  // ---------- 코드를 발급한 뒤 화면 (선생님용) ----------
  if (made) {
    const link = roomLink(made, modeId)
    return (
      <div className="setup-backdrop">
        <div className="setup-card room-card">
          <h2>우리 반 코드가 만들어졌어요</h2>

          <div className="room-code-big">{formatRoomCode(made)}</div>
          <p className="setup-desc">
            이 코드를 <strong>칠판에 적어</strong> 주세요. 학생들이 이 코드를 넣으면
            우리 반끼리만 순위를 겨룹니다.
          </p>

          <div className="room-link-box">
            <span className="room-link-label">코드를 안 쳐도 되는 링크</span>
            <code className="room-link">{link}</code>
            <button
              type="button"
              className="btn-ghost room-copy"
              onClick={() => copy(link, 'link')}
            >
              {copied === 'link' ? '복사됨!' : '링크 복사'}
            </button>
          </div>

          <p className="setup-warning">
            <strong>코드를 꼭 적어 두세요.</strong> 이 코드로 들어와야 같은 순위표를 씁니다.
            (같은 기기에서는 기억되지만, 다른 기기에서는 다시 넣어야 합니다)
          </p>

          {error && <p className="setup-error">{error}</p>}

          <div className="setup-actions">
            <button type="button" className="btn-ghost" onClick={() => setMade(null)}>
              뒤로
            </button>
            <button type="button" className="btn-primary" onClick={() => onEnter(made)}>
              이 코드로 시작하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- 기본 화면 ----------
  return (
    <div className="setup-backdrop">
      <form className="setup-card room-card" onSubmit={handleJoin}>
        <h2>우리 반 코드를 넣어요</h2>
        <p className="setup-desc">
          같은 코드를 넣은 친구들끼리만 순위를 겨뤄요.
        </p>

        <label className="setup-field room-code-field">
          <span>학급 코드</span>
          <input
            type="text"
            value={value}
            maxLength={ROOM_MAX}
            placeholder="예: K7M 2XQ"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
          />
        </label>

        {error && <p className="setup-error">{error}</p>}

        <button type="submit" className="btn-primary room-join">
          들어가기
        </button>

        <div className="room-divider">
          <span>선생님이신가요?</span>
        </div>

        <button type="button" className="btn-ghost room-make" onClick={makeCode}>
          ➕ 새 학급 만들기
        </button>

        <button
          type="button"
          className="room-practice"
          onClick={() => onEnter(PRACTICE)}
        >
          코드 없이 <strong>혼자 연습하기</strong>
          <em>순위표에는 올라가지 않아요</em>
        </button>

        {onCancel && (
          <div className="setup-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              뒤로
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default RoomGate
