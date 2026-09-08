import { useState } from 'react'
import { ORBITS } from '../game/orbits'

// 엔딩 거리자 (concept2.md 9장)
//
// 게임 안에서는 궤도가 고르게 커지지만, 실제 태양계는 전혀 그렇지 않습니다.
// 수성·금성·지구·화성은 맨 왼쪽 5% 안에 몰려 있고 해왕성만 저 멀리 있습니다.
// **안쪽 네 행성이 뭉개져 보이는 것이 이 화면의 요점**입니다.
// 교과서 그림이 좁혀 그린 것이라는 사실을 눈으로 보여 줍니다.

const 빛속도 = 299792 // km/s

function 빛도달시간(km) {
  const 초 = km / 빛속도
  if (초 < 3600) {
    const 분 = Math.floor(초 / 60)
    const 나머지 = Math.round(초 % 60)
    return `${분}분 ${나머지}초`
  }
  const 시간 = Math.floor(초 / 3600)
  const 분 = Math.round((초 % 3600) / 60)
  return `${시간}시간 ${분}분`
}

function 억만km(km) {
  const 억 = Math.floor(km / 100_000_000)
  const 만 = Math.round((km % 100_000_000) / 10_000)
  if (억 === 0) return `${만.toLocaleString('ko-KR')}만 km`
  return 만 === 0 ? `${억}억 km` : `${억}억 ${만.toLocaleString('ko-KR')}만 km`
}

function DistanceRuler({ onClose }) {
  // 'all' = 태양~해왕성 전체 / 'inner' = 안쪽 네 행성만 확대
  const [zoom, setZoom] = useState('all')

  const 전체 = zoom === 'all'
  const 보여줄행성 = 전체 ? ORBITS : ORBITS.slice(0, 4)
  const 최대AU = 보여줄행성[보여줄행성.length - 1].au
  const 지구 = ORBITS[2]
  const 해왕성 = ORBITS[7]

  // 자의 양 끝에 여백을 조금 두고 배치
  const 위치 = (au) => 6 + (au / 최대AU) * 88

  // 전체 보기에서는 안쪽 네 행성이 한 점에 뭉쳐서 이름표가 겹칩니다.
  // "몰려 있다"는 것이 이 화면의 요점이므로 점은 그대로 두고,
  // 이름은 하나로 묶어 표시합니다. 하나씩 보려면 확대 탭을 쓰면 됩니다.
  const 뭉친행성 = 전체 ? ORBITS.filter((o) => o.au < 2) : []
  const 개별행성 = 전체 ? ORBITS.filter((o) => o.au >= 2) : 보여줄행성

  return (
    <div className="setup-backdrop">
      <div className="setup-card ruler-card">
        <h2>태양계는 얼마나 넓을까?</h2>
        <p className="setup-desc">
          게임에서는 궤도가 고르게 커졌지만, <strong>실제 거리는 이렇게 띄엄띄엄</strong>해요.
          교과서 그림은 좁혀서 그린 거예요.
        </p>

        <div className="ruler-tabs">
          <button
            type="button"
            className={`ruler-tab${전체 ? ' is-on' : ''}`}
            onClick={() => setZoom('all')}
          >
            태양 ~ 해왕성 전체
          </button>
          <button
            type="button"
            className={`ruler-tab${전체 ? '' : ' is-on'}`}
            onClick={() => setZoom('inner')}
          >
            안쪽 네 행성 확대
          </button>
        </div>

        <div className="ruler">
          <div className="ruler-line" />
          <div className="ruler-sun" title="태양">
            ☀
          </div>

          {/* 뭉쳐 있는 안쪽 네 행성: 점만 찍고 이름은 하나로 묶어 표시 */}
          {뭉친행성.map((o) => (
            <div
              key={o.id}
              className="ruler-mark is-down is-crowded"
              style={{ left: `${위치(o.au)}%` }}
            >
              <span className="ruler-dot" style={{ background: o.color }} />
            </div>
          ))}
          {뭉친행성.length > 0 && (
            <div
              className="ruler-cluster"
              style={{ left: `${위치(뭉친행성[뭉친행성.length - 1].au)}%` }}
            >
              <span className="ruler-cluster-brace" />
              <span className="ruler-cluster-name">
                수·금·지·화
                <em>네 개가 여기 다 들어 있어요</em>
              </span>
            </div>
          )}

          {개별행성.map((o, i) => (
            <div
              key={o.id}
              className={`ruler-mark${i % 2 === 0 ? ' is-up' : ' is-down'}`}
              style={{ left: `${위치(o.au)}%` }}
            >
              <span className="ruler-tick" style={{ background: o.color }} />
              <span className="ruler-dot" style={{ background: o.color }} />
              <span className="ruler-name">{o.name}</span>
            </div>
          ))}

          <div className="ruler-end">{억만km(보여줄행성[보여줄행성.length - 1].distanceKm)}</div>
        </div>

        {전체 ? (
          <p className="ruler-point">
            수성·금성·지구·화성은 <strong>전부 왼쪽 끝에 몰려</strong> 있어요.
            해왕성 하나가 나머지 전부보다 멀리 있어요.
          </p>
        ) : (
          <p className="ruler-point">
            이만큼 벌어져 보이지만, 이 넷을 다 합쳐도 <strong>해왕성까지 거리의 20분의 1</strong>이에요.
          </p>
        )}

        <dl className="ruler-light">
          <div>
            <dt>태양 → 지구</dt>
            <dd>빛으로 {빛도달시간(지구.distanceKm)}</dd>
          </div>
          <div>
            <dt>태양 → 해왕성</dt>
            <dd>빛으로 {빛도달시간(해왕성.distanceKm)}</dd>
          </div>
        </dl>

        <p className="info-fact ruler-pluto">
          <span className="info-fact-label">명왕성은 왜 빠졌을까요?</span>
          1930년에 발견되어 아홉 번째 행성으로 불렸어요. 그런데 명왕성처럼 생긴 천체가
          그 바깥에서 여럿 발견되면서, 2006년에 행성의 조건을 다시 정했어요.
          지금은 행성이 아니라 <strong>왜소행성</strong>으로 부른답니다.
        </p>

        <div className="setup-actions">
          <button type="button" className="btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default DistanceRuler
