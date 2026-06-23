import { useEffect, useState } from 'react'
import { useViewStore } from '../store/view-store'
import { useConfigStore } from '../store/config-store'
import { api } from '../api'

export function SettingsView() {
  const setMode = useViewStore(s => s.setMode)
  const cfg = useConfigStore(s => s.cfg)
  const load = useConfigStore(s => s.load)
  const update = useConfigStore(s => s.update)
  const [shortcutDraft, setShortcutDraft] = useState(cfg.shortcut)

  useEffect(() => { load() }, [load])
  useEffect(() => { setShortcutDraft(cfg.shortcut) }, [cfg.shortcut])

  function recordShortcut(e: React.KeyboardEvent) {
    e.preventDefault()
    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    const k = e.key
    const isModifier = ['Control', 'Meta', 'Alt', 'Shift'].includes(k)
    if (!isModifier) parts.push(k.length === 1 ? k.toUpperCase() : k)
    // require at least one modifier AND one non-modifier
    if (parts.length >= 2 && !isModifier) setShortcutDraft(parts.join('+'))
  }

  return (
    <div className="settings-view">
      <div className="subview-bar">
        <button className="icon-btn" onClick={() => setMode('date')}>◀ 返回</button>
        <span className="date-label">设置</span>
      </div>
      <div className="settings-body">
        <section>
          <h3>窗口</h3>
          <label className="row">
            <input
              type="checkbox"
              checked={cfg.alwaysOnTop}
              onChange={(e) => update({ alwaysOnTop: e.target.checked })}
            />
            启动时总在最前
          </label>
          <label className="row disabled">
            <input type="checkbox" disabled />
            沉浸模式（V2）
          </label>
        </section>

        <section>
          <h3>快捷键</h3>
          <div className="row">
            <span>全局添加任务：</span>
            <input
              className="shortcut-input"
              value={shortcutDraft}
              onKeyDown={recordShortcut}
              onChange={() => { /* keyDown owns the value */ }}
              readOnly
              placeholder="点击此处按下组合键"
            />
            <button onClick={async () => {
              if (shortcutDraft === cfg.shortcut) return
              await update({ shortcut: shortcutDraft })
              await api.app.restart()
            }}>保存并重启</button>
          </div>
        </section>

        <section>
          <h3>数据</h3>
          <div className="row">数据目录：<code>{cfg.dataDir}</code></div>
          <div className="row">
            <button onClick={async () => {
              const dir = await api.app.pickDir()
              if (dir) { await update({ dataDir: dir }); await api.app.restart() }
            }}>选择目录…</button>
            <button onClick={async () => {
              const dir = await api.app.dataDir()
              await api.shell.openPath(dir)
            }}>
              打开目录
            </button>
          </div>
          <div className="row">
            <span>保留备份天数：</span>
            <input
              type="number"
              min={1}
              max={365}
              value={cfg.backupRetentionDays}
              onChange={(e) => update({ backupRetentionDays: Number(e.target.value) })}
            />
          </div>
        </section>

        <section>
          <h3>关于</h3>
          <div className="row">ToDoUtil v0.1.0</div>
        </section>
      </div>
    </div>
  )
}
