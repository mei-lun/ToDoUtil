import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { setDataDir } from '../../electron/storage/paths'
import { loadConfig, saveConfig } from '../../electron/config'
import { DEFAULT_CONFIG } from '../../src/types'

let tmp: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'todoutil-cfg-'))
  setDataDir(tmp)
})
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('config', () => {
  it('loadConfig returns defaults when missing', () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG)
  })

  it('round-trips changes', () => {
    saveConfig({ ...DEFAULT_CONFIG, alwaysOnTop: false })
    expect(loadConfig().alwaysOnTop).toBe(false)
  })

  it('merges missing keys with defaults', () => {
    fs.writeFileSync(path.join(tmp, 'config.json'), JSON.stringify({ shortcut: 'X' }))
    const cfg = loadConfig()
    expect(cfg.shortcut).toBe('X')
    expect(cfg.alwaysOnTop).toBe(DEFAULT_CONFIG.alwaysOnTop)
  })
})
