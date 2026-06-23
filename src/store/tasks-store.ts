import { create } from 'zustand'
import { api } from '../api'
import type { Task } from '../types'

interface TasksState {
  tasks: Task[]
  load: () => Promise<void>
  upsert: (t: Task) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  load: async () => set({ tasks: await api.tasks.list() }),
  upsert: async (t) => {
    await api.tasks.upsert(t)
    await get().load()
  },
  remove: async (id) => {
    await api.tasks.delete(id)
    await get().load()
  },
}))
