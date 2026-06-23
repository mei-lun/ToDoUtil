import { contextBridge, ipcRenderer } from 'electron'
import type { Task, Config } from '../src/types'

contextBridge.exposeInMainWorld('api', {
  tasks: {
    list:   (): Promise<Task[]>     => ipcRenderer.invoke('tasks:list'),
    upsert: (t: Task): Promise<void> => ipcRenderer.invoke('tasks:upsert', t),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('tasks:delete', id),
    bulk:   (ts: Task[]): Promise<void> => ipcRenderer.invoke('tasks:bulk', ts),
  },
  pool: {
    list:   (): Promise<Task[]>     => ipcRenderer.invoke('pool:list'),
    add:    (t: Task): Promise<void> => ipcRenderer.invoke('pool:add', t),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('pool:remove', id),
  },
  archive: {
    list:   (): Promise<Task[]>     => ipcRenderer.invoke('archive:list'),
    append: (t: Task): Promise<void> => ipcRenderer.invoke('archive:append', t),
    search: (q: string): Promise<Task[]> => ipcRenderer.invoke('archive:search', q),
  },
  config: {
    load:   (): Promise<Config>     => ipcRenderer.invoke('config:load'),
    save:   (c: Config): Promise<void> => ipcRenderer.invoke('config:save', c),
  },
  attach: {
    save:       (taskId: string, dataBase64: string, ext: string): Promise<string> =>
      ipcRenderer.invoke('attach:save', taskId, dataBase64, ext),
    removeTask: (taskId: string): Promise<void> =>
      ipcRenderer.invoke('attach:remove-task', taskId),
  },
  events: {
    onTasksRolled: (cb: () => void): (() => void) => {
      const listener = () => cb()
      ipcRenderer.on('tasks:rolled', listener)
      return () => ipcRenderer.removeListener('tasks:rolled', listener)
    },
  },
  window: {
    enterGrid: (): Promise<void> => ipcRenderer.invoke('window:enter-grid'),
    exitGrid:  (): Promise<void> => ipcRenderer.invoke('window:exit-grid'),
    toggleTop: (): Promise<boolean> => ipcRenderer.invoke('window:toggle-top'),
    hide:      (): Promise<void> => ipcRenderer.invoke('window:hide'),
    show:      (): Promise<void> => ipcRenderer.invoke('window:show'),
    topState:  (): Promise<boolean> => ipcRenderer.invoke('window:top-state'),
    enterMove: (): Promise<void> => ipcRenderer.invoke('window:enter-move'),
    autofit:   (h: number): Promise<void> => ipcRenderer.invoke('window:autofit', h),
    onMoveMode: (cb: (on: boolean) => void): (() => void) => {
      const listener = (_: unknown, on: boolean) => cb(on)
      ipcRenderer.on('window:move-mode', listener)
      return () => ipcRenderer.removeListener('window:move-mode', listener)
    },
  },
  on: {
    viewSet: (cb: (m: string) => void): (() => void) => {
      const listener = (_: unknown, m: string) => cb(m)
      ipcRenderer.on('view:set', listener)
      return () => ipcRenderer.removeListener('view:set', listener)
    },
    quickAddOpen: (cb: () => void): (() => void) => {
      const listener = () => cb()
      ipcRenderer.on('quick-add:open', listener)
      return () => ipcRenderer.removeListener('quick-add:open', listener)
    },
  },
  shell: {
    openPath: (p: string): Promise<string> => ipcRenderer.invoke('shell:open-path', p),
  },
  app: {
    restart: (): Promise<void> => ipcRenderer.invoke('app:restart'),
    pickDir: (): Promise<string | null> => ipcRenderer.invoke('dialog:pick-dir'),
    dataDir: (): Promise<string> => ipcRenderer.invoke('paths:data-dir'),
  },
})
