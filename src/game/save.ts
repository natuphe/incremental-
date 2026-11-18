import { createInitialState } from './engine'
import type { GameState, ResourceId, GeneratorId, ResearchId, AchievementId, ChallengeId, SystemId, GameSettings } from './types'
import { SAVE_KEY, SAVE_VERSION } from './types'
import { RESOURCE_IDS, GENERATOR_IDS } from './content'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asStringArray<T extends string>(value: unknown): T[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is T => typeof v === 'string') as T[]
}

function parseResources(raw: unknown): Record<ResourceId, number> {
  const base = createInitialState().resources
  if (!isObject(raw)) return base
  for (const id of RESOURCE_IDS) {
    base[id] = Math.max(0, asNumber(raw[id], 0))
  }
  return base
}

function parseGenerators(raw: unknown): Record<GeneratorId, number> {
  const base = createInitialState().generators
  if (!isObject(raw)) return base
  for (const id of GENERATOR_IDS) {
    base[id] = Math.max(0, Math.floor(asNumber(raw[id], 0)))
  }
  return base
}

function parseSettings(raw: unknown): GameSettings {
  const defaults = createInitialState().settings
  if (!isObject(raw)) return defaults
  return {
    numberFormat:
      raw.numberFormat === 'scientific' ? 'scientific' : 'compact',
    reduceMotion: asBool(raw.reduceMotion, false),
  }
}

/** 未知フィールドを落とし、欠けを初期値で埋める */
export function migrateSave(raw: unknown): GameState {
  const fresh = createInitialState()
  if (!isObject(raw)) return fresh

  const version = asNumber(raw.version, 0)
  if (version > SAVE_VERSION) {
    // 将来バージョンは読めないので新規開始相当
    return fresh
  }

  const activeChallenge =
    typeof raw.activeChallenge === 'string'
      ? (raw.activeChallenge as ChallengeId)
      : null

  return {
    version: SAVE_VERSION,
    createdAt: asNumber(raw.createdAt, fresh.createdAt),
    lastTickAt: asNumber(raw.lastTickAt, Date.now()),
    resources: parseResources(raw.resources),
    generators: parseGenerators(raw.generators),
    researched: asStringArray<ResearchId>(raw.researched),
    unlockedSystems: asStringArray<SystemId>(raw.unlockedSystems).length
      ? asStringArray<SystemId>(raw.unlockedSystems)
      : fresh.unlockedSystems,
    achievements: asStringArray<AchievementId>(raw.achievements),
    wakeMarks: Math.max(0, Math.floor(asNumber(raw.wakeMarks, 0))),
    totalWakes: Math.max(0, Math.floor(asNumber(raw.totalWakes, 0))),
    lifetimeEmber: Math.max(0, asNumber(raw.lifetimeEmber, 0)),
    clickPower: Math.max(1, asNumber(raw.clickPower, 1)),
    globalMult: Math.max(0.01, asNumber(raw.globalMult, 1)),
    offlineCapHours: Math.max(1, asNumber(raw.offlineCapHours, 4)),
    bulkBuyUnlocked: asBool(raw.bulkBuyUnlocked, false),
    activeChallenge,
    clearedChallenges: asStringArray<ChallengeId>(raw.clearedChallenges),
    endingReached: asBool(raw.endingReached, false),
    settings: parseSettings(raw.settings),
    justUnlocked: [],
  }
}

export function serializeState(state: GameState): string {
  const payload: GameState = {
    ...state,
    version: SAVE_VERSION,
    justUnlocked: [],
  }
  return JSON.stringify(payload)
}

export function deserializeState(json: string): GameState | null {
  try {
    const parsed: unknown = JSON.parse(json)
    return migrateSave(parsed)
  } catch {
    return null
  }
}

export function saveToStorage(
  state: GameState,
  storage: Storage = localStorage,
): void {
  storage.setItem(SAVE_KEY, serializeState(state))
}

export function loadFromStorage(
  storage: Storage = localStorage,
): GameState | null {
  const raw = storage.getItem(SAVE_KEY)
  if (!raw) return null
  return deserializeState(raw)
}

export function clearStorage(storage: Storage = localStorage): void {
  storage.removeItem(SAVE_KEY)
}
