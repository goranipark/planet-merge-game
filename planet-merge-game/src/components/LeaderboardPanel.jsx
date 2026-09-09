import { useCallback, useEffect, useState } from 'react'
import { PERIODS } from '../game/leaderboardConfig'
import { hasLeaderboard, formatRoomCode } from '../game/room'
import { fetchTopScores, isOnlineMode, pendingCount } from '../game/leaderboard'
import { nextResetText } from '../game/periods'

const MEDALS = ['🥇', '🥈', '🥉']

function LeaderboardPanel({
  gameMode,
  refreshKey,
  player,
  onChangePlayer,
  room,
  onChangeRoom,
}) {
  const [periodId, setPeriodId] = useState(PERIODS[0].id)
  const [rows, setRows] = useState([])
  const [mode, setMode] = useState(isOnlineMode ? 'online' : 'local')
  const [loading, setLoading] = useState(true)

  const 순위표씀 = hasLeaderboard(room)

  const load = useCallback(async () => {
    if (!순위표씀) return
    setLoading(true)
    const result = await fetchTopScores(periodId, room, gameMode.id)
    setRows(result.rows)
    setMode(result.mode)
    setLoading(false)
  }, [periodId, room, gameMode.id])

  useEffect(() => {
    if (!순위표씀) return
    let alive = true
    ;(async () => {
      const result = await fetchTopScores(periodId, room, gameMode.id)
      if (!alive) return
      setRows(result.rows)
      setMode(result.mode)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [periodId, room, gameMode.id, refreshKey])

  const waiting = pendingCount()

  // 혼자 연습 중 — 순위표 대신 학급 코드를 넣으라고 안내합니다
  if (!순위표씀) {
    return (
      <aside className="card leaderboard">
        <div className="lb-header">
          <h2 className="lb-title">혼자 연습 중</h2>
        </div>
        <p className="lb-empty">
          지금은 <strong>순위표에 올라가지 않아요.</strong>
          <br />
          우리 반 코드를 넣으면 친구들과 겨룰 수 있어요!
        </p>
        <div className="lb-footer">
          <button type="button" className="lb-player" onClick={onChangeRoom}>
            학급 코드 넣기
          </button>
          {player && (
            <button type="button" className="lb-player" onClick={onChangePlayer}>
              <strong>{player.nickname}</strong> 바꾸기
            </button>
          )}
        </div>
      </aside>
    )
  }

  return (
    <aside className="card leaderboard">
      <div className="lb-header">
        <h2 className="lb-title">우리 반 순위표</h2>
        <button
          type="button"
          className="lb-refresh"
          onClick={load}
          title="새로고침"
          aria-label="순위표 새로고침"
        >
          ↻
        </button>
      </div>

      <p className="lb-mode">
        <span aria-hidden="true">{gameMode.select.emoji}</span> {gameMode.name} 기록
      </p>

      <div className="lb-tabs" role="tablist">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === periodId}
            className={`lb-tab${p.id === periodId ? ' is-active' : ''}`}
            onClick={() => setPeriodId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="lb-empty">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="lb-empty">아직 기록이 없어요.
          <br />첫 번째 주인공이 되어보세요!</p>
      ) : (
        <ol className="lb-list">
          {rows.map((row, index) => (
            <li key={row.id} className={`lb-row${index === 0 ? ' is-top' : ''}`}>
              <span className="lb-rank">{MEDALS[index] ?? index + 1}</span>
              <span className="lb-who">
                <strong>{row.nickname}</strong>
                {row.stageReached && <em>{row.stageReached}까지</em>}
              </span>
              <span className="lb-score">{row.score.toLocaleString('ko-KR')}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="lb-footer">
        <p className="lb-note lb-reset">⏱ {nextResetText(periodId)}</p>
        {mode === 'local' && (
          <p className="lb-note">이 기기에만 저장되는 연습용 순위표예요.</p>
        )}
        {mode === 'offline' && (
          <p className="lb-note lb-warn">
            인터넷 연결이 없어 이 기기 기록만 보여요.
          </p>
        )}
        {waiting > 0 && (
          <p className="lb-note lb-warn">보내지 못한 기록 {waiting}개 (연결되면 자동 전송)</p>
        )}
        <p className="lb-room">
          학급 코드 <strong>{formatRoomCode(room)}</strong>
        </p>
        {player && (
          <button type="button" className="lb-player" onClick={onChangePlayer}>
            {player.nickname} <span>바꾸기</span>
          </button>
        )}
        <button type="button" className="lb-room-btn" onClick={onChangeRoom}>
          학급 코드 바꾸기
        </button>
      </div>
    </aside>
  )
}

export default LeaderboardPanel
