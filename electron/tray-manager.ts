import { Tray, Menu, app, nativeImage, BrowserWindow } from 'electron'
import path from 'node:path'
import { getMainWindow, hideMain, showMain, toggleAlwaysOnTop } from './window-manager'
import { listPool } from './storage/pool-repo'

let tray: Tray | null = null

export function createTray() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'tray-icon.png')
    : path.join(__dirname, '../electron/assets/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)
  tray.setToolTip('ToDoUtil')

  tray.on('click', () => {
    const win = getMainWindow()
    if (!win) return
    win.isVisible() ? hideMain() : showMain()
  })

  refreshMenu()
}

export function refreshMenu() {
  if (!tray) return
  const win = getMainWindow()
  const top = win?.isAlwaysOnTop() ?? false
  const poolCount = listPool().length

  const menu = Menu.buildFromTemplate([
    {
      label: '＋ 快速添加任务…',
      click: () => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('quick-add:open')),
    },
    { type: 'separator' },
    { label: '显示主窗口', click: () => showMain() },
    {
      label: '↔ 移动窗口',
      click: () => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('window:move-mode', true)),
    },
    {
      label: '钉在桌面',
      type: 'checkbox',
      checked: top,
      click: () => { toggleAlwaysOnTop(); refreshMenu() },
    },
    { type: 'separator' },
    {
      label: `📥 搁置池 (${poolCount})`,
      click: () => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('view:set', 'pool')),
    },
    {
      label: '📚 归档',
      click: () => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('view:set', 'archive')),
    },
    {
      label: '⚙ 设置',
      click: () => BrowserWindow.getAllWindows().forEach(w => w.webContents.send('view:set', 'settings')),
    },
    { type: 'separator' },
    { label: '关于', click: () => app.showAboutPanel?.() },
    { label: '退出', click: () => app.quit() },
  ])
  tray.setContextMenu(menu)
}

export function destroyTray() {
  tray?.destroy()
  tray = null
}
