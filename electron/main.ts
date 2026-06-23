import { app, BrowserWindow, protocol } from 'electron'
import path from 'node:path'
import { setDataDir } from './storage/paths'
import { loadConfig } from './config'
import { registerIpcHandlers } from './ipc-handlers'
import { resolveAttachmentPath } from './storage/attachments'
import { runDailyBackup, cleanOldBackups } from './storage/backup-service'
import { initLogger, log } from './logger'
import { startScheduler, stopScheduler } from './scheduler'
import { setMainWindow, ensureOnScreen } from './window-manager'
import { createTray, destroyTray } from './tray-manager'
import { registerShortcut, unregisterAll } from './shortcut-manager'

const isDev = !app.isPackaged

function createWindow() {
  const cfg = loadConfig()
  const win = new BrowserWindow({
    width: cfg.windowBounds.width,
    height: cfg.windowBounds.height,
    x: cfg.windowBounds.x,
    y: cfg.windowBounds.y,
    frame: false,
    transparent: false,
    resizable: true,
    minWidth: 240,
    minHeight: 180,
    alwaysOnTop: cfg.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.on('close', (e) => {
    if (!(app as unknown as { isQuiting?: boolean }).isQuiting) {
      e.preventDefault()
      win.hide()
    }
  })

  setMainWindow(win)
  ensureOnScreen(win)
}

app.whenReady().then(() => {
  const cfg = loadConfig()
  const dataDir = setDataDir(cfg.dataDir)
  initLogger()
  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()
  try {
    runDailyBackup(today)
    cleanOldBackups(today, cfg.backupRetentionDays)
  } catch (err) {
    console.error('backup failed', err)
  }
  protocol.registerFileProtocol('attachments', (request, callback) => {
    const url = request.url.replace(/^attachments:\/\//, '')
    const resolved = resolveAttachmentPath(dataDir, url)
    if (!resolved) return callback({ error: -10 }) // net::ERR_ACCESS_DENIED
    callback({ path: resolved })
  })
  registerIpcHandlers()
  createWindow()
  startScheduler()
  createTray()
  const res = registerShortcut()
  if (!res.ok) log.warn(`Failed to register global shortcut: ${res.accelerator}`)
})

app.on('before-quit', () => {
  ;(app as unknown as { isQuiting?: boolean }).isQuiting = true
  unregisterAll()
  destroyTray()
  stopScheduler()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
