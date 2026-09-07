import { useEffect, useRef, useState } from 'react'
import { createGame } from './game/engine'
import { createAudioManager } from './game/audio'
import { loadBestScore, saveBestScore } from './game/storage'
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from './game/config'
import { STAGES } from './game/objects'
import { loadPlayer, savePlayer } from './game/playerStorage'
import { submitScore, flushPending } from './game/leaderboard'
import { initRoom, saveRoom } from './game/room'
import SpaceBackground from './components/SpaceBackground'
import ScoreBoard from './components/ScoreBoard'
import NextPreview from './components/NextPreview'
import GameOverModal from './components/GameOverModal'
import MuteButton from './components/MuteButton'
import InfoCard from './components/InfoCard'
import PlanetGuide from './components/PlanetGuide'
import LeaderboardPanel from './components/LeaderboardPanel'
import NicknamePicker from './components/NicknamePicker'
import RoomSetup from './components/RoomSetup'
import SiteFooter from './components/SiteFooter'
import './App.css'

function App() {
  const containerRef = useRef(null)
  const scoreRef = useRef(0)
  const audioRef = useRef(null)
  const gameRef = useRef(null)
  // 한 번 본 천체 카드는 다시 안 띄움 (페이지를 새로고침하면 초기화)
  const seenStagesRef = useRef(new Set())
  const maxStageRef = useRef(-1)
  const playerRef = useRef(null)
  const roomRef = useRef(null)

  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => loadBestScore())
  const [nextStage, setNextStage] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cardQueue, setCardQueue] = useState([]) // 순서대로 보여줄 정보 카드(단계 번호)
  const [maxStage, setMaxStage] = useState(-1) // 이번 판에서 만들어 본 가장 큰 천체
  const [player, setPlayer] = useState(() => loadPlayer())
  const [showSetup, setShowSetup] = useState(() => loadPlayer() === null)
  const [submitState, setSubmitState] = useState(null)
  const [lbRefreshKey, setLbRefreshKey] = useState(0)
  const [room, setRoom] = useState(() => initRoom())
  const [showRoomSetup, setShowRoomSetup] = useState(false)

  playerRef.current = player
  roomRef.current = room

  // 오디오 매니저는 앱 전체에서 하나만 사용
  if (!audioRef.current) {
    audioRef.current = createAudioManager()
  }

  useEffect(() => {
    return () => audioRef.current?.dispose()
  }, [])

  // 지난번에 인터넷 문제로 못 보낸 기록이 있으면 시작할 때 다시 전송
  useEffect(() => {
    flushPending()
      .then((sent) => {
        if (sent > 0) setLbRefreshKey((k) => k + 1)
      })
      .catch(() => {})
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
    maxStageRef.current = -1
    setScore(0)
    setIsGameOver(false)
    setCardQueue([])
    setMaxStage(-1)
    setSubmitState(null)

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
        maxStageRef.current = Math.max(maxStageRef.current, stage)
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
        handleGameOverSubmit()
      },
    })
    gameRef.current = game

    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [gameKey])

  // 게임이 끝나면 점수를 순위표에 등록 (반·별명을 정한 경우에만)
  async function handleGameOverSubmit() {
    const currentPlayer = playerRef.current
    if (!currentPlayer) {
      setSubmitState('skipped')
      return
    }
    if (scoreRef.current <= 0) {
      setSubmitState(null)
      return
    }

    setSubmitState('submitting')
    const stageName =
      maxStageRef.current >= 0 ? STAGES[maxStageRef.current].name : '소행성'
    const result = await submitScore({
      nickname: currentPlayer.nickname,
      score: scoreRef.current,
      stageReached: stageName,
      room: roomRef.current,
    })
    setSubmitState(result.status)
    setLbRefreshKey((k) => k + 1)
  }

  function handleSaveRoom(nextRoom) {
    saveRoom(nextRoom)
    setRoom(nextRoom)
    setShowRoomSetup(false)
    setLbRefreshKey((k) => k + 1)
  }

  function handleSavePlayer(next) {
    savePlayer(next)
    setPlayer(next)
    setShowSetup(false)
  }

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
            style={{
              // 병 크기는 화면 가로폭과 세로높이 중 더 빠듯한 쪽에 맞춰 CSS에서 계산합니다.
              // (크롬북처럼 세로가 짧은 화면에서 병 위아래가 잘리지 않도록)
              '--jar-max-w': `${CONTAINER_WIDTH}px`,
              '--jar-ratio': String(CONTAINER_WIDTH / CONTAINER_HEIGHT),
            }}
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
                submitState={submitState}
                onRestart={() => setGameKey((k) => k + 1)}
              />
            )}
          </div>

          <LeaderboardPanel
            refreshKey={lbRefreshKey}
            player={player}
            onChangePlayer={() => setShowSetup(true)}
            room={room}
            onChangeRoom={() => setShowRoomSetup(true)}
          />
        </div>

        <SiteFooter />
      </div>

      {showSetup && (
        <NicknamePicker
          initial={player}
          onSave={handleSavePlayer}
          onCancel={player ? () => setShowSetup(false) : null}
        />
      )}

      {showRoomSetup && (
        <RoomSetup
          room={room}
          onSave={handleSaveRoom}
          onClose={() => setShowRoomSetup(false)}
        />
      )}
    </>
  )
}

export default App
