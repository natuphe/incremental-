import { useGame } from '../state/GameContext'

export function ChallengesPanel() {
  const {
    state,
    availableChallenges,
    beginChallenge,
    leaveChallenge,
  } = useGame()

  if (!state.unlockedSystems.includes('challenges')) {
    return (
      <section className="panel">
        <header className="panel-header">
          <h2>試練</h2>
          <p>まだ門は閉じている。</p>
        </header>
      </section>
    )
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>試練</h2>
        <p>制約付きで網を組み直す。</p>
      </header>

      {state.activeChallenge && (
        <div className="banner challenge-banner">
          <span>進行中の試練あり</span>
          <button type="button" className="btn ghost" onClick={leaveChallenge}>
            撤退して戻る
          </button>
        </div>
      )}

      <div className="challenge-list">
        {availableChallenges.map((ch) => {
          const cleared = state.clearedChallenges.includes(ch.id)
          return (
            <article key={ch.id} className="challenge-card">
              <div>
                <h3>{ch.name}</h3>
                <p>{ch.description}</p>
                <p className="hint">報酬: 覚醒印 +{ch.rewardWakeMarks}</p>
              </div>
              <button
                type="button"
                className="btn primary"
                disabled={
                  cleared ||
                  !!state.activeChallenge ||
                  state.clearedChallenges.includes(ch.id)
                }
                onClick={() => beginChallenge(ch.id)}
              >
                {cleared ? '達成済' : '開始'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
