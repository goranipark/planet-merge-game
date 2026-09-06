// 리더보드 데이터 계층 (Data.md 6장)
// - Firebase 설정이 있으면 Firestore(반 전체 공유)로 동작
// - 설정이 없으면 localStorage(이 기기에만 저장)로 동작 → 설정 전에도 기능을 그대로 테스트 가능
// - 제출 실패 시 로컬에 쌓아두었다가 다음 기회에 다시 보냅니다 (학교 와이파이 불안정 대비)
import {
  FIREBASE_CONFIG,
  TOP_LIMIT,
  NICKNAME_MAX,
  MAX_SCORE,
  PERIODS,
  ALLOW_CUSTOM_NICKNAME,
} from './leaderboardConfig'
import { isGeneratedNickname } from './nicknames'

const LOCAL_SCORES_KEY = 'planet-merge-game:local-scores'
const PENDING_KEY = 'planet-merge-game:pending-scores'

export const isOnlineMode = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId
)

// ---------- 공통 유틸 ----------
function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 불가 환경이면 무시 (게임 진행에는 영향 없음)
  }
}

export function periodStart(periodId) {
  const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[0]
  const start = new Date()
  if (period.days === 1) {
    start.setHours(0, 0, 0, 0) // 오늘 0시부터
  } else {
    start.setDate(start.getDate() - period.days)
  }
  return start
}

// 이상값 방어 (Data.md 7장) — 빈 값, 음수, 과도한 점수, 너무 긴 별명 차단
// 개인정보 보호를 위해 별명 외의 정보(반, 이름 등)는 저장하지 않습니다.
export function validateEntry({ nickname, score, stageReached }) {
  const cleanNickname = String(nickname ?? '')
    .trim()
    .slice(0, NICKNAME_MAX)
  const cleanScore = Math.floor(Number(score))

  if (!cleanNickname) return { ok: false, reason: '별명이 비어 있습니다.' }
  if (!ALLOW_CUSTOM_NICKNAME && !isGeneratedNickname(cleanNickname))
    return { ok: false, reason: '준비된 별명 중에서 골라 주세요.' }
  if (!Number.isFinite(cleanScore) || cleanScore < 0)
    return { ok: false, reason: '점수가 올바르지 않습니다.' }
  if (cleanScore > MAX_SCORE)
    return { ok: false, reason: '점수가 기록 가능한 범위를 넘었습니다.' }

  return {
    ok: true,
    entry: {
      nickname: cleanNickname,
      score: cleanScore,
      stageReached: String(stageReached ?? '').slice(0, 12),
    },
  }
}

// ---------- Firestore 백엔드 ----------
let firestorePromise = null

async function getFirestore() {
  if (!isOnlineMode) return null
  if (!firestorePromise) {
    firestorePromise = (async () => {
      const [{ initializeApp }, firestore] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore'),
      ])
      const app = initializeApp(FIREBASE_CONFIG)
      return { db: firestore.getFirestore(app), fs: firestore }
    })().catch((err) => {
      console.warn('[leaderboard] Firebase 초기화 실패', err)
      firestorePromise = null
      return null
    })
  }
  return firestorePromise
}

async function submitToFirestore(entry) {
  const conn = await getFirestore()
  if (!conn) throw new Error('firebase-unavailable')
  const { db, fs } = conn
  await fs.addDoc(fs.collection(db, 'scores'), {
    ...entry,
    createdAt: fs.serverTimestamp(),
  })
}

async function fetchFromFirestore(periodId) {
  const conn = await getFirestore()
  if (!conn) throw new Error('firebase-unavailable')
  const { db, fs } = conn
  const q = fs.query(
    fs.collection(db, 'scores'),
    fs.where('createdAt', '>=', fs.Timestamp.fromDate(periodStart(periodId))),
    fs.orderBy('createdAt', 'desc'),
    fs.limit(300)
  )
  const snapshot = await fs.getDocs(q)
  const rows = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      nickname: data.nickname,
      score: data.score,
      stageReached: data.stageReached,
      createdAt: data.createdAt?.toDate?.()?.getTime() ?? Date.now(),
    }
  })
  return rows.sort((a, b) => b.score - a.score).slice(0, TOP_LIMIT)
}

// ---------- 로컬 백엔드 (Firebase 설정 전 / 오프라인 연습용) ----------
function submitToLocal(entry) {
  const rows = readJson(LOCAL_SCORES_KEY, [])
  // 같은 밀리초에 여러 건이 저장돼도 ID가 겹치지 않도록 임의 문자열을 덧붙임
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  rows.push({ ...entry, id, createdAt: Date.now() })
  // 너무 많이 쌓이지 않도록 최근 500건만 보관
  writeJson(LOCAL_SCORES_KEY, rows.slice(-500))
}

function fetchFromLocal(periodId) {
  const since = periodStart(periodId).getTime()
  return readJson(LOCAL_SCORES_KEY, [])
    .filter((row) => row.createdAt >= since)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_LIMIT)
}

// ---------- 오프라인 재시도 큐 ----------
function queuePending(entry) {
  const pending = readJson(PENDING_KEY, [])
  pending.push({ ...entry, queuedAt: Date.now() })
  writeJson(PENDING_KEY, pending.slice(-50))
}

export function pendingCount() {
  return readJson(PENDING_KEY, []).length
}

// 밀린 제출을 다시 보냅니다 (앱 시작 시, 그리고 제출 성공 직후 호출)
export async function flushPending() {
  if (!isOnlineMode) return 0
  const pending = readJson(PENDING_KEY, [])
  if (pending.length === 0) return 0

  const stillPending = []
  let sent = 0
  for (const item of pending) {
    try {
      const { queuedAt, ...entry } = item
      await submitToFirestore(entry)
      sent++
    } catch {
      stillPending.push(item)
    }
  }
  writeJson(PENDING_KEY, stillPending)
  return sent
}

// ---------- 공개 API ----------
// 반환: { status: 'saved' | 'queued' | 'rejected', reason?, mode }
export async function submitScore(raw) {
  const validation = validateEntry(raw)
  if (!validation.ok) {
    return { status: 'rejected', reason: validation.reason, mode: mode() }
  }
  const entry = validation.entry

  if (!isOnlineMode) {
    submitToLocal(entry)
    return { status: 'saved', mode: 'local' }
  }

  try {
    await submitToFirestore(entry)
    flushPending().catch(() => {})
    return { status: 'saved', mode: 'online' }
  } catch {
    queuePending(entry)
    submitToLocal(entry) // 인터넷이 끊겨도 본인 기록은 화면에 보이도록
    return { status: 'queued', mode: 'online' }
  }
}

export async function fetchTopScores(periodId) {
  if (!isOnlineMode) return { rows: fetchFromLocal(periodId), mode: 'local' }
  try {
    return { rows: await fetchFromFirestore(periodId), mode: 'online' }
  } catch {
    // 인터넷이 끊겼을 때는 이 기기 기록이라도 보여줍니다
    return { rows: fetchFromLocal(periodId), mode: 'offline' }
  }
}

export function mode() {
  return isOnlineMode ? 'online' : 'local'
}
