import type { Task } from '../types'
import { addDays } from './date-utils'

export function buildGridDays(start: string, end: string): string[] {
  const days: string[] = []
  let cur = start
  while (cur <= end) {
    days.push(cur)
    cur = addDays(cur, 1)
  }
  return days
}

export type CellState = 'empty' | 'filled' | 'pooled' | 'abandoned'

export function taskCellState(t: Task, day: string): CellState {
  if (!t.doneAt) return 'empty'
  const doneDay = t.doneAt.slice(0, 10)
  if (day < t.originalPlannedDate || day > doneDay) return 'empty'
  for (const r of t.pooledRanges) {
    if (r.to == null) continue
    if (day >= r.from && day <= r.to) return 'pooled'
  }
  return t.status === 'abandoned' ? 'abandoned' : 'filled'
}
