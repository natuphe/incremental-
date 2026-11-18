import { AchievementsPanel } from './components/AchievementsPanel'
import { ChallengesPanel } from './components/ChallengesPanel'
import { NavTabs } from './components/NavTabs'
import { OfflineModal } from './components/OfflineModal'
import { OpsPanel } from './components/OpsPanel'
import { ResearchPanel } from './components/ResearchPanel'
import { ResourceBar } from './components/ResourceBar'
import { SettingsPanel } from './components/SettingsPanel'
import { UnlockToast } from './components/UnlockToast'
import { WakePanel } from './components/WakePanel'
import { useGame } from './state/GameContext'

function MainPanel() {
  const { tab } = useGame()

  switch (tab) {
    case 'ops':
      return <OpsPanel />
    case 'research':
      return <ResearchPanel />
    case 'wake':
      return <WakePanel />
    case 'achievements':
      return <AchievementsPanel />
    case 'challenges':
      return <ChallengesPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <OpsPanel />
  }
}

export default function App() {
  const { state } = useGame()
  const reduce = state.settings.reduceMotion

  return (
    <div className={`app-shell${reduce ? ' reduce-motion' : ''}`}>
      <div className="bg-atmosphere" aria-hidden="true" />
      <header className="top-bar">
        <div className="brand-block">
          <p className="brand">ASHWAKE</p>
          <p className="brand-sub">残熱を起こし、沈黙した網を繋ぎ直す</p>
        </div>
        {state.endingReached && (
          <p className="ending-flag" title="回路は閉じた">
            信号: 安定
          </p>
        )}
      </header>

      <ResourceBar />
      <NavTabs />
      <main className="main-stage">
        <MainPanel />
      </main>

      <OfflineModal />
      <UnlockToast />
    </div>
  )
}
