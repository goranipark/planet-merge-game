import { useState } from 'react'
import OrderQuiz from './OrderQuiz'

// 새로운 천체(궤도)를 처음 만들었을 때 뜨는 교육 카드
//
// 카드에 무엇을 보여줄지는 모드가 정합니다 (game/modes/ 의 card).
//   크기 순서 게임 → 실제 지름과 지구와의 크기 비교
//   거리 순서 게임 → 태양까지 거리와 지구와의 거리 비교
//
// 거리 순서 게임에서는 카드 내용을 보여주기 전에 순서 퀴즈를 한 번 냅니다.
// (quiz 가 없으면 곧바로 카드 내용이 나옵니다)
function InfoCard({ mode, stage, remaining, quiz, bonus, onCorrect, onClose }) {
  const def = mode.stages[stage]
  const card = mode.card
  // null = 아직 안 풀었음 / true = 맞힘 / false = 틀림
  const [correct, setCorrect] = useState(null)
  const 퀴즈먼저 = quiz && correct === null

  function handleAnswer(isCorrect) {
    setCorrect(isCorrect)
    if (isCorrect) onCorrect?.(bonus)
  }

  return (
    <div className="info-backdrop">
      <div className="info-card">
        {퀴즈먼저 ? (
          <OrderQuiz
            badge={card.badge}
            quiz={quiz}
            bonus={bonus}
            onAnswer={handleAnswer}
          />
        ) : (
          <>
            <div className="info-badge">{card.badge}</div>

            {correct !== null && (
              <p className={`quiz-result${correct ? ' is-correct' : ''}`}>
                {correct ? `정답이에요! +${bonus}점` : `아쉬워요. ${quiz.hint}`}
              </p>
            )}

            <img
              className="info-sprite"
              src={mode.getSprite(stage, 'happy')}
              alt={def.name}
              width={120}
              height={120}
            />
            <h2>{def.name}</h2>
            <p className="info-desc">{def.description}</p>

            <dl className="info-stats">
              {card.stats(def).map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>

            <p className="info-fact">
              <span className="info-fact-label">알고 있나요?</span>
              {def.fact}
            </p>

            {/* 오개념을 짚어 주는 문구가 있는 천체에만 표시 (예: 해왕성의 궤도 vs 크기) */}
            {def.sizeNote && <p className="info-warn">⚠️ {def.sizeNote}</p>}

            {/* 마지막 단계 카드에만: 둘을 합치면 사라진다는 것을 미리 알려 줍니다 */}
            {card.finalNote && stage === mode.stages.length - 1 && (
              <p className="info-final">🌟 {card.finalNote}</p>
            )}

            <button type="button" className="btn-primary" onClick={onClose}>
              알겠어요!
            </button>
            {remaining > 0 && (
              <p className="info-remaining">새 카드가 {remaining}장 더 있어요</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default InfoCard
