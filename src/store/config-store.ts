import { create } from 'zustand'
import { api } from '../api'
import type { Config } from '../types'
import { DEFAULT_CONFIG } from '../types'

interface ConfigState {
  cfg: Config
  load: () => Promise<void>
  update: (patch: Partial<Config>) => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  cfg: DEFAULT_CONFIG,
  load: async () => set({ cfg: await api.config.load() }),
  update: async (patch) => {
    const next = { ...get().cfg, ...patch }
    await api.config.save(next)
    set({ cfg: next })
  },
}))
