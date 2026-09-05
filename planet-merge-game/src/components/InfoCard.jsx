import { STAGES } from '../game/objects'
import { getSprite } from '../game/sprites'

const EARTH_KM = STAGES[5].diameterKm

// 지구와 크기 비교 문구
function compareToEarth(diameterKm) {
  const ratio = diameterKm / EARTH_KM
  if (Math.abs(ratio - 1) < 0.01) return '우리가 사는 지구예요'
  if (ratio > 1) {
    const n = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10
    return `지구보다 약 ${n}배 커요`
  }
  if (ratio >= 0.1) return `지구의 약 ${Math.round(ratio * 10) / 10}배 크기예요`
  return `지구의 약 ${Math.round(1 / ratio)}분의 1 크기예요`
}

function InfoCard({ stage, remaining, onClose }) {
  const def = STAGES[stage]

  return (
    <div className="info-backdrop">
      <div className="info-card">
        <div className="info-badge">✨ 새로운 천체 발견!</div>
        <img
          className="info-sprite"
          src={getSprite(stage, 'happy')}
          alt={def.name}
          width={120}
          height={120}
        />
        <h2>{def.name}</h2>
        <p className="info-desc">{def.description}</p>

        <dl className="info-stats">
          <div>
            <dt>실제 지름</dt>
            <dd>약 {def.diameterKm.toLocaleString('ko-KR')} km</dd>
          </div>
          <div>
            <dt>크기 비교</dt>
            <dd>{compareToEarth(def.diameterKm)}</dd>
          </div>
        </dl>

        <p className="info-fact">
          <span className="info-fact-label">알고 있나요?</span>
          {def.fact}
        </p>

        <button type="button" className="btn-primary" onClick={onClose}>
          알겠어요!
        </button>
        {remaining > 0 && (
          <p className="info-remaining">새 천체 카드가 {remaining}장 더 있어요</p>
        )}
      </div>
    </div>
  )
}

export default InfoCard
