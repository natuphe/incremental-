import { GENERATORS, getGenerator, getResearch, CHALLENGES } from './content'
import type {
  GameState,
  GeneratorId,
  Rates,
  ResourceId,
  ResearchId,
} from './types'

export function emptyRates(): Rates {
  return {
    perSecond: {
      ember: 0,
      ash: 0,
      coil: 0,
      flux: 0,
      echo: 0,
      nullShard: 0,
    },
  }
}

export function wakeProductionBonus(state: GameState): number {
  let bonusPerMark = 0.1
  if (state.researched.includes('deepWake')) {
    bonusPerMark += 0.15
  }
  return 1 + state.wakeMarks * bonusPerMark
}

export function challengeProductionMult(state: GameState): number {
  if (!state.activeChallenge) return 1
  const ch = CHALLENGES.find((c) => c.id === state.activeChallenge)
  return ch?.modifiers.productionMult ?? 1
}

export function challengeCostMult(state: GameState): number {
  if (!state.activeChallenge) return 1
  const ch = CHALLENGES.find((c) => c.id === state.activeChallenge)
  return ch?.modifiers.costMult ?? 1
}

export function generatorMult(state: GameState, id: GeneratorId): number {
  let mult = 1
  for (const rid of state.researched) {
    const def = getResearch(rid)
    for (const effect of def.effects ?? []) {
      if (effect.type === 'generatorMult' && effect.generatorId === id) {
        mult *= effect.value
      }
    }
  }
  return mult
}

export function researchGlobalMult(state: GameState): number {
  let mult = 1
  for (const rid of state.researched) {
    const def = getResearch(rid)
    for (const effect of def.effects ?? []) {
      if (effect.type === 'globalMult') mult *= effect.value
    }
  }
  return mult
}

export function totalProductionMult(state: GameState): number {
  return (
    state.globalMult *
    researchGlobalMult(state) *
    wakeProductionBonus(state) *
    challengeProductionMult(state)
  )
}

/** 施設1台ぶんの基礎レート（個数・倍率なし）は def.baseRate */
export function computeRates(state: GameState): Rates {
  const rates = emptyRates()
  const global = totalProductionMult(state)
  const challenge = state.activeChallenge
    ? CHALLENGES.find((c) => c.id === state.activeChallenge)
    : null

  for (const def of GENERATORS) {
    const count = state.generators[def.id]
    if (count <= 0) continue
    if (
      challenge?.modifiers.allowedGenerators &&
      !challenge.modifiers.allowedGenerators.includes(def.id)
    ) {
      continue
    }
    const rate =
      def.baseRate * count * generatorMult(state, def.id) * global
    rates.perSecond[def.produces] += rate

    // 副産物: 灰・巻線は残熱生産に連動して少量発生
    if (def.produces === 'ember') {
      if (state.unlockedSystems.includes('ash')) {
        rates.perSecond.ash += rate * 0.02
      }
      if (state.unlockedSystems.includes('coil')) {
        rates.perSecond.coil += rate * 0.005
      }
    }
  }

  return rates
}

export function generatorCost(
  state: GameState,
  id: GeneratorId,
  amount = 1,
): Partial<Record<ResourceId, number>> {
  const def = getGenerator(id)
  const owned = state.generators[id]
  const costMult = challengeCostMult(state)
  const total: Partial<Record<ResourceId, number>> = {}

  for (const [res, base] of Object.entries(def.baseCost) as [
    ResourceId,
    number,
  ][]) {
    let sum = 0
    for (let i = 0; i < amount; i++) {
      sum += base * Math.pow(def.costGrowth, owned + i) * costMult
    }
    total[res] = sum
  }
  return total
}

export function canAfford(
  state: GameState,
  cost: Partial<Record<ResourceId, number>>,
): boolean {
  for (const [res, amount] of Object.entries(cost) as [ResourceId, number][]) {
    if ((state.resources[res] ?? 0) < amount) return false
  }
  return true
}

export function payCost(
  state: GameState,
  cost: Partial<Record<ResourceId, number>>,
): GameState {
  const resources = { ...state.resources }
  for (const [res, amount] of Object.entries(cost) as [ResourceId, number][]) {
    resources[res] -= amount
  }
  return { ...state, resources }
}

export function maxAffordable(
  state: GameState,
  id: GeneratorId,
  softCap = 1000,
): number {
  let n = 0
  let probe = { ...state }
  while (n < softCap) {
    const cost = generatorCost(probe, id, 1)
    if (!canAfford(probe, cost)) break
    probe = payCost(probe, cost)
    probe = {
      ...probe,
      generators: {
        ...probe.generators,
        [id]: probe.generators[id] + 1,
      },
    }
    n++
  }
  return n
}

export function clickGain(state: GameState): number {
  let power = state.clickPower
  for (const rid of state.researched) {
    const def = getResearch(rid)
    for (const effect of def.effects ?? []) {
      if (effect.type === 'clickPower') power += effect.value
    }
  }
  return power * wakeProductionBonus(state)
}

export function wakeMarkGain(state: GameState): number {
  // 累計残熱に応じた印。試練中は別計算しない（クリア報酬は別）
  const base = Math.floor(Math.log10(Math.max(10, state.lifetimeEmber)))
  return Math.max(1, base - 1)
}

export function isGeneratorUnlocked(
  state: GameState,
  id: GeneratorId,
): boolean {
  const def = getGenerator(id)
  if (def.unlockResearch && !state.researched.includes(def.unlockResearch)) {
    return false
  }
  if (def.unlockSystem && !state.unlockedSystems.includes(def.unlockSystem)) {
    return false
  }
  if (state.activeChallenge) {
    const ch = CHALLENGES.find((c) => c.id === state.activeChallenge)
    if (
      ch?.modifiers.allowedGenerators &&
      !ch.modifiers.allowedGenerators.includes(id)
    ) {
      return false
    }
  }
  return true
}

export function isResearchVisible(
  state: GameState,
  id: ResearchId,
): boolean {
  const def = getResearch(id)
  if (state.researched.includes(id)) return true
  if (def.hidden) {
    // 隠し研究: 前提が揃い、かつ虚片を持っているときだけ候補表示
    if (!def.requires.every((r) => state.researched.includes(r))) return false
    return state.resources.nullShard >= 1
  }
  return def.requires.every((r) => state.researched.includes(r))
}

export function isResearchAvailable(
  state: GameState,
  id: ResearchId,
): boolean {
  const def = getResearch(id)
  if (state.researched.includes(id)) return false
  if (!def.requires.every((r) => state.researched.includes(r))) return false
  if (def.hidden && state.resources.nullShard < 1) return false
  return canAfford(state, def.cost)
}

export function offlineCapMs(state: GameState): number {
  let hours = state.offlineCapHours
  for (const rid of state.researched) {
    const def = getResearch(rid)
    for (const effect of def.effects ?? []) {
      if (effect.type === 'offlineCapHours') {
        hours = Math.max(hours, effect.value)
      }
    }
  }
  return hours * 60 * 60 * 1000
}
