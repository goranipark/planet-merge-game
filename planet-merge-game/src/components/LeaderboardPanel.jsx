import { useCallback, useEffect, useState } from 'react'
import { PERIODS, DEFAULT_ROOM } from '../game/leaderboardConfig'
import { fetchTopScores, isOnlineMode, pendingCount } from '../game/leaderboard'
import { nextResetText } from '../game/periods'

const MEDALS = ['🥇', '🥈', '🥉']

function LeaderboardPanel({
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

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchTopScores(periodId, room)
    setRows(result.rows)
    setMode(result.mode)
    setLoading(false)
  }, [periodId, room])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const result = await fetchTopScores(periodId, room)
      if (!alive) return
      setRows(result.rows)
      setMode(result.mode)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [periodId, room, refreshKey])

  const waiting = pendingCount()

  return (
    <aside className="card leaderboard">
      <div className="lb-header">
        <h2 className="lb-title">
          {room === DEFAULT_ROOM ? '순위표' : '우리 반 순위표'}
        </h2>
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
        {room !== DEFAULT_ROOM && (
          <p className="lb-room">
            학급 코드 <strong>{room}</strong>
          </p>
        )}
        {player && (
          <button type="button" className="lb-player" onClick={onChangePlayer}>
            {player.nickname} <span>바꾸기</span>
          </button>
        )}
        <button type="button" className="lb-room-btn" onClick={onChangeRoom}>
          {room === DEFAULT_ROOM ? '학급 순위표 만들기' : '학급 코드 바꾸기'}
        </button>
      </div>
    </aside>
  )
}

export default LeaderboardPanel
