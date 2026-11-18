import { useEffect } from 'react'
import { systemLabel } from '../game/content'
import { useGame } from '../state/GameContext'

export function UnlockToast() {
  const { state, dismissUnlocks } = useGame()
  const items = state.justUnlocked

  useEffect(() => {
    if (items.length === 0) return
    const id = window.setTimeout(() => dismissUnlocks(), 4200)
    return () => window.clearTimeout(id)
  }, [items, dismissUnlocks])

  if (items.length === 0) return null

  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((id) => (
        <div key={id} className="toast">
          解放: {systemLabel(id)}
        </div>
      ))}
    </div>
  )
}
