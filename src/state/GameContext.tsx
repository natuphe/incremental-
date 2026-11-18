import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  abandonChallenge,
  buyGenerator,
  buyResearch,
  clearJustUnlocked,
  createInitialState,
  hardReset,
  listChallenges,
  manualClick,
  performWake,
  startChallenge,
  updateSettings,
  visibleGenerators,
  visibleResources,
  applyTick,
} from '../game/engine'
import { computeRates, generatorCost, maxAffordable, wakeMarkGain } from '../game/formulas'
import { applyOfflineProgress, formatDuration } from '../game/offline'
import {
  clearStorage,
  loadFromStorage,
  migrateSave,
  saveToStorage,
} from '../game/save'
import type {
  ChallengeId,
  GameSettings,
  GameState,
  GeneratorId,
  Rates,
  ResearchId,
  TabId,
} from '../game/types'

export interface OfflineNotice {
  appliedMs: number
  capped: boolean
  durationLabel: string
}

interface GameContextValue {
  state: GameState
  rates: Rates
  tab: TabId
  setTab: (tab: TabId) => void
  offlineNotice: OfflineNotice | null
  dismissOffline: () => void
  click: () => void
  buy: (id: GeneratorId, amount?: number) => void
  maxBuy: (id: GeneratorId) => number
  costOf: (id: GeneratorId, amount?: number) => ReturnType<typeof generatorCost>
  research: (id: ResearchId) => void
  wake: () => void
  wakePreview: number
  beginChallenge: (id: ChallengeId) => void
  leaveChallenge: () => void
  availableChallenges: ReturnType<typeof listChallenges>
  patchSettings: (patch: Partial<GameSettings>) => void
  resetAll: () => void
  exportSave: () => string
  importSave: (json: string) => boolean
  resourceIds: ReturnType<typeof visibleResources>
  generatorIds: ReturnType<typeof visibleGenerators>
  dismissUnlocks: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

const TICK_MS = 100
const SAVE_EVERY_MS = 5000

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [tab, setTab] = useState<TabId>('ops')
  const [offlineNotice, setOfflineNotice] = useState<OfflineNotice | null>(null)
  const [ready, setReady] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  // 初回ロード + オフライン適用
  useEffect(() => {
    const loaded = loadFromStorage()
    if (loaded) {
      const result = applyOfflineProgress(loaded)
      setState(result.state)
      if (result.appliedMs >= 1000) {
        setOfflineNotice({
          appliedMs: result.appliedMs,
          capped: result.capped,
          durationLabel: formatDuration(result.appliedMs),
        })
      }
    }
    setReady(true)
  }, [])

  // ゲームループ
  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => {
      setState((prev) => applyTick(prev, TICK_MS / 1000))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [ready])

  // 自動セーブ
  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => {
      saveToStorage(stateRef.current)
    }, SAVE_EVERY_MS)
    return () => window.clearInterval(id)
  }, [ready])

  // タブを閉じる直前にも保存
  useEffect(() => {
    const onHide = () => saveToStorage(stateRef.current)
    window.addEventListener('beforeunload', onHide)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide()
    })
    return () => window.removeEventListener('beforeunload', onHide)
  }, [])

  const rates = useMemo(() => computeRates(state), [state])

  const click = useCallback(() => {
    setState((s) => manualClick(s))
  }, [])

  const buy = useCallback((id: GeneratorId, amount = 1) => {
    setState((s) => buyGenerator(s, id, amount))
  }, [])

  const maxBuy = useCallback(
    (id: GeneratorId) => maxAffordable(state, id),
    [state],
  )

  const costOf = useCallback(
    (id: GeneratorId, amount = 1) => generatorCost(state, id, amount),
    [state],
  )

  const research = useCallback((id: ResearchId) => {
    setState((s) => buyResearch(s, id))
  }, [])

  const wake = useCallback(() => {
    setState((s) => performWake(s))
  }, [])

  const beginChallenge = useCallback((id: ChallengeId) => {
    setState((s) => startChallenge(s, id))
    setTab('ops')
  }, [])

  const leaveChallenge = useCallback(() => {
    setState((s) => abandonChallenge(s))
  }, [])

  const patchSettings = useCallback((patch: Partial<GameSettings>) => {
    setState((s) => updateSettings(s, patch))
  }, [])

  const resetAll = useCallback(() => {
    const settings = stateRef.current.settings
    clearStorage()
    setState(hardReset(settings))
    setTab('ops')
    setOfflineNotice(null)
  }, [])

  const exportSave = useCallback(() => {
    return JSON.stringify(stateRef.current)
  }, [])

  const importSave = useCallback((json: string) => {
    try {
      const parsed: unknown = JSON.parse(json)
      const migrated = migrateSave(parsed)
      setState(migrated)
      saveToStorage(migrated)
      return true
    } catch {
      return false
    }
  }, [])

  const dismissUnlocks = useCallback(() => {
    setState((s) => clearJustUnlocked(s))
  }, [])

  const value: GameContextValue = {
    state,
    rates,
    tab,
    setTab,
    offlineNotice,
    dismissOffline: () => setOfflineNotice(null),
    click,
    buy,
    maxBuy,
    costOf,
    research,
    wake,
    wakePreview: wakeMarkGain(state),
    beginChallenge,
    leaveChallenge,
    availableChallenges: listChallenges(state),
    patchSettings,
    resetAll,
    exportSave,
    importSave,
    resourceIds: visibleResources(state),
    generatorIds: visibleGenerators(state),
    dismissUnlocks,
  }

  if (!ready) {
    return <div className="boot">ASHWAKE を起動中…</div>
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame は GameProvider 内で使う')
  return ctx
}
