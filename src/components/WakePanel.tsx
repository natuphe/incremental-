import { useGame } from '../state/GameContext'
import { formatNumber } from '../utils/format'

export function WakePanel() {
  const { state, wake, wakePreview } = useGame()
  const canWake =
    state.unlockedSystems.includes('wake') &&
    !state.activeChallenge &&
    state.lifetimeEmber >= 1000

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>覚醒</h2>
        <p>網を整え直し、印として残す。</p>
      </header>

      <div className="wake-stats">
        <div>
          <span className="label">覚醒印</span>
          <strong>{state.wakeMarks}</strong>
        </div>
        <div>
          <span className="label">累計覚醒</span>
          <strong>{state.totalWakes}</strong>
        </div>
        <div>
          <span className="label">今回の累計残熱</span>
          <strong>
            {formatNumber(state.lifetimeEmber, state.settings.numberFormat)}
          </strong>
        </div>
      </div>

      <p className="wake-copy">
        実行すると施設と資源は初期化される。印は生産倍率へ還元される。
        予想取得: <strong>+{wakePreview}</strong>
      </p>

      <button
        type="button"
        className="btn primary wake-btn"
        disabled={!canWake}
        onClick={wake}
      >
        覚醒を実行
      </button>
      {!canWake && (
        <p className="hint">
          {state.activeChallenge
            ? '試練中は覚醒できない。'
            : '累計残熱が一定を超えると実行できる。'}
        </p>
      )}
    </section>
  )
}
