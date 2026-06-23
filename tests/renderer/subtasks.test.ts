import { describe, it, expect } from 'vitest'
import { countSubtasks, toggleSubtaskAt } from '../../src/utils/subtasks'

describe('countSubtasks', () => {
  it('counts done/total', () => {
    const md = `- [ ] a\n- [x] b\n- [X] c\n- [ ] d`
    expect(countSubtasks(md)).toEqual({ done: 2, total: 4 })
  })
  it('returns zero on no subtasks', () => {
    expect(countSubtasks('hello')).toEqual({ done: 0, total: 0 })
  })
})

describe('toggleSubtaskAt', () => {
  it('toggles unchecked → checked at index 1', () => {
    const md = `- [ ] a\n- [ ] b\n- [ ] c`
    const out = toggleSubtaskAt(md, 1)
    expect(out).toBe(`- [ ] a\n- [x] b\n- [ ] c`)
  })
  it('toggles checked → unchecked', () => {
    const md = `- [x] a\n- [x] b`
    expect(toggleSubtaskAt(md, 0)).toBe(`- [ ] a\n- [x] b`)
  })
  it('out-of-range index is no-op', () => {
    const md = `- [ ] a`
    expect(toggleSubtaskAt(md, 5)).toBe(md)
  })
})
