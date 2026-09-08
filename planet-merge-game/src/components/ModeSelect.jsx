import { modeList, isLocked } from '../game/modes'
import { MAINTENANCE, MAINTENANCE_MESSAGE } from '../game/config'

// 게임 모드 고르기 (첫 화면)
// 아직 준비 중인 모드는 공사장 테이프로 막아 두고, 눌러도 시작되지 않습니다.
function ModeSelect({ current, onSelect, onCancel }) {
  const modes = modeList()

  return (
    <div className="setup-backdrop">
      <div className="setup-card mode-card">
        <h2>{MAINTENANCE ? MAINTENANCE_MESSAGE.title : '어떤 게임을 할까요?'}</h2>
        <p className="setup-desc">
          {MAINTENANCE ? (
            MAINTENANCE_MESSAGE.body
          ) : (
            <>
              두 게임은 <strong>순서가 서로 달라요.</strong> 하나씩 해보고 무엇이
              다른지 찾아보세요.
            </>
          )}
        </p>

        <div className="mode-choices">
          {modes.map((mode) => {
            const locked = isLocked(mode)
            const isCurrent = mode.id === current
            return (
              <button
                key={mode.id}
                type="button"
                className={
                  'mode-choice' +
                  (locked ? ' is-locked' : '') +
                  (isCurrent ? ' is-current' : '')
                }
                disabled={locked}
                aria-disabled={locked}
                onClick={() => !locked && onSelect(mode.id)}
              >
                <span className="mode-emoji" aria-hidden="true">
                  {mode.select.emoji}
                </span>
                <strong className="mode-name">{mode.name}</strong>
                <span className="mode-tagline">{mode.select.tagline}</span>
                <span className="mode-lines">
                  {mode.select.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                <span className="mode-footnote">{mode.select.footnote}</span>

                {locked && (
                  <span className="mode-tape">
                    <span className="mode-tape-text">
                      🚧 {MAINTENANCE ? '준비 중' : '공사 중'} 🚧
                    </span>
                    <span className="mode-tape-sub">
                      {MAINTENANCE ? '곧 열어드릴게요' : '만드는 중이에요'}
                    </span>
                  </span>
                )}
                {isCurrent && !locked && (
                  <span className="mode-current-badge">지금 하는 중</span>
                )}
              </button>
            )
          })}
        </div>

        {onCancel && (
          <div className="setup-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModeSelect
