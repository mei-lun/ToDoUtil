import type { Task, Config } from './types'

interface Api {
  tasks: {
    list(): Promise<Task[]>
    upsert(t: Task): Promise<void>
    delete(id: string): Promise<void>
    bulk(ts: Task[]): Promise<void>
  }
  pool: {
    list(): Promise<Task[]>
    add(t: Task): Promise<void>
    remove(id: string): Promise<void>
  }
  archive: {
    list(): Promise<Task[]>
    append(t: Task): Promise<void>
    search(q: string): Promise<Task[]>
  }
  config: {
    load(): Promise<Config>
    save(c: Config): Promise<void>
  }
  attach: {
    save(taskId: string, dataBase64: string, ext: string): Promise<string>
    removeTask(taskId: string): Promise<void>
  }
  events: {
    onTasksRolled(cb: () => void): () => void
  }
  window: {
    enterGrid(): Promise<void>
    exitGrid(): Promise<void>
    toggleTop(): Promise<boolean>
  }
}

declare global {
  interface Window { api: Api }
}

export const api: Api = window.api
