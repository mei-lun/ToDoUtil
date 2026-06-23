import { daysBetween, todayStr } from '../utils/date-utils'

interface Props {
  originalPlannedDate: string
}

export function levelOf(days: number): 0 | 1 | 2 | 3 | 4 {
  if (days <= 0) return 0
  if (days <= 2) return 1
  if (days <= 5) return 2
  if (days <= 10) return 3
  return 4
}

export function DelayBadge({ originalPlannedDate }: Props) {
  const days = daysBetween(originalPlannedDate, todayStr())
  const lv = levelOf(days)
  if (lv === 0) return null
  return <span className={`delay-badge lv-${lv}`} title={`已延期 ${days} 天`} />
}
