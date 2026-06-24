import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useViewStore } from '../../src/store/view-store'

// Helper: stub Date so todayStr() returns a deterministic value.
function setSystemDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  vi.setSystemTime(new Date(y, m - 1, d, 12, 0, 0))
}

describe('view-store tickToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setSystemDate('2026-06-23')
    // reset store state
    useViewStore.setState({
      mode: 'date',
      currentDate: '2026-06-23',
      lastKnownToday: '2026-06-23',
      expandedTaskId: null,
      editingTaskId: null,
      addInputOpen: false,
      moveMode: false,
      quickAddOpen: false,
    })
  })
  afterEach(() => { vi.useRealTimers() })

  it('no-op when system date unchanged', () => {
    useViewStore.getState().tickToday()
    const s = useViewStore.getState()
    expect(s.currentDate).toBe('2026-06-23')
    expect(s.lastKnownToday).toBe('2026-06-23')
  })

  it('advances currentDate when user is on the old "today"', () => {
    setSystemDate('2026-06-24')
    useViewStore.getState().tickToday()
    const s = useViewStore.getState()
    expect(s.lastKnownToday).toBe('2026-06-24')
    expect(s.currentDate).toBe('2026-06-24')
  })

  it('keeps currentDate when user navigated away (e.g. viewing yesterday)', () => {
    // user clicks ◀ to go to yesterday
    useViewStore.getState().setDate('2026-06-22')
    expect(useViewStore.getState().currentDate).toBe('2026-06-22')
    // midnight passes
    setSystemDate('2026-06-24')
    useViewStore.getState().tickToday()
    const s = useViewStore.getState()
    expect(s.lastKnownToday).toBe('2026-06-24')
    expect(s.currentDate).toBe('2026-06-22') // stays where the user was
  })

  it('multi-day jump (slept through a weekend) still advances', () => {
    setSystemDate('2026-06-26')
    useViewStore.getState().tickToday()
    const s = useViewStore.getState()
    expect(s.lastKnownToday).toBe('2026-06-26')
    expect(s.currentDate).toBe('2026-06-26')
  })
})
