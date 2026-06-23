import { useEffect } from 'react'
import { useViewStore } from '../store/view-store'

export function MoveModeOverlay() {
  const moveMode = useViewStore(s => s.moveMode)
  const setMoveMode = useViewStore(s => s.setMoveMode)

  useEffect(() => {
    if (!moveMode) return
    const handler = () => {
      setTimeout(() => setMoveMode(false), 50)
    }
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [moveMode, setMoveMode])

  if (!moveMode) return null
  return (
    <div className="move-mask">
      <div className="move-hint">移动窗口（按 Esc 退出）</div>
    </div>
  )
}
