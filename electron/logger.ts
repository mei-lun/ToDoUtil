import log from 'electron-log/main'
import path from 'node:path'
import { paths } from './storage/paths'

export function initLogger() {
  log.transports.file.maxSize = 5 * 1024 * 1024
  log.transports.file.resolvePathFn = () => path.join(paths().logs, 'main.log')
  log.transports.file.level = 'info'
  log.transports.console.level = 'info'
  log.initialize({ preload: true })
  log.info('ToDoUtil started')
}

export { log }
