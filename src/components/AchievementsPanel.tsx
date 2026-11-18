import { ACHIEVEMENTS } from '../game/content'
import { useGame } from '../state/GameContext'

export function AchievementsPanel() {
  const { state } = useGame()

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>実績</h2>
        <p>
          {state.achievements.length} / {ACHIEVEMENTS.length}
        </p>
      </header>

      <div className="ach-list">
        {ACHIEVEMENTS.map((def) => {
          const earned = state.achievements.includes(def.id)
          const secretLocked = def.secret && !earned
          return (
            <article
              key={def.id}
              className={`ach-card${earned ? ' is-earned' : ''}`}
            >
              <h3>{secretLocked ? '？？？' : def.name}</h3>
              <p>{secretLocked ? '未確認の記録。' : def.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
