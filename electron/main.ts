import { app, BrowserWindow, protocol } from 'electron'
import path from 'node:path'
import { setDataDir } from './storage/paths'
import { loadConfig } from './config'
import { registerIpcHandlers } from './ipc-handlers'
import { resolveAttachmentPath } from './storage/attachments'
import { startScheduler, stopScheduler } from './scheduler'

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
    minHeight: 360,
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
}

app.whenReady().then(() => {
  const cfg = loadConfig()
  const dataDir = setDataDir(cfg.dataDir)
  protocol.registerFileProtocol('attachments', (request, callback) => {
    const url = request.url.replace(/^attachments:\/\//, '')
    const resolved = resolveAttachmentPath(dataDir, url)
    if (!resolved) return callback({ error: -10 }) // net::ERR_ACCESS_DENIED
    callback({ path: resolved })
  })
  registerIpcHandlers()
  createWindow()
  startScheduler()
})

app.on('before-quit', () => stopScheduler())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
