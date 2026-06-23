import { describe, it, expect } from 'vitest'
import { buildGridDays, taskCellState } from '../../src/utils/grid-data'
import type { Task } from '../../src/types'

describe('buildGridDays', () => {
  it('returns inclusive day list', () => {
    expect(buildGridDays('2026-06-23', '2026-06-25')).toEqual(['2026-06-23', '2026-06-24', '2026-06-25'])
  })
})

function make(overrides: Partial<Task>): Task {
  return {
    id: 'x', title: 'x', rawTitle: 'x', detail: '',
    plannedDate: '2026-06-20', createdAt: '', status: 'done',
    order: -1, attachments: [], originalPlannedDate: '2026-06-20', pooledRanges: [],
    ...overrides,
  }
}

describe('taskCellState', () => {
  const t = make({
    originalPlannedDate: '2026-06-20',
    doneAt: '2026-06-23T00:00:00Z',
    pooledRanges: [{ from: '2026-06-21', to: '2026-06-22' }],
  })
  it('before original = empty', () => expect(taskCellState(t, '2026-06-19')).toBe('empty'))
  it('after done = empty', () => expect(taskCellState(t, '2026-06-24')).toBe('empty'))
  it('on original = filled', () => expect(taskCellState(t, '2026-06-20')).toBe('filled'))
  it('inside pooled range = pooled', () => expect(taskCellState(t, '2026-06-21')).toBe('pooled'))
  it('on done date = filled', () => expect(taskCellState(t, '2026-06-23')).toBe('filled'))

  it('abandoned uses abandoned color', () => {
    const a = make({ ...t, status: 'abandoned' })
    expect(taskCellState(a, '2026-06-20')).toBe('abandoned')
  })
})
