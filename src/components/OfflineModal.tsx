import { useGame } from '../state/GameContext'

export function OfflineModal() {
  const { offlineNotice, dismissOffline } = useGame()
  if (!offlineNotice) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>離席中の進行</h2>
        <p>
          {offlineNotice.durationLabel} ぶんの進行を反映した
          {offlineNotice.capped ? '（上限まで）' : ''}。
        </p>
        <button type="button" className="btn primary" onClick={dismissOffline}>
          続ける
        </button>
      </div>
    </div>
  )
}
