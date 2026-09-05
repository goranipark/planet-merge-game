import Matter from 'matter-js'
import { STAGES } from './objects'
import { canMerge, getNextStage, mergeScore } from './mergeLogic'
import {
  getSprite,
  SPRITE_DISC_DIAMETER,
  EXPRESSIONS,
  IDLE_EXPRESSIONS,
} from './sprites'
import {
  CONTAINER_WIDTH,
  CONTAINER_HEIGHT,
  SIZE_SCALE,
  SPAWN_Y,
  GAME_OVER_LINE_Y,
  GAME_OVER_OVERLAP,
  GAME_OVER_HOLD_MS,
  SPAWN_GRACE_MS,
  DROP_COOLDOWN_MS,
  SPAWN_POOL_SIZE,
  GRAVITY_Y,
  RESTITUTION,
  FRICTION,
  FRICTION_STATIC,
  DENSITY,
  SURPRISED_MS,
  MERGE_HAPPY_MS,
} from './config'

const { Engine, Render, Runner, World, Bodies, Events } = Matter

// 표정 관련 (config.js 에 없는 세부값)
const COLLISION_SPEED_MIN = 2 // 이 속도 이상으로 부딪혀야 놀람 (살짝 스치는 건 무시)
const MOVING_SPEED = 1.2 // 이보다 빠르면 "움직이는 중"으로 보고 기본 표정
const IDLE_CHANGE_MIN_MS = 2500 // 대기 표정이 바뀌는 최소 간격
const IDLE_CHANGE_RANGE_MS = 4500 // 여기에 랜덤으로 더해짐
const LAND_SFX_MIN_GAP_MS = 70 // 착지음이 한꺼번에 겹쳐 울리지 않도록 최소 간격

function stageRadius(stage) {
  return STAGES[stage].radius * SIZE_SCALE
}

function randomSpawnStage() {
  return Math.floor(Math.random() * SPAWN_POOL_SIZE)
}

