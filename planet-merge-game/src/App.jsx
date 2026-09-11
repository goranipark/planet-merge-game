import { useEffect, useRef, useState } from 'react'
import { createGame } from './game/engine'
import { createAudioManager } from './game/audio'
import {
  loadBestScore,
  saveBestScore,
  loadSeenStages,
  saveSeenStages,
} from './game/storage'
import {
  CONTAINER_WIDTH,
  CONTAINER_HEIGHT,
  ORDER_QUIZ,
  MAINTENANCE,
} from './game/config'
import { getMode, DEFAULT_MODE_ID } from './game/modes'
import { initMode, saveMode } from './game/modeStorage'
import { loadPlayer, savePlayer } from './game/playerStorage'
import { submitScore, flushPending } from './game/leaderboard'
import { initRoom, saveRoom, hasLeaderboard } from './game/room'
import { shouldShowNotice, dismissNotice } from './game/notice'
import SpaceBackground from './components/SpaceBackground'
import ScoreBoard from './components/ScoreBoard'
import NextPreview from './components/NextPreview'
import GameOverModal from './components/GameOverModal'
import MuteButton from './components/MuteButton'
import InfoCard from './components/InfoCard'
import PlanetGuide from './components/PlanetGuide'
import LeaderboardPanel from './components/LeaderboardPanel'
import NicknamePicker from './components/NicknamePicker'
import DistanceRuler from './components/DistanceRuler'
import ModeSelect from './components/ModeSelect'
import RoomGate from './components/RoomGate'
import NoticePopup from './components/NoticePopup'
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
  // 마지막 단계(해왕성)를 처음 만들었을 때만 완성 안내 + 거리 보기 화면을 띄웁니다.
  // 두 번째부터도 띄우면, 해왕성 둘을 합치려는 학생의 흐름이 매번 끊깁니다.
  const finishShownRef = useRef(false)
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
  // 학급 코드. null 이면 아직 안 정한 상태 → 코드 화면을 띄웁니다.
  const [room, setRoom] = useState(() => initRoom())
  const [showRoomSetup, setShowRoomSetup] = useState(false)
  // 게임이 바뀐 것을 알리는 첫 화면 안내 (game/notice.js)
  const [showNotice, setShowNotice] = useState(() => shouldShowNotice())
  // 시작 준비(안내 → 학급 코드 → 게임 고르기 → 별명)가 끝났는지.
  // 끝나기 전에는 게임을 아예 만들지 않습니다 — 팝업 뒤에서 천체가 떨어지고 있으면
  // 학생 눈에는 "이미 시작된 화면"으로 보여서 헷갈립니다.
  const [started, setStarted] = useState(false)
  // 고른 모드(없으면 null → 모드 선택 창이 뜸). 뒤에서 도는 게임은 기본 모드로 돌아갑니다.
  const [modeId, setModeId] = useState(() => initMode())
  const [showModeSelect, setShowModeSelect] = useState(() => initMode() === null)
  // 화면 위에 잠깐 띄우는 알림 (완성했을 때 등). null 이면 안 보임
  const [banner, setBanner] = useState(null)
  const [showRuler, setShowRuler] = useState(false) // 실제 거리 보기 화면
  const mode = getMode(modeId ?? DEFAULT_MODE_ID)

  playerRef.current = player
  roomRef.current = room

  // 준비가 한 번 끝나면 계속 게임 화면을 보여 줍니다
  // (나중에 "바꾸기"로 창을 열어도 게임이 사라지지 않도록 되돌리지 않습니다)
  const setupDone =
    !showNotice && room !== null && modeId !== null && player !== null
  useEffect(() => {
    if (setupDone) setStarted(true)
  }, [setupDone])

  // 오디오 매니저는 앱 전체에서 하나만 사용
  if (!audioRef.current) {
    audioRef.current = createAudioManager()
  }

  useEffect(() => {
    return () => audioRef.current?.dispose()
  }, [])

  // 지난번에 인터넷 문제로 못 보낸 기록이 있으면 시작할 때 다시 전송
  useEffect(() => {
    if (MAINTENANCE) return
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
    finishShownRef.current = false
    setScore(0)
    setIsGameOver(false)
    setCardQueue([])
    setMaxStage(-1)
    setSubmitState(null)
    setBanner(null)
    setShowRuler(false)

    if (MAINTENANCE || !started || !containerRef.current) return

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
        // 마지막 단계(태양 / 해왕성 궤도)를 처음 만들면 완성
        if (stage === mode.stages.length - 1 && !finishShownRef.current) {
          finishShownRef.current = true
          setBanner(`🎉 ${mode.stages[stage].name}까지 만들었어요! 완성!`)
          // 완성하면 실제 거리 화면으로 마무리 (거리 순서 게임만)
          if (mode.hasDistanceRuler) {
            setShowRuler(true)
            game.pause()
          }
        }
        // 처음 만든 천체면 게임을 멈추고 정보 카드 표시
        if (seenStagesRef.current.has(stage)) return
        seenStagesRef.current.add(stage)
        saveSeenStages(seenStagesRef.current)
        setCardQueue((q) => [...q, stage])
        game.pause()
      },
      // 마지막 궤도 두 개가 만나 "태양계 하나 완성"으로 사라졌을 때
      onFinalPair: (bonus) => {
        setBanner(`🌟 태양계 하나 완성! +${bonus}점`)
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
  }, [gameKey, mode, started])

  // 게임이 끝나면 점수를 순위표에 등록 (반·별명을 정한 경우에만)
  async function handleGameOverSubmit() {
    const currentPlayer = playerRef.current
    if (!currentPlayer) {
      setSubmitState('skipped')
      return
    }
    // 혼자 연습 중이면 순위표에 올리지 않습니다
    if (!hasLeaderboard(roomRef.current)) {
      setSubmitState('practice')
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
      gameMode: mode.id, // 크기 순서·거리 순서 순위표를 따로 집계
    })
    setSubmitState(result.status)
    setLbRefreshKey((k) => k + 1)
  }

  // 학급 코드 화면에서 코드를 넣었을 때 (혼자 연습 포함)
  function handleEnterRoom(nextRoom) {
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

  // 퀴즈를 맞히면 보너스 점수 (해당 단계 점수의 절반)
  function handleQuizCorrect(bonus) {
    scoreRef.current += bonus
    setScore(scoreRef.current)
    setBest((prevBest) => {
      if (scoreRef.current <= prevBest) return prevBest
      saveBestScore(scoreRef.current)
      return scoreRef.current
    })
    audioRef.current.play('merge', { stage: 9 }) // 밝은 칭찬음
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

  // 점검 중(config.js 의 MAINTENANCE)에는 게임을 아예 띄우지 않고 안내만 보여 줍니다.
  // 순위표를 초기화하는 동안 기록이 섞이지 않도록 하기 위한 것입니다.
  if (MAINTENANCE) {
    return (
      <>
        <SpaceBackground />
        <div id="game-page" className="is-maintenance">
          <header className="title-area">
            <h1>🌟 천체 합치기 게임</h1>
          </header>
          <SiteFooter />
        </div>
        <ModeSelect current={null} onSelect={() => {}} onCancel={null} />
      </>
    )
  }

  return (
    <>
      <SpaceBackground />
      <div id="game-page" className={started ? '' : 'is-starting'}>
        <header className="title-area">
          <h1>🌟 천체 합치기 게임</h1>
          {started && (
            <>
              <p>마우스로 위치를 정하고 클릭하면 천체가 떨어져요. 같은 천체 둘이 만나면 더 큰 천체로 변신!</p>
              <button
                type="button"
                className="mode-chip"
                onClick={() => setShowModeSelect(true)}
              >
                <span aria-hidden="true">{mode.select.emoji}</span> {mode.name}
                <span className="mode-chip-action">바꾸기</span>
              </button>
            </>
          )}
        </header>

        {/* 준비(안내 → 학급 코드 → 게임 고르기 → 별명)가 끝나야 게임을 보여 줍니다.
            그 전에는 팝업 뒤에 아무것도 없어야 학생이 헷갈리지 않습니다. */}
        {started && (
        <>

        {banner && (
          <div className="clear-banner">
            <span>{banner}</span>
            <button type="button" onClick={() => setBanner(null)} aria-label="닫기">
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
          <PlanetGuide
            mode={mode}
            maxStage={maxStage}
            onShowRuler={() => {
              setShowRuler(true)
              gameRef.current?.pause()
            }}
          />

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
                quiz={ORDER_QUIZ ? (mode.quiz?.(cardQueue[0]) ?? null) : null}
                bonus={Math.round((mode.mergeScores[cardQueue[0]] ?? 0) * 0.5)}
                onCorrect={handleQuizCorrect}
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
            gameMode={mode}
            refreshKey={lbRefreshKey}
            player={player}
            onChangePlayer={() => setShowSetup(true)}
            room={room}
            onChangeRoom={() => setShowRoomSetup(true)}
          />
        </div>

        </>
        )}

        <SiteFooter />
      </div>

      {showNotice && (
        <NoticePopup
          onClose={() => {
            dismissNotice()
            setShowNotice(false)
          }}
        />
      )}

      {!showNotice && (room === null || showRoomSetup) && (
        <RoomGate
          modeId={modeId}
          onEnter={handleEnterRoom}
          onCancel={room === null ? null : () => setShowRoomSetup(false)}
        />
      )}

      {!showNotice && room !== null && !showRoomSetup && showModeSelect && (
        <ModeSelect
          current={modeId}
          onSelect={handleSelectMode}
          onCancel={modeId ? () => setShowModeSelect(false) : null}
        />
      )}

      {!showNotice && showSetup && !showModeSelect && room !== null && !showRoomSetup && (
        <NicknamePicker
          initial={player}
          onSave={handleSavePlayer}
          onCancel={player ? () => setShowSetup(false) : null}
        />
      )}

      {showRuler && (
        <DistanceRuler
          onClose={() => {
            setShowRuler(false)
            // 정보 카드가 남아 있으면 그 카드가 닫힐 때 이어서 재개합니다
            if (cardQueue.length === 0) gameRef.current?.resume()
          }}
        />
      )}

    </>
  )
}

export default App
