import { describe, it, expect } from 'vitest'
import { parseRawTitle } from '../../src/utils/date-parser'

const TODAY = '2026-06-23' // Tuesday

describe('parseRawTitle - absolute dates', () => {
  it('@6月25日', () => expect(parseRawTitle('@6月25日 X', TODAY).plannedDate).toBe('2026-06-25'))
  it('@6.25', () => expect(parseRawTitle('@6.25 X', TODAY).plannedDate).toBe('2026-06-25'))
  it('@6-25', () => expect(parseRawTitle('@6-25 X', TODAY).plannedDate).toBe('2026-06-25'))
  it('@6/25', () => expect(parseRawTitle('@6/25 X', TODAY).plannedDate).toBe('2026-06-25'))
  it('past date in current year rolls to next year', () => {
    expect(parseRawTitle('@1.5 X', TODAY).plannedDate).toBe('2027-01-05')
  })
})

describe('parseRawTitle - weekday', () => {
  it('@周三 → upcoming Wed', () => expect(parseRawTitle('@周三 X', TODAY).plannedDate).toBe('2026-06-24'))
  it('@周二 → today (same wd)', () => expect(parseRawTitle('@周二 X', TODAY).plannedDate).toBe('2026-06-23'))
  it('@周一 past in week → next Mon', () => expect(parseRawTitle('@周一 X', TODAY).plannedDate).toBe('2026-06-29'))
  it('@下周一', () => expect(parseRawTitle('@下周一 X', TODAY).plannedDate).toBe('2026-06-29'))
  it('@下周三', () => expect(parseRawTitle('@下周三 X', TODAY).plannedDate).toBe('2026-07-01'))
})
