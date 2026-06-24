import { create } from 'zustand'
import { todayStr } from '../utils/date-utils'

export type ViewMode = 'date' | 'pool' | 'archive' | 'settings'

interface ViewState {
  mode: ViewMode
  currentDate: string     // YYYY-MM-DD（mode=date 时）
  lastKnownToday: string  // 上次 tickToday 看到的系统今天
  expandedTaskId: string | null
  editingTaskId: string | null
  addInputOpen: boolean
  moveMode: boolean
  quickAddOpen: boolean

  setMode: (m: ViewMode) => void
  setDate: (d: string) => void
  toggleExpand: (id: string) => void
  setEditing: (id: string | null) => void
  setAddInputOpen: (b: boolean) => void
  setMoveMode: (b: boolean) => void
  setQuickAddOpen: (b: boolean) => void
  // 检查系统日期是否变了；变了且用户当前停留在"今天"则把 currentDate 推进到新今天。
  // 用户主动切到其他日期（不等于 lastKnownToday）时不动，保留视角。
  tickToday: () => void
}

export const useViewStore = create<ViewState>((set) => {
  const t0 = todayStr()
  return {
    mode: 'date',
    currentDate: t0,
    lastKnownToday: t0,
    expandedTaskId: null,
    editingTaskId: null,
    addInputOpen: false,
    moveMode: false,
    quickAddOpen: false,

    setMode: (m) => set({ mode: m }),
    setDate: (d) => set({ currentDate: d, expandedTaskId: null }),
    toggleExpand: (id) => set((s) => ({
      expandedTaskId: s.expandedTaskId === id ? null : id,
      editingTaskId: null,
    })),
    setEditing: (id) => set({ editingTaskId: id }),
    setAddInputOpen: (b) => set({ addInputOpen: b }),
    setMoveMode: (b) => set({ moveMode: b }),
    setQuickAddOpen: (b) => set({ quickAddOpen: b }),
    tickToday: () => set((s) => {
      const today = todayStr()
      if (today === s.lastKnownToday) return s
      // 用户停留在旧"今天"才跟随推进；否则只更新 lastKnownToday
      const followToToday = s.currentDate === s.lastKnownToday
      return {
        ...s,
        lastKnownToday: today,
        currentDate: followToToday ? today : s.currentDate,
      }
    }),
  }
})
