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
})
