import { describe, it, expect } from 'vitest'
import { parseRawTitle } from '../../src/utils/date-parser'

const TODAY = '2026-06-23'

describe('parseRawTitle - time', () => {
  it('@9点', () => expect(parseRawTitle('@9点 X', TODAY).plannedTime).toBe('09:00'))
  it('@9:30', () => expect(parseRawTitle('@9:30 X', TODAY).plannedTime).toBe('09:30'))
  it('@上午9点', () => expect(parseRawTitle('@上午9点 X', TODAY).plannedTime).toBe('09:00'))
  it('@下午3点 → 15:00', () => expect(parseRawTitle('@下午3点 X', TODAY).plannedTime).toBe('15:00'))
  it('@晚上8点 → 20:00', () => expect(parseRawTitle('@晚上8点 X', TODAY).plannedTime).toBe('20:00'))
  it('@明天9点 combo', () => {
    const r = parseRawTitle('@明天9点 开会', TODAY)
    expect(r.plannedDate).toBe('2026-06-24')
    expect(r.plannedTime).toBe('09:00')
  })
  it('两个独立 @ → date 和 time 都识别', () => {
    const r = parseRawTitle('@明天 @9点 开会', TODAY)
    expect(r.plannedDate).toBe('2026-06-24')
    expect(r.plannedTime).toBe('09:00')
    expect(r.title).toBe('开会')
  })
})