function pickIdleExpression(exclude) {
  const pool = IDLE_EXPRESSIONS.filter((e) => e !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

function createStageBody(stage, x, y, expression = 'normal') {
  const radius = stageRadius(stage)
  const scale = (radius * 2) / SPRITE_DISC_DIAMETER
  const body = Bodies.circle(x, y, radius, {
    restitution: RESTITUTION,
    friction: FRICTION,
    frictionStatic: FRICTION_STATIC,
    density: DENSITY,
    render: {
      sprite: {
        texture: getSprite(stage, expression),
        xScale: scale,
        yScale: scale,
      },
    },
  })
  body.gameStage = stage
  body.spawnedAt = null // 첫 프레임에 기록 (게임오버 판정의 유예 시간 계산용)
  body.countsForGameOver = false
  body.face = {
    current: expression,
    idle: 'normal',
    overrideExpr: null,
    overrideUntil: 0,
    nextIdleChangeAt: 0,
  }
  return body
}

function setExpression(body, expression) {
  if (body.face.current === expression) return
  body.face.current = expression
  body.render.sprite.texture = getSprite(body.gameStage, expression)
}

function setTemporaryExpression(body, expression, now, durationMs) {
  body.face.overrideExpr = expression
  body.face.overrideUntil = now + durationMs
  setExpression(body, expression)
}

// 매 프레임 각 천체의 표정을 상태에 맞게 갱신
function updateExpression(body, now) {
  const f = body.face
  if (f.overrideExpr) {
    if (now < f.overrideUntil) return
    f.overrideExpr = null
  }

  if (body.speed > MOVING_SPEED) {
    setExpression(body, 'normal')
    f.nextIdleChangeAt = 0
    return
  }

  // 가만히 있는 중: 일정 시간마다 지루함/호기심/졸림 등으로 바뀜
  if (now >= f.nextIdleChangeAt) {
    if (f.nextIdleChangeAt !== 0) {
      f.idle = pickIdleExpression(f.idle)
    }
    f.nextIdleChangeAt =
      now + IDLE_CHANGE_MIN_MS + Math.random() * IDLE_CHANGE_RANGE_MS
  }
  setExpression(body, f.idle)
}

export function createGame(
  container,
  { onScoreChange, onNextChange, onGameOver, onSfx, onMerge } = {}
) {
  // 물리 세계 크기는 항상 config 값으로 고정하고, 좁은 화면에서는 CSS가 캔버스를 축소해 보여줍니다.
  // (화면 크기가 바뀌어도 게임이 초기화되지 않음)
  const width = CONTAINER_WIDTH
  const height = CONTAINER_HEIGHT

  let lastLandSfxAt = -Infinity
  let isPaused = false
  let isGameOver = false
  let violationStartedAt = null
  let dangerRatio = 0 // 0 = 안전, 1 = 게임오버 직전 (경고선 표시용)

  const engine = Engine.create()
  engine.gravity.y = GRAVITY_Y

  const render = Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: 'transparent',
    },
  })

  // 벽은 물리적으로만 존재하고, 화면에는 CSS로 만든 유리병 테두리만 보이게 함
  const wallThickness = 40
  const wallOptions = { isStatic: true, render: { visible: false } }
  World.add(engine.world, [
    Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, wallOptions),
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 3, wallOptions),
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 3, wallOptions),
  ])

  // 표정을 바꿔 끼울 때 첫 프레임이 비지 않도록 모든 스프라이트를 미리 로드
  for (let stage = 0; stage < STAGES.length; stage++) {
    for (const expr of EXPRESSIONS) {
      const uri = getSprite(stage, expr)
      const img = new Image()
      img.src = uri
      render.textures[uri] = img
    }
  }

  // ---------- 조준 & 낙하 ----------
  let nextStage = randomSpawnStage()
  let aimX = width / 2
  let lastDropAt = -Infinity
  let pointerInside = false
  onNextChange?.(nextStage)

  function clampAimX(x, stage) {
    const r = stageRadius(stage) + 2
    return Math.min(Math.max(x, r), width - r)
  }

  function canDrop() {
    return (
      !isGameOver &&
      !isPaused &&
      performance.now() - lastDropAt >= DROP_COOLDOWN_MS
    )
  }

  function drop() {
    if (!canDrop()) return
    const x = clampAimX(aimX, nextStage)
    World.add(engine.world, createStageBody(nextStage, x, SPAWN_Y))
    lastDropAt = performance.now()
    onSfx?.('drop')
    nextStage = randomSpawnStage()
    aimX = clampAimX(aimX, nextStage)
    onNextChange?.(nextStage)
  }

  // 화면에 표시된 크기가 줄어들어 있어도 물리 좌표로 정확히 변환
  function pointerX(event) {
    const rect = container.getBoundingClientRect()
    const scale = rect.width > 0 ? width / rect.width : 1
    return (event.clientX - rect.left) * scale
  }

  function handlePointerMove(event) {
    pointerInside = true
    aimX = clampAimX(pointerX(event), nextStage)
  }

  function handlePointerDown(event) {
    // 터치: 누른 위치로 먼저 이동 (끌다가 떼면 낙하)
    pointerInside = true
    aimX = clampAimX(pointerX(event), nextStage)
    event.preventDefault()
  }

  function handlePointerUp(event) {
    aimX = clampAimX(pointerX(event), nextStage)
    drop()
  }

  function handlePointerLeave() {
    pointerInside = false
  }

  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerdown', handlePointerDown)
  container.addEventListener('pointerup', handlePointerUp)
  container.addEventListener('pointerleave', handlePointerLeave)

  // ---------- 병합 파티클 이펙트 ----------
  const particles = []

  function spawnBurst(x, y, color, radius) {
    const count = 14
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
      const speed = 2 + Math.random() * 3 + radius * 0.03
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 3 + Math.random() * 4,
        color: Math.random() < 0.5 ? color : '#ffffff',
      })
    }
    particles.push({ x, y, ring: true, life: 1, size: radius, color })
  }

  function drawParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life -= 0.035
      if (p.life <= 0) {
        particles.splice(i, 1)
        continue
      }
      ctx.save()
      ctx.globalAlpha = Math.max(p.life, 0)
      if (p.ring) {
        const rr = p.size * (1 + (1 - p.life) * 1.2)
        ctx.strokeStyle = p.color
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, rr, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
  }

  // ---------- 충돌: 놀란 표정, 착지음, 병합 ----------
  function handleCollisionStart(event) {
    const now = engine.timing.timestamp
    const processed = new Set()
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair

      const impact = Math.max(bodyA.speed, bodyB.speed)
      if (impact >= COLLISION_SPEED_MIN) {
        for (const b of [bodyA, bodyB]) {
          if (!b.isStatic && b.face && b.face.overrideExpr !== 'happy') {
            setTemporaryExpression(b, 'surprised', now, SURPRISED_MS)
          }
        }
        if (now - lastLandSfxAt >= LAND_SFX_MIN_GAP_MS) {
          lastLandSfxAt = now
          onSfx?.('land', { impact })
        }
      }

      if (processed.has(bodyA.id) || processed.has(bodyB.id)) continue
      if (bodyA.isStatic || bodyB.isStatic) continue
      if (!canMerge(bodyA, bodyB)) continue

      const mergedStage = getNextStage(bodyA.gameStage)
      if (mergedStage === null) continue // 태양끼리 충돌 — 클리어 처리는 추후 단계에서 구현

      processed.add(bodyA.id)
      processed.add(bodyB.id)

      const midX = (bodyA.position.x + bodyB.position.x) / 2
      const midY = (bodyA.position.y + bodyB.position.y) / 2

      World.remove(engine.world, bodyA)
      World.remove(engine.world, bodyB)
      const merged = createStageBody(mergedStage, midX, midY, 'happy')
      setTemporaryExpression(merged, 'happy', now, MERGE_HAPPY_MS)
      World.add(engine.world, merged)

      spawnBurst(midX, midY, STAGES[mergedStage].color, stageRadius(mergedStage))
      onSfx?.('merge', { stage: mergedStage })
      onScoreChange?.(mergeScore(mergedStage))
      onMerge?.(mergedStage)
    }
  }

  Events.on(engine, 'collisionStart', handleCollisionStart)

  // 천체가 라인 위로 GAME_OVER_OVERLAP 비율 이상 올라왔는지 (0.5 = 중심이 라인 위)
  function isOverLine(body) {
    const top = body.position.y - body.circleRadius
    const heightAboveLine = GAME_OVER_LINE_Y - top
    return heightAboveLine >= body.circleRadius * 2 * GAME_OVER_OVERLAP
  }

  // 방금 떨어뜨려 라인을 통과 중인 천체는 제외.
  // 한 번이라도 라인 아래로 내려갔거나, 떨어뜨린 지 충분히 지난 천체만 판정 대상.
  function countsForGameOver(body, now) {
    if (body.spawnedAt === null) body.spawnedAt = now
    if (body.countsForGameOver) return true
    if (
      body.position.y > GAME_OVER_LINE_Y ||
      now - body.spawnedAt > SPAWN_GRACE_MS
    ) {
      body.countsForGameOver = true
    }
    return body.countsForGameOver
  }

  // ---------- 매 프레임: 표정 갱신 + 게임오버 판정 ----------
  function handleAfterUpdate() {
    if (isGameOver) return

    const now = engine.timing.timestamp
    let inDanger = false

    for (const b of engine.world.bodies) {
      if (b.isStatic || !b.face) continue
      updateExpression(b, now)
      if (!inDanger && countsForGameOver(b, now) && isOverLine(b)) {
        inDanger = true
      }
    }

    if (inDanger) {
      if (violationStartedAt === null) {
        violationStartedAt = now
      } else if (now - violationStartedAt > GAME_OVER_HOLD_MS) {
        isGameOver = true
        dangerRatio = 0
        Runner.stop(runner)
        onGameOver?.()
        return
      }
      dangerRatio = Math.min((now - violationStartedAt) / GAME_OVER_HOLD_MS, 1)
    } else {
      violationStartedAt = null
      dangerRatio = 0
    }
  }

  Events.on(engine, 'afterUpdate', handleAfterUpdate)

  // ---------- 매 프레임 그리기: 게임오버 라인, 조준 미리보기, 파티클 ----------
  function drawAimPreview(ctx) {
    if (isGameOver || isPaused || !canDrop()) return
    const radius = stageRadius(nextStage)
    const x = clampAimX(aimX, nextStage)

    // 낙하 가이드 점선
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.setLineDash([4, 8])
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, SPAWN_Y + radius)
    ctx.lineTo(x, height)
    ctx.stroke()
    ctx.restore()

    // 다음 천체 미리보기 (반투명)
    const img = render.textures[getSprite(nextStage, 'normal')]
    if (img && img.complete && img.naturalWidth > 0) {
      const scale = (radius * 2) / SPRITE_DISC_DIAMETER
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.save()
      ctx.globalAlpha = pointerInside ? 0.9 : 0.6
      ctx.drawImage(img, x - w / 2, SPAWN_Y - h / 2, w, h)
      ctx.restore()
    }
  }

  // 게임오버 라인 — 위험 상태면 굵고 밝게 깜빡이며 "위험!" 표시
  function drawGameOverLine(ctx) {
    const danger = dangerRatio > 0
    const blink = danger
      ? 0.55 + 0.45 * Math.sin(engine.timing.timestamp / 90)
      : 1

    ctx.save()
    if (danger) {
      ctx.strokeStyle = `rgba(255, 70, 90, ${0.75 + 0.25 * blink})`
      ctx.lineWidth = 4
      ctx.setLineDash([])
      ctx.shadowColor = 'rgba(255, 70, 90, 0.9)'
      ctx.shadowBlur = 12
    } else {
      ctx.strokeStyle = 'rgba(255, 120, 140, 0.55)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
    }
    ctx.beginPath()
    ctx.moveTo(0, GAME_OVER_LINE_Y)
    ctx.lineTo(width, GAME_OVER_LINE_Y)
    ctx.stroke()
    ctx.restore()

    if (!danger) return

    // 남은 시간 게이지
    ctx.save()
    ctx.fillStyle = 'rgba(255, 70, 90, 0.85)'
    ctx.fillRect(0, GAME_OVER_LINE_Y - 3, width * dangerRatio, 3)
    ctx.restore()

    // 경고 문구
    ctx.save()
    ctx.globalAlpha = 0.6 + 0.4 * blink
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(20, 10, 20, 0.9)'
    ctx.strokeText('위험!', width / 2, GAME_OVER_LINE_Y - 10)
    ctx.fillStyle = '#ff5a6e'
    ctx.fillText('위험!', width / 2, GAME_OVER_LINE_Y - 10)
    ctx.restore()
  }

  function handleAfterRender() {
    const ctx = render.context
    drawGameOverLine(ctx)
    drawAimPreview(ctx)
    drawParticles(ctx)
  }

  Events.on(render, 'afterRender', handleAfterRender)

  const runner = Runner.create()
  Runner.run(runner, engine)
  Render.run(render)

  // 개발 모드 전용 디버그 훅 (배포 빌드에는 포함되지 않음)
  if (import.meta.env.DEV) {
    window.__game = { engine, render, Matter }
  }

  // 교육 카드 등으로 잠시 멈춤 / 재개 (화면은 그대로, 물리 계산만 멈춤)
  function pause() {
    if (isPaused || isGameOver) return
    isPaused = true
    Runner.stop(runner)
  }

  function resume() {
    if (!isPaused) return
    isPaused = false
    if (!isGameOver) Runner.run(runner, engine)
  }

  function destroy() {
    container.removeEventListener('pointermove', handlePointerMove)
    container.removeEventListener('pointerdown', handlePointerDown)
    container.removeEventListener('pointerup', handlePointerUp)
    container.removeEventListener('pointerleave', handlePointerLeave)
    Events.off(engine, 'collisionStart', handleCollisionStart)
    Events.off(engine, 'afterUpdate', handleAfterUpdate)
    Events.off(render, 'afterRender', handleAfterRender)
    Render.stop(render)
    Runner.stop(runner)
    World.clear(engine.world)
    Engine.clear(engine)
    if (render.canvas) render.canvas.remove()
    render.textures = {}
  }

  return { destroy, pause, resume }
}
