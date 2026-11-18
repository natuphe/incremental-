import {
  ACHIEVEMENTS,
  CHALLENGES,
  GENERATOR_IDS,
  RESOURCE_IDS,
  getChallenge,
  getResearch,
} from './content'
import {
  canAfford,
  clickGain,
  computeRates,
  generatorCost,
  isGeneratorUnlocked,
  isResearchAvailable,
  payCost,
  wakeMarkGain,
} from './formulas'
import type {
  ChallengeId,
  GameSettings,
  GameState,
  GeneratorId,
  ResearchId,
  ResourceId,
  SystemId,
} from './types'
import { SAVE_VERSION } from './types'

function zeroResources(): Record<ResourceId, number> {
  return {
    ember: 0,
    ash: 0,
    coil: 0,
    flux: 0,
    echo: 0,
    nullShard: 0,
  }
}

function zeroGenerators(): Record<GeneratorId, number> {
  return {
    kindler: 0,
    vent: 0,
    furnace: 0,
    lattice: 0,
    resonator: 0,
    conduit: 0,
    archive: 0,
    nullWell: 0,
  }
}

export function createInitialState(
  overrides: Partial<GameState> = {},
): GameState {
  const now = Date.now()
  return {
    version: SAVE_VERSION,
    createdAt: now,
    lastTickAt: now,
    resources: { ...zeroResources(), ember: 0 },
    generators: zeroGenerators(),
    researched: [],
    unlockedSystems: ['generators', 'research', 'achievements'],
    achievements: [],
    wakeMarks: 0,
    totalWakes: 0,
    lifetimeEmber: 0,
    clickPower: 1,
    globalMult: 1,
    offlineCapHours: 4,
    bulkBuyUnlocked: false,
    activeChallenge: null,
    clearedChallenges: [],
    endingReached: false,
    settings: {
      numberFormat: 'compact',
      reduceMotion: false,
    },
    justUnlocked: [],
    ...overrides,
  }
}

function unlockSystem(state: GameState, id: SystemId): GameState {
  if (state.unlockedSystems.includes(id)) return state
  return {
    ...state,
    unlockedSystems: [...state.unlockedSystems, id],
    justUnlocked: [...state.justUnlocked, id],
    bulkBuyUnlocked: id === 'bulkBuy' ? true : state.bulkBuyUnlocked,
  }
}

export function clearJustUnlocked(state: GameState): GameState {
  if (state.justUnlocked.length === 0) return state
  return { ...state, justUnlocked: [] }
}

export function evaluateAchievements(state: GameState): GameState {
  let changed = false
  const earned = [...state.achievements]
  for (const def of ACHIEVEMENTS) {
    if (earned.includes(def.id)) continue
    if (def.check(state)) {
      earned.push(def.id)
      changed = true
    }
  }
  if (!changed) return state
  return { ...state, achievements: earned }
}

export function applyTick(state: GameState, dtSeconds: number): GameState {
  if (dtSeconds <= 0) return state
  const rates = computeRates(state)
  const resources = { ...state.resources }
  let lifetimeEmber = state.lifetimeEmber

  for (const id of RESOURCE_IDS) {
    const gain = rates.perSecond[id] * dtSeconds
    if (gain === 0) continue
    resources[id] += gain
    if (id === 'ember') lifetimeEmber += gain
  }

  let next: GameState = {
    ...state,
    resources,
    lifetimeEmber,
    lastTickAt: state.lastTickAt + dtSeconds * 1000,
  }

  next = checkChallengeClear(next)
  next = evaluateAchievements(next)
  return next
}

export function manualClick(state: GameState): GameState {
  const gain = clickGain(state)
  const resources = {
    ...state.resources,
    ember: state.resources.ember + gain,
  }
  let next: GameState = {
    ...state,
    resources,
    lifetimeEmber: state.lifetimeEmber + gain,
  }
  next = evaluateAchievements(next)
  return next
}

export function buyGenerator(
  state: GameState,
  id: GeneratorId,
  amount = 1,
): GameState {
  if (amount <= 0) return state
  if (!isGeneratorUnlocked(state, id)) return state
  const cost = generatorCost(state, id, amount)
  if (!canAfford(state, cost)) return state

  let next = payCost(state, cost)
  next = {
    ...next,
    generators: {
      ...next.generators,
      [id]: next.generators[id] + amount,
    },
  }
  return evaluateAchievements(next)
}

export function buyResearch(state: GameState, id: ResearchId): GameState {
  if (!isResearchAvailable(state, id)) return state
  const def = getResearch(id)
  let next = payCost(state, def.cost)
  next = {
    ...next,
    researched: [...next.researched, id],
  }

  for (const sys of def.unlocksSystems ?? []) {
    next = unlockSystem(next, sys)
  }

  if (id === 'finalCircuit') {
    next = { ...next, endingReached: true }
  }

  return evaluateAchievements(next)
}

