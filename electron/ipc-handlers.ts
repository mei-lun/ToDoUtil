import { ipcMain, BrowserWindow, app, dialog, shell } from 'electron'
import * as tasksRepo from './storage/tasks-repo'
import * as poolRepo from './storage/pool-repo'
import * as archiveRepo from './storage/archive-repo'
import * as att from './storage/attachments'
import { loadConfig, saveConfig } from './config'
import { getDataDir } from './storage/paths'
import { enterGridWidth, exitGridWidth, toggleAlwaysOnTop, hideMain, showMain, isAlwaysOnTop } from './window-manager'
import type { Task, Config } from '../src/types'

export function registerIpcHandlers() {
  ipcMain.handle('tasks:list',    () => tasksRepo.listTasks())
  ipcMain.handle('tasks:upsert',  (_e, t: Task) => tasksRepo.upsertTask(t))
  ipcMain.handle('tasks:delete',  (_e, id: string) => tasksRepo.deleteTask(id))
  ipcMain.handle('tasks:bulk',    (_e, ts: Task[]) => tasksRepo.bulkReplace(ts))

  ipcMain.handle('pool:list',     () => poolRepo.listPool())
  ipcMain.handle('pool:add',      (_e, t: Task) => poolRepo.addToPool(t))
  ipcMain.handle('pool:remove',   (_e, id: string) => poolRepo.removeFromPool(id))

  ipcMain.handle('archive:list',  () => archiveRepo.listArchive())
  ipcMain.handle('archive:append',(_e, t: Task) => archiveRepo.appendToArchive(t))
  ipcMain.handle('archive:search',(_e, q: string) => archiveRepo.searchArchive(q))

  ipcMain.handle('config:load',   () => loadConfig())
  ipcMain.handle('config:save',   (_e, c: Config) => saveConfig(c))

  ipcMain.handle('attach:save', (_e, taskId: string, dataBase64: string, ext: string) => {
    const buf = Buffer.from(dataBase64, 'base64')
    return att.saveImageBuffer(taskId, buf, ext)
  })
  ipcMain.handle('attach:remove-task', (_e, taskId: string) => att.removeTaskAttachments(taskId))

  ipcMain.handle('window:enter-grid', () => enterGridWidth())
  ipcMain.handle('window:exit-grid', () => exitGridWidth())
  ipcMain.handle('window:toggle-top', () => toggleAlwaysOnTop())
  ipcMain.handle('window:hide', () => hideMain())
  ipcMain.handle('window:show', () => showMain())
  ipcMain.handle('window:top-state', () => isAlwaysOnTop())
  ipcMain.handle('window:enter-move', () => {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('window:move-mode', true))
  })

  ipcMain.handle('shell:open-path', (_e, p: string) => shell.openPath(p))
  ipcMain.handle('app:restart', () => { app.relaunch(); app.exit(0) })
  ipcMain.handle('dialog:pick-dir', async () => {
    const r = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return r.canceled ? null : r.filePaths[0]
  })
  ipcMain.handle('paths:data-dir', () => getDataDir())
}
