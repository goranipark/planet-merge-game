// 순위표 기간 계산 (leaderboardConfig.js 의 RESET 설정에 따름)
//
// 각 기록에는 "어느 기간에 속하는지"를 나타내는 열쇠값(dayKey/weekKey/monthKey)을 함께 저장합니다.
// 순위표는 "지금 기간의 열쇠값이 같은 기록"만 모아서 보여주므로,
// 초기화 시점이 되면 열쇠값이 바뀌고 자동으로 새 순위가 시작됩니다.
import { RESET } from './leaderboardConfig'

const pad = (n) => String(n).padStart(2, '0')
const ymd = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// 하루 시작 시각을 반영한 "기준 날짜"
// 예: dayStartHour=9 이면 오전 8시는 아직 '어제'로 계산됩니다.
function shifted(date) {
  const d = new Date(date)
  d.setHours(d.getHours() - RESET.dayStartHour)
  return d
}

function dayStart(date) {
  const d = shifted(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function weekStart(date) {
  const d = dayStart(date)
  const diff = (d.getDay() - RESET.weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function monthStart(date) {
  const d = dayStart(date)
  if (d.getDate() < RESET.monthStartsOnDay) d.setMonth(d.getMonth() - 1)
  d.setDate(RESET.monthStartsOnDay)
  return d
}

// 지금(또는 주어진 시각)이 속한 기간들의 열쇠값
export function periodKeys(date = new Date()) {
  return {
    dayKey: ymd(dayStart(date)),
    weekKey: `W${ymd(weekStart(date))}`,
    monthKey: `M${ymd(monthStart(date))}`,
  }
}

// 다음 초기화까지 남은 설명 (화면 안내용)
export function nextResetText(periodId, date = new Date()) {
  const next = new Date(
    periodId === 'daily'
      ? dayStart(date).setDate(dayStart(date).getDate() + 1)
      : periodId === 'weekly'
        ? weekStart(date).setDate(weekStart(date).getDate() + 7)
        : monthStart(date).setMonth(monthStart(date).getMonth() + 1)
  )
  next.setHours(next.getHours() + RESET.dayStartHour)

  const diffMs = next - date
  const hours = Math.floor(diffMs / 3600000)
  if (hours < 1) return `${Math.max(Math.floor(diffMs / 60000), 1)}분 뒤 새 순위`
  if (hours < 48) return `${hours}시간 뒤 새 순위`
  return `${Math.floor(hours / 24)}일 뒤 새 순위`
}
