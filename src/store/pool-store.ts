import { create } from 'zustand'
import { api } from '../api'
import type { Task } from '../types'

interface PoolState {
  pool: Task[]
  load: () => Promise<void>
}

export const usePoolStore = create<PoolState>((set) => ({
  pool: [],
  load: async () => set({ pool: await api.pool.list() }),
}))
