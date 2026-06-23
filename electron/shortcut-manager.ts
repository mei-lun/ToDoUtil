import { globalShortcut, BrowserWindow } from 'electron'
import { loadConfig } from './config'
import { showMain } from './window-manager'

let currentAccelerator: string | null = null

export function registerShortcut(): { ok: boolean; accelerator: string } {
  if (currentAccelerator) globalShortcut.unregister(currentAccelerator)
  const cfg = loadConfig()
  const accel = cfg.shortcut
  const ok = globalShortcut.register(accel, () => {
    showMain()
    BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('quick-add:open'))
  })
  if (ok) currentAccelerator = accel
  return { ok, accelerator: accel }
}

export function unregisterAll() {
  globalShortcut.unregisterAll()
  currentAccelerator = null
}
