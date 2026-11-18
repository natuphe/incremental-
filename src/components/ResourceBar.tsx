import { getResource } from '../game/content'
import { useGame } from '../state/GameContext'
import { formatNumber, formatRate } from '../utils/format'

export function ResourceBar() {
  const { state, rates, resourceIds } = useGame()
  const fmt = state.settings.numberFormat

  return (
    <div className="resource-bar" aria-label="資源">
      {resourceIds.map((id) => {
        const def = getResource(id)
        const rate = rates.perSecond[id]
        return (
          <div key={id} className="resource-chip">
            <span className="resource-name">{def.name}</span>
            <span className="resource-value">
              {formatNumber(state.resources[id], fmt)}
            </span>
            <span className={`resource-rate${rate > 0 ? ' is-positive' : ''}`}>
              {rate > 0 ? formatRate(rate, fmt) : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
