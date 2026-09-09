import { NOTICE } from '../game/notice'

// 첫 화면 안내 팝업 (game/notice.js 에서 내용을 고칩니다)
// 한 번 확인하면 그 기기에서는 다시 뜨지 않습니다.
function NoticePopup({ onClose }) {
  return (
    <div className="setup-backdrop">
      <div className="setup-card notice-card">
        <div className="info-badge">📢 알림</div>
        <h2>{NOTICE.title}</h2>

        <ul className="notice-list">
          {NOTICE.items.map((item) => (
            <li key={item.title}>
              <span className="notice-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="notice-text">
                <strong>{item.title}</strong>
                <em>{item.body}</em>
              </span>
            </li>
          ))}
        </ul>

        {NOTICE.teacher && <p className="notice-teacher">{NOTICE.teacher}</p>}
        {NOTICE.student && <p className="notice-student">{NOTICE.student}</p>}

        <button type="button" className="btn-primary notice-ok" onClick={onClose}>
          확인했어요
        </button>
      </div>
    </div>
  )
}

export default NoticePopup
