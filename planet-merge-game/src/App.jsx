import { useEffect, useRef, useState } from 'react'
import { createGame } from './game/engine'
import { createAudioManager } from './game/audio'
import {
  loadBestScore,
  saveBestScore,
  loadSeenStages,
  saveSeenStages,
} from './game/storage'
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from './game/config'
import { getMode, DEFAULT_MODE_ID } from './game/modes'
import { initMode, saveMode } from './game/modeStorage'
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
import ModeSelect from './components/ModeSelect'
import SiteFooter from './components/SiteFooter'
import './App.css'

function App() {
  const containerRef = useRef(null)
  const scoreRef = useRef(0)
  const audioRef = useRef(null)
  const gameRef = useRef(null)
  // 한 번 본 천체 카드는 다시 안 띄움
  // (같은 탭에서는 새로고침해도 유지되고, 탭을 닫으면 초기화 — config.js RESET_ON_TAB_CLOSE)
  const seenStagesRef = useRef(loadSeenStages())
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
  // 고른 모드(없으면 null → 모드 선택 창이 뜸). 뒤에서 도는 게임은 기본 모드로 돌아갑니다.
  const [modeId, setModeId] = useState(() => initMode())
  const [showModeSelect, setShowModeSelect] = useState(() => initMode() === null)
  const [cleared, setCleared] = useState(false) // 마지막 단계까지 만들었는지
  const mode = getMode(modeId ?? DEFAULT_MODE_ID)

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
    setCleared(false)

    const audio = audioRef.current
    const game = createGame(containerRef.current, {
      mode,
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
        // 마지막 단계(태양 / 해왕성 궤도)를 만들면 완성
        if (stage === mode.stages.length - 1) setCleared(true)
        // 처음 만든 천체면 게임을 멈추고 정보 카드 표시
        if (seenStagesRef.current.has(stage)) return
        seenStagesRef.current.add(stage)
        saveSeenStages(seenStagesRef.current)
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
    // mode 가 바뀌면(모드 전환) 게임을 새로 만듭니다
  }, [gameKey, mode])

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
      maxStageRef.current >= 0
        ? mode.stages[maxStageRef.current].name
        : mode.stages[0].name
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

  function handleSelectMode(nextId) {
    saveMode(nextId)
    setShowModeSelect(false)
    if (nextId === modeId) return
    setModeId(nextId)
    setGameKey((k) => k + 1) // 모드가 바뀌면 새 판으로 시작
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
          <button
            type="button"
            className="mode-chip"
            onClick={() => setShowModeSelect(true)}
          >
            <span aria-hidden="true">{mode.select.emoji}</span> {mode.name}
            <span className="mode-chip-action">바꾸기</span>
          </button>
        </header>

        {cleared && (
          <div className="clear-banner">
            <span>🎉 {mode.stages[mode.stages.length - 1].name}까지 만들었어요! 완성!</span>
            <button type="button" onClick={() => setCleared(false)} aria-label="닫기">
              ×
            </button>
          </div>
        )}

        <div className="hud">
          <ScoreBoard score={score} best={best} />
          <NextPreview mode={mode} stage={nextStage} />
          <MuteButton muted={muted} onToggle={toggleMute} />
        </div>

        <div className="play-area">
          <PlanetGuide mode={mode} maxStage={maxStage} />

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
                mode={mode}
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

      {showModeSelect && (
        <ModeSelect
          current={modeId}
          onSelect={handleSelectMode}
          onCancel={modeId ? () => setShowModeSelect(false) : null}
        />
      )}

      {/* 모드를 먼저 고르고, 그다음에 별명을 고릅니다 */}
      {showSetup && !showModeSelect && (
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
