// 순서 퀴즈 (concept2.md 5-1)
//
// 거리 순서 게임은 "같은 것 둘을 찾기"만 해도 이길 수 있어서,
// 그냥 두면 학생이 수금지화목토천해를 모른 채 클리어할 수 있습니다.
// 그래서 새 궤도를 처음 만들었을 때 정보 카드를 보여주기 **전에** 순서를 한 번 묻습니다.
//
// 4학년 대상이라 틀려도 벌점은 없습니다. 정답을 알려주고 그대로 넘어갑니다.
// 맞히면 보너스 점수를 줍니다. (끄고 켜기: config.js 의 ORDER_QUIZ)
function OrderQuiz({ badge, quiz, bonus, onAnswer }) {
  return (
    <>
      <div className="info-badge">{badge}</div>
      <p className="quiz-question">{quiz.question}</p>

      <div className="quiz-options">
        {quiz.options.map((name) => (
          <button
            key={name}
            type="button"
            className="quiz-option"
            onClick={() => onAnswer(name === quiz.answer)}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="quiz-note">맞히면 보너스 {bonus}점! 틀려도 괜찮아요.</p>
    </>
  )
}

export default OrderQuiz
