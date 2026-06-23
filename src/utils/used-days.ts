import type { Task } from '../types'
import { daysBetween } from './date-utils'

export function computeUsedDays(t: Task): number {
  if (!t.doneAt) return 0
  const doneDate = t.doneAt.slice(0, 10)
  const raw = daysBetween(t.originalPlannedDate, doneDate) + 1
  const pooled = t.pooledRanges.reduce((sum, r) => {
    if (r.to == null) return sum
    return sum + daysBetween(r.from, r.to)
  }, 0)
  return Math.max(1, raw - pooled)
}

export function usedDaysToBarWidth(days: number): number {
  if (days <= 10) return days * 8
  // 10+ 渐缓：sqrt 映射
  const extra = Math.sqrt(days - 10) * 8
  return Math.min(80 + extra, 200)
}
