import { getChallenge, getGenerator, getResource } from '../game/content'
import { canAfford } from '../game/formulas'
import { useGame } from '../state/GameContext'
import { formatNumber } from '../utils/format'
import type { ResourceId } from '../game/types'

function CostLine({
  cost,
  format,
  resources,
}: {
  cost: Partial<Record<ResourceId, number>>
  format: 'compact' | 'scientific'
  resources: Record<ResourceId, number>
}) {
  const entries = Object.entries(cost) as [ResourceId, number][]
  return (
    <span className="cost-line">
      {entries.map(([id, amount]) => {
        const ok = resources[id] >= amount
        return (
          <span key={id} className={ok ? 'cost-ok' : 'cost-ng'}>
            {getResource(id).name} {formatNumber(amount, format)}
          </span>
        )
      })}
    </span>
  )
}

export function OpsPanel() {
  const {
    state,
    click,
    buy,
    maxBuy,
    costOf,
    generatorIds,
    leaveChallenge,
  } = useGame()
  const fmt = state.settings.numberFormat
  const bulk = state.bulkBuyUnlocked || state.unlockedSystems.includes('bulkBuy')

  return (
    <section className="panel ops-panel">
      <header className="panel-header">
        <h2>運用卓</h2>
        <p>残熱を起こし、施設で流れを太くする。</p>
      </header>

      {state.activeChallenge && (
        <div className="banner challenge-banner">
          <span>
            試練進行中: {getChallenge(state.activeChallenge).name}
          </span>
          <button type="button" className="btn ghost" onClick={leaveChallenge}>
            撤退
          </button>
        </div>
      )}

      <div className="click-stage">
        <button type="button" className="ember-button" onClick={click}>
          <span className="ember-brand">ASHWAKE</span>
          <span className="ember-label">着火</span>
        </button>
        <p className="click-hint">クリックで残熱を回収</p>
      </div>

      <div className="generator-list">
        {generatorIds.map((id) => {
          const def = getGenerator(id)
          const owned = state.generators[id]
          const cost1 = costOf(id, 1)
          const affordable = canAfford(state, cost1)
          const max = bulk ? maxBuy(id) : 0

          return (
            <article key={id} className="generator-card">
              <div className="generator-main">
                <h3>{def.name}</h3>
                <p>{def.description}</p>
                <div className="generator-meta">
                  <span>保有 {owned}</span>
                  <span>
                    基礎 {formatNumber(def.baseRate, fmt)}/s · {getResource(def.produces).name}
                  </span>
                </div>
                <CostLine
                  cost={cost1}
                  format={fmt}
                  resources={state.resources}
                />
              </div>
              <div className="generator-actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={!affordable}
                  onClick={() => buy(id, 1)}
                >
                  ×1
                </button>
                {bulk && (
                  <>
                    <button
                      type="button"
                      className="btn"
                      disabled={max < 10}
                      onClick={() => buy(id, Math.min(10, max))}
                    >
                      ×10
                    </button>
                    <button
                      type="button"
                      className="btn"
                      disabled={max < 1}
                      onClick={() => buy(id, max)}
                    >
                      Max
                    </button>
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
