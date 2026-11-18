import { describe, expect, it } from 'vitest'
import {
  applyTick,
  buyGenerator,
  buyResearch,
  createInitialState,
  manualClick,
  performWake,
  startChallenge,
} from './engine'
import { computeRates, generatorCost, canAfford } from './formulas'
import { applyOfflineProgress } from './offline'
import { deserializeState, migrateSave, serializeState } from './save'

describe('engine basics', () => {
  it('手動クリックで残熱が増える', () => {
    const s0 = createInitialState()
    const s1 = manualClick(s0)
    expect(s1.resources.ember).toBeGreaterThan(s0.resources.ember)
    expect(s1.lifetimeEmber).toBeGreaterThan(0)
    expect(s1.achievements).toContain('firstSpark')
  })

  it('tick で施設生産が加算される', () => {
    let s = createInitialState({
      resources: {
        ...createInitialState().resources,
        ember: 100,
      },
    })
    s = buyGenerator(s, 'kindler', 1)
    expect(s.generators.kindler).toBe(1)
    const before = s.resources.ember
    s = applyTick(s, 10)
    expect(s.resources.ember).toBeGreaterThan(before)
  })

  it('研究でシステムが解放される', () => {
    let s = createInitialState({
      resources: {
        ...createInitialState().resources,
        ember: 1000,
      },
    })
    s = buyResearch(s, 'sparkCapture')
    expect(s.researched).toContain('sparkCapture')
    s = buyResearch(s, 'ashSifting')
    expect(s.unlockedSystems).toContain('ash')
  })

  it('覚醒で印が増え資源が初期化される', () => {
    let s = createInitialState({
      lifetimeEmber: 5000,
      resources: { ...createInitialState().resources, ember: 5000 },
      unlockedSystems: [
        'generators',
        'research',
        'achievements',
        'wake',
        'ash',
      ],
      generators: { ...createInitialState().generators, kindler: 5 },
    })
    s = performWake(s)
    expect(s.wakeMarks).toBeGreaterThan(0)
    expect(s.generators.kindler).toBe(0)
    expect(s.totalWakes).toBe(1)
  })
})

describe('formulas', () => {
  it('コストが保有数で増える', () => {
    const s0 = createInitialState()
    const c0 = generatorCost(s0, 'kindler', 1).ember ?? 0
    const s1 = {
      ...s0,
      generators: { ...s0.generators, kindler: 3 },
    }
    const c1 = generatorCost(s1, 'kindler', 1).ember ?? 0
    expect(c1).toBeGreaterThan(c0)
  })

  it('所持不足なら購入不可', () => {
    const s = createInitialState()
    const cost = generatorCost(s, 'kindler', 1)
    expect(canAfford(s, cost)).toBe(false)
  })

  it('生産レートが施設数に比例する', () => {
    const s1 = createInitialState({
      generators: { ...createInitialState().generators, kindler: 1 },
    })
    const s2 = createInitialState({
      generators: { ...createInitialState().generators, kindler: 2 },
    })
    expect(computeRates(s2).perSecond.ember).toBeCloseTo(
      computeRates(s1).perSecond.ember * 2,
    )
  })
})

describe('save / offline', () => {
  it('シリアライズ往復で主要状態が保たれる', () => {
    const s = createInitialState({
      resources: { ...createInitialState().resources, ember: 42 },
      generators: { ...createInitialState().generators, kindler: 2 },
      researched: ['sparkCapture'],
    })
    const round = deserializeState(serializeState(s))
    expect(round).not.toBeNull()
    expect(round!.resources.ember).toBe(42)
    expect(round!.generators.kindler).toBe(2)
    expect(round!.researched).toContain('sparkCapture')
  })

  it('壊れたセーブは初期状態へフォールバック', () => {
    const s = migrateSave({ version: 1, resources: 'nope' })
    expect(s.resources.ember).toBe(0)
  })

  it('オフライン進行が上限内で適用される', () => {
    const past = Date.now() - 60_000
    const s = createInitialState({
      lastTickAt: past,
      generators: { ...createInitialState().generators, kindler: 5 },
    })
    const result = applyOfflineProgress(s, Date.now())
    expect(result.appliedMs).toBeGreaterThan(0)
    expect(result.state.resources.ember).toBeGreaterThan(0)
  })

  it('オフライン上限を超えた分は切り捨て', () => {
    const past = Date.now() - 100 * 60 * 60 * 1000
    const s = createInitialState({
      lastTickAt: past,
      offlineCapHours: 4,
      generators: { ...createInitialState().generators, kindler: 1 },
    })
    const result = applyOfflineProgress(s, Date.now())
    expect(result.capped).toBe(true)
    expect(result.appliedMs).toBeLessThanOrEqual(4 * 60 * 60 * 1000)
  })
})

describe('challenges', () => {
  it('試練開始で進行が組み直される', () => {
    const s0 = createInitialState({
      unlockedSystems: [
        'generators',
        'research',
        'achievements',
        'wake',
        'challenges',
      ],
      researched: ['challengeGate'],
      resources: { ...createInitialState().resources, ember: 9999 },
      generators: { ...createInitialState().generators, kindler: 10 },
    })
    const s1 = startChallenge(s0, 'coldStart')
    expect(s1.activeChallenge).toBe('coldStart')
    expect(s1.generators.kindler).toBe(0)
    expect(s1.resources.ember).toBe(0)
  })
})
