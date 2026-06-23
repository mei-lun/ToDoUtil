import { describe, it, expect } from 'vitest'
import { todayStr, addDays, daysBetween } from '../../src/utils/date-utils'

describe('date-utils', () => {
  it('todayStr returns YYYY-MM-DD', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('addDays adds days', () => {
    expect(addDays('2026-06-23', 1)).toBe('2026-06-24')
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-06-23', -1)).toBe('2026-06-22')
  })

  it('daysBetween counts inclusive days', () => {
    expect(daysBetween('2026-06-23', '2026-06-23')).toBe(0)
    expect(daysBetween('2026-06-23', '2026-06-24')).toBe(1)
    expect(daysBetween('2026-06-01', '2026-06-30')).toBe(29)
  })
})