export function performWake(state: GameState): GameState {
  if (!state.unlockedSystems.includes('wake')) return state
  if (state.activeChallenge) return state
  if (state.lifetimeEmber < 1000) return state

  const marks = wakeMarkGain(state)
  const preserved: Pick<
    GameState,
    | 'wakeMarks'
    | 'totalWakes'
    | 'settings'
    | 'achievements'
    | 'clearedChallenges'
    | 'endingReached'
    | 'createdAt'
  > = {
    wakeMarks: state.wakeMarks + marks,
    totalWakes: state.totalWakes + 1,
    settings: state.settings,
    achievements: state.achievements,
    clearedChallenges: state.clearedChallenges,
    endingReached: state.endingReached,
    createdAt: state.createdAt,
  }

  let next = createInitialState({
    ...preserved,
    unlockedSystems: ['generators', 'research', 'achievements', 'wake'],
  })

  // 過去に解放した主要系統は再解放（進行の摩擦を減らす）
  if (state.unlockedSystems.includes('ash')) {
    next = unlockSystem(next, 'ash')
  }
  if (state.totalWakes + 1 >= 2) {
    next = unlockSystem(next, 'coil')
  }
  if (state.researched.includes('wakeProtocol')) {
    // プロトコル自体は再取得が必要だが、タブは残す
  }

  next = evaluateAchievements(next)
  return next
}

export function startChallenge(
  state: GameState,
  id: ChallengeId,
): GameState {
  if (!state.unlockedSystems.includes('challenges')) return state
  if (state.activeChallenge) return state
  if (state.clearedChallenges.includes(id)) return state

  const def = getChallenge(id)
  if (!state.researched.includes(def.unlockResearch)) return state

  const preserved = {
    wakeMarks: state.wakeMarks,
    totalWakes: state.totalWakes,
    settings: state.settings,
    achievements: state.achievements,
    clearedChallenges: state.clearedChallenges,
    endingReached: state.endingReached,
    createdAt: state.createdAt,
    researched: [...state.researched],
    unlockedSystems: [...state.unlockedSystems],
    bulkBuyUnlocked: state.bulkBuyUnlocked,
    offlineCapHours: state.offlineCapHours,
    clickPower: state.clickPower,
    globalMult: state.globalMult,
  }

  let next = createInitialState({
    ...preserved,
    activeChallenge: id,
  })
  next = evaluateAchievements(next)
  return next
}

export function abandonChallenge(state: GameState): GameState {
  if (!state.activeChallenge) return state
  return {
    ...createInitialState({
      wakeMarks: state.wakeMarks,
      totalWakes: state.totalWakes,
      settings: state.settings,
      achievements: state.achievements,
      clearedChallenges: state.clearedChallenges,
      endingReached: state.endingReached,
      createdAt: state.createdAt,
      researched: state.researched,
      unlockedSystems: state.unlockedSystems,
      bulkBuyUnlocked: state.bulkBuyUnlocked,
    }),
    activeChallenge: null,
  }
}

function checkChallengeClear(state: GameState): GameState {
  if (!state.activeChallenge) return state
  const def = getChallenge(state.activeChallenge)
  if (state.resources.ember < def.goalEmber) return state
  if (state.clearedChallenges.includes(def.id)) {
    return { ...state, activeChallenge: null }
  }

  return {
    ...state,
    activeChallenge: null,
    clearedChallenges: [...state.clearedChallenges, def.id],
    wakeMarks: state.wakeMarks + def.rewardWakeMarks,
  }
}

export function updateSettings(
  state: GameState,
  patch: Partial<GameSettings>,
): GameState {
  return {
    ...state,
    settings: { ...state.settings, ...patch },
  }
}

export function hardReset(settings?: GameSettings): GameState {
  return createInitialState(settings ? { settings } : {})
}

export function visibleResources(state: GameState): ResourceId[] {
  return RESOURCE_IDS.filter((id) => {
    if (id === 'ember') return true
    const map: Partial<Record<ResourceId, SystemId>> = {
      ash: 'ash',
      coil: 'coil',
      flux: 'flux',
      echo: 'echo',
      nullShard: 'nullShard',
    }
    const sys = map[id]
    return sys ? state.unlockedSystems.includes(sys) : false
  })
}

export function visibleGenerators(state: GameState): GeneratorId[] {
  return GENERATOR_IDS.filter((id) => isGeneratorUnlocked(state, id))
}

export function listChallenges(state: GameState) {
  if (!state.unlockedSystems.includes('challenges')) return []
  return CHALLENGES.filter((c) =>
    state.researched.includes(c.unlockResearch),
  )
}
