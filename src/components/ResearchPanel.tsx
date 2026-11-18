import { RESEARCH, getResource } from '../game/content'
import { canAfford, isResearchVisible } from '../game/formulas'
import { useGame } from '../state/GameContext'
import { formatNumber } from '../utils/format'
import type { ResourceId } from '../game/types'

export function ResearchPanel() {
  const { state, research } = useGame()
  const fmt = state.settings.numberFormat

  const items = RESEARCH.filter((r) => isResearchVisible(state, r.id))

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>研究卓</h2>
        <p>知見を開き、次の層へ踏み込む。</p>
      </header>

      <div className="research-list">
        {items.map((def) => {
          const done = state.researched.includes(def.id)
          const affordable = canAfford(state, def.cost)
          const entries = Object.entries(def.cost) as [ResourceId, number][]

          return (
            <article
              key={def.id}
              className={`research-card${done ? ' is-done' : ''}${def.hidden && !done ? ' is-hidden' : ''}`}
            >
              <div>
                <h3>
                  {def.name}
                  {def.hidden ? <span className="tag">未分類</span> : null}
                </h3>
                <p>{done ? def.description : def.hidden ? '……索引の余白。' : def.description}</p>
                {!done && (
                  <div className="cost-line">
                    {entries.map(([id, amount]) => (
                      <span
                        key={id}
                        className={
                          state.resources[id] >= amount ? 'cost-ok' : 'cost-ng'
                        }
                      >
                        {getResource(id).name} {formatNumber(amount, fmt)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn primary"
                disabled={done || !affordable}
                onClick={() => research(def.id)}
              >
                {done ? '完了' : '研究'}
              </button>
            </article>
          )
        })}
        {items.length === 0 && (
          <p className="empty">いま進められる研究はない。</p>
        )}
      </div>
    </section>
  )
}
