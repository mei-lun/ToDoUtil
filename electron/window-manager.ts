import { BrowserWindow, screen } from 'electron'
import { loadConfig, saveConfig } from './config'

let mainWindow: BrowserWindow | null = null
let prevBoundsBeforeGrid: { width: number; height: number; x: number; y: number } | null = null

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
  win.on('move', persistBounds)
  win.on('resize', persistBounds)
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function persistBounds() {
  if (!mainWindow) return
  const [w, h] = mainWindow.getSize()
  const [x, y] = mainWindow.getPosition()
  const cfg = loadConfig()
  if (prevBoundsBeforeGrid) {
    // 在 grid 模式中，保存到 archiveGridBounds，不要覆盖窄态的 windowBounds
    saveConfig({ ...cfg, archiveGridBounds: { width: w, height: h } })
  } else {
    saveConfig({ ...cfg, windowBounds: { width: w, height: h, x, y } })
  }
}

export function enterGridWidth() {
  if (!mainWindow) return
  if (prevBoundsBeforeGrid) return // 已在 grid 模式
  const [w, h] = mainWindow.getSize()
  const [x, y] = mainWindow.getPosition()
  prevBoundsBeforeGrid = { width: w, height: h, x, y }
  const cfg = loadConfig()
  const gridW = cfg.archiveGridBounds?.width ?? 720
  const gridH = cfg.archiveGridBounds?.height ?? h
  mainWindow.setBounds({ width: gridW, height: gridH, x, y })
}

export function exitGridWidth() {
  if (!mainWindow || !prevBoundsBeforeGrid) return
  const [curW, curH] = mainWindow.getSize()
  const cfg = loadConfig()
  saveConfig({ ...cfg, archiveGridBounds: { width: curW, height: curH } })
  const restore = prevBoundsBeforeGrid
  prevBoundsBeforeGrid = null
  mainWindow.setBounds(restore)
}

export function toggleAlwaysOnTop(): boolean {
  if (!mainWindow) return false
  const next = !mainWindow.isAlwaysOnTop()
  mainWindow.setAlwaysOnTop(next)
  const cfg = loadConfig()
  saveConfig({ ...cfg, alwaysOnTop: next })
  return next
}

export function ensureOnScreen(win: BrowserWindow) {
  const { workArea } = screen.getPrimaryDisplay()
  const b = win.getBounds()
  const outside =
    b.x + b.width < workArea.x + 50 ||
    b.x > workArea.x + workArea.width - 50 ||
    b.y < workArea.y ||
    b.y > workArea.y + workArea.height - 50
  if (outside) {
    win.setBounds({
      x: workArea.x + Math.floor((workArea.width - b.width) / 2),
      y: workArea.y + Math.floor((workArea.height - b.height) / 2),
      width: b.width,
      height: b.height,
    })
  }
}
