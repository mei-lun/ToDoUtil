import { describe, it, expect } from 'vitest'
import { computeUsedDays } from '../../src/utils/used-days'
import type { Task } from '../../src/types'

function task(orig: string, doneAtDate: string, pooled: Array<{from:string,to:string|null}> = []): Task {
  return {
    id: 'x', title: 't', rawTitle: 't', detail: '',
    plannedDate: orig, createdAt: orig + 'T00:00:00Z',
    status: 'done',
    doneAt: doneAtDate + 'T12:00:00Z',
    order: -1, attachments: [],
    originalPlannedDate: orig,
    pooledRanges: pooled,
  }
}

describe('computeUsedDays', () => {
  it('same day = 1 day', () => {
    expect(computeUsedDays(task('2026-06-23', '2026-06-23'))).toBe(1)
  })
  it('1 day delta = 2 days', () => {
    expect(computeUsedDays(task('2026-06-23', '2026-06-24'))).toBe(2)
  })
  it('10 day delta = 11 days', () => {
    expect(computeUsedDays(task('2026-06-13', '2026-06-23'))).toBe(11)
  })
  it('subtracts pooled range', () => {
    const t = task('2026-06-13', '2026-06-23', [{from: '2026-06-15', to: '2026-06-20'}])
    // raw = 11, pooled = 5 days
    expect(computeUsedDays(t)).toBe(11 - 5)
  })
  it('ignores still-pooled range with to=null', () => {
    const t = task('2026-06-13', '2026-06-23', [{from: '2026-06-15', to: null}])
    expect(computeUsedDays(t)).toBe(11)
  })
})
