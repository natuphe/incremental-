import { useGame } from '../state/GameContext'
import type { SystemId, TabId } from '../game/types'

const BASE_TABS: { id: TabId; label: string; system?: SystemId }[] = [
  { id: 'ops', label: '運用' },
  { id: 'research', label: '研究', system: 'research' },
  { id: 'wake', label: '覚醒', system: 'wake' },
  { id: 'achievements', label: '実績', system: 'achievements' },
  { id: 'challenges', label: '試練', system: 'challenges' },
  { id: 'settings', label: '設定' },
]

export function NavTabs() {
  const { tab, setTab, state } = useGame()

  const tabs = BASE_TABS.filter((t) => {
    if (!t.system) return true
    return state.unlockedSystems.includes(t.system)
  })

  return (
    <nav className="nav-tabs" aria-label="メインナビ">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-tab${tab === t.id ? ' is-active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
