import { create } from 'zustand'
import { todayStr } from '../utils/date-utils'

export type ViewMode = 'date' | 'pool' | 'archive' | 'settings'

interface ViewState {
  mode: ViewMode
  currentDate: string     // YYYY-MM-DD（mode=date 时）
  expandedTaskId: string | null
  editingTaskId: string | null
  addInputOpen: boolean
  moveMode: boolean

  setMode: (m: ViewMode) => void
  setDate: (d: string) => void
  toggleExpand: (id: string) => void
  setEditing: (id: string | null) => void
  setAddInputOpen: (b: boolean) => void
  setMoveMode: (b: boolean) => void
}

export const useViewStore = create<ViewState>((set) => ({
  mode: 'date',
  currentDate: todayStr(),
  expandedTaskId: null,
  editingTaskId: null,
  addInputOpen: false,
  moveMode: false,

  setMode: (m) => set({ mode: m }),
  setDate: (d) => set({ currentDate: d, expandedTaskId: null }),
  toggleExpand: (id) => set((s) => ({
    expandedTaskId: s.expandedTaskId === id ? null : id,
    editingTaskId: null,
  })),
  setEditing: (id) => set({ editingTaskId: id }),
  setAddInputOpen: (b) => set({ addInputOpen: b }),
  setMoveMode: (b) => set({ moveMode: b }),
}))
