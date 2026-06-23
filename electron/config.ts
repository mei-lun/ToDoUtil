import { atomicWriteJson, readJsonOr } from './storage/atomic-write'
import { paths } from './storage/paths'
import { DEFAULT_CONFIG, type Config } from '../src/types'

export function loadConfig(): Config {
  const raw = readJsonOr<Partial<Config>>(paths().config, {})
  return { ...DEFAULT_CONFIG, ...raw }
}

export function saveConfig(cfg: Config): void {
  atomicWriteJson(paths().config, cfg)
}
