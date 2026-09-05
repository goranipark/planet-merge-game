import { useEffect, useRef, useState } from 'react'
import { createGame } from './game/engine'
import { createAudioManager } from './game/audio'
import { loadBestScore, saveBestScore } from './game/storage'
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from './game/config'
import SpaceBackground from './components/SpaceBackground'
import ScoreBoard from './components/ScoreBoard'
import NextPreview from './components/NextPreview'
import GameOverModal from './components/GameOverModal'
import MuteButton from './components/MuteButton'
import InfoCard from './components/InfoCard'
import PlanetGuide from './components/PlanetGuide'
import './App.css'

function App() {
  const containerRef = useRef(null)
  const scoreRef = useRef(0)
  const audioRef = useRef(null)
  const gameRef = useRef(null)
  // 한 번 본 천체 카드는 다시 안 띄움 (페이지를 새로고침하면 초기화)
  const seenStagesRef = useRef(new Set())

  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadBestScore())
  const [nextStage, setNextStage] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cardQueue, setCardQueue] = useState([]) // 순서대로 보여줄 정보 카드(단계 번호)
  const [maxStage, setMaxStage] = useState(-1) // 이번 판에서 만들어 본 가장 큰 천체

  // 오디오 매니저는 앱 전체에서 하나만 사용
  if (!audioRef.current) {
    audioRef.current = createAudioManager()
  }

  useEffect(() => {
    return () => audioRef.current?.dispose()
  }, [])

  // 브라우저 정책: 사용자가 첫 클릭/터치를 한 뒤에야 소리를 낼 수 있음 → 그때 BGM 시작
  useEffect(() => {
    const audio = audioRef.current
    function unlockAndStart() {
      audio.unlock()
      audio.startBgm()
      window.removeEventListener('pointerdown', unlockAndStart)
      window.removeEventListener('keydown', unlockAndStart)
    }
    window.addEventListener('pointerdown', unlockAndStart)
    window.addEventListener('keydown', unlockAndStart)
    return () => {
      window.removeEventListener('pointerdown', unlockAndStart)
      window.removeEventListener('keydown', unlockAndStart)
    }
  }, [])

  useEffect(() => {
    scoreRef.current = 0
    setScore(0)
    setIsGameOver(false)
    setCardQueue([])
    setMaxStage(-1)

    const audio = audioRef.current
    const game = createGame(containerRef.current, {
      onScoreChange: (delta) => {
        scoreRef.current += delta
        setScore(scoreRef.current)
        // 최고 기록을 넘는 순간 바로 갱신 + 브라우저에 저장
        setBest((prevBest) => {
          if (scoreRef.current <= prevBest) return prevBest
          saveBestScore(scoreRef.current)
          return scoreRef.current
        })
      },
      onNextChange: (stage) => setNextStage(stage),
      onSfx: (name, detail) => audio.play(name, detail),
      onMerge: (stage) => {
        setMaxStage((prev) => Math.max(prev, stage))
        // 처음 만든 천체면 게임을 멈추고 정보 카드 표시
        if (seenStagesRef.current.has(stage)) return
        seenStagesRef.current.add(stage)
        setCardQueue((q) => [...q, stage])
        game.pause()
      },
      onGameOver: () => {
        audio.play('gameover')
        setIsGameOver(true)
      },
    })
    gameRef.current = game

    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [gameKey])

  function closeCard() {
    const rest = cardQueue.slice(1)
    setCardQueue(rest)
    if (rest.length === 0) gameRef.current?.resume()
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    audioRef.current.setMuted(next)
  }

  return (
    <>
      <SpaceBackground />
      <div id="game-page">
        <header className="title-area">
          <h1>🌟 행성 합치기 게임</h1>
          <p>마우스로 위치를 정하고 클릭하면 천체가 떨어져요. 같은 천체 둘이 만나면 더 큰 천체로 변신!</p>
        </header>

        <div className="hud">
          <ScoreBoard score={score} best={best} />
          <NextPreview stage={nextStage} />
          <MuteButton muted={muted} onToggle={toggleMute} />
        </div>

        <div className="play-area">
          <PlanetGuide maxStage={maxStage} />

          <div
            id="game-container-wrapper"
            className="jar"
            style={{ width: `min(${CONTAINER_WIDTH}px, 100%)` }}
          >
            <div
              ref={containerRef}
              id="game-container"
              style={{ aspectRatio: `${CONTAINER_WIDTH} / ${CONTAINER_HEIGHT}` }}
            />
            {cardQueue.length > 0 && (
              <InfoCard
                key={cardQueue[0]}
                stage={cardQueue[0]}
                remaining={cardQueue.length - 1}
                onClose={closeCard}
              />
            )}
            {isGameOver && (
              <GameOverModal
                score={score}
                best={best}
                onRestart={() => setGameKey((k) => k + 1)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
