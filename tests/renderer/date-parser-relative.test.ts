import { describe, it, expect } from 'vitest'
import { parseRawTitle } from '../../src/utils/date-parser'

const TODAY = '2026-06-23'

describe('parseRawTitle - relative dates', () => {
  it('no @ → defaults to today, title unchanged', () => {
    const r = parseRawTitle('买牛奶', TODAY)
    expect(r.title).toBe('买牛奶')
    expect(r.plannedDate).toBe(TODAY)
    expect(r.plannedTime).toBeUndefined()
  })
  it('@今天', () => {
    const r = parseRawTitle('@今天 买牛奶', TODAY)
    expect(r.title).toBe('买牛奶')
    expect(r.plannedDate).toBe('2026-06-23')
  })
  it('@明天', () => {
    const r = parseRawTitle('@明天 开会', TODAY)
    expect(r.title).toBe('开会')
    expect(r.plannedDate).toBe('2026-06-24')
  })
  it('@后天', () => {
    expect(parseRawTitle('@后天 X', TODAY).plannedDate).toBe('2026-06-25')
  })
  it('@大后天', () => {
    expect(parseRawTitle('@大后天 X', TODAY).plannedDate).toBe('2026-06-26')
  })
  it('@三天后', () => {
    expect(parseRawTitle('@三天后 X', TODAY).plannedDate).toBe('2026-06-26')
  })
  it('@5天后', () => {
    expect(parseRawTitle('@5天后 X', TODAY).plannedDate).toBe('2026-06-28')
  })
  it('@ at end of title still works', () => {
    const r = parseRawTitle('开会 @明天', TODAY)
    expect(r.title).toBe('开会')
    expect(r.plannedDate).toBe('2026-06-24')
  })
  it('unrecognized @token leaves token in title, date=today', () => {
    const r = parseRawTitle('@xyz 啥', TODAY)
    expect(r.title).toBe('@xyz 啥')
    expect(r.plannedDate).toBe(TODAY)
  })
})
