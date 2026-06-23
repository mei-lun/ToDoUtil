import { create } from 'zustand'
import { api } from '../api'
import type { Task } from '../types'

interface ArchiveState {
  archive: Task[]
  query: string
  load: () => Promise<void>
  setQuery: (q: string) => Promise<void>
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archive: [],
  query: '',
  load: async () => {
    const q = get().query
    const arr = q ? await api.archive.search(q) : await api.archive.list()
    set({ archive: arr })
  },
  setQuery: async (q: string) => {
    set({ query: q })
    await get().load()
  },
}))
