import type {
  AchievementDef,
  ChallengeDef,
  GeneratorDef,
  ResearchDef,
  ResourceDef,
  ResourceId,
  GeneratorId,
  ResearchId,
  AchievementId,
  ChallengeId,
  SystemId,
} from './types'

export const RESOURCES: ResourceDef[] = [
  { id: 'ember', name: '残熱', startVisible: true },
  { id: 'ash', name: '灰層', startVisible: false, unlockSystem: 'ash' },
  { id: 'coil', name: '巻線', startVisible: false, unlockSystem: 'coil' },
  { id: 'flux', name: '流束', startVisible: false, unlockSystem: 'flux' },
  { id: 'echo', name: '残響', startVisible: false, unlockSystem: 'echo' },
  { id: 'nullShard', name: '虚片', startVisible: false, unlockSystem: 'nullShard' },
]

export const GENERATORS: GeneratorDef[] = [
  {
    id: 'kindler',
    name: '着火子',
    description: '手近な残熱を掻き集める。',
    produces: 'ember',
    baseCost: { ember: 15 },
    baseRate: 0.1,
    costGrowth: 1.15,
  },
  {
    id: 'vent',
    name: '排熱口',
    description: '閉じた通気から熱を引き出す。',
    produces: 'ember',
    baseCost: { ember: 100 },
    baseRate: 1,
    costGrowth: 1.15,
    unlockResearch: 'ventTuning',
  },
  {
    id: 'furnace',
    name: '再燃炉',
    description: '灰を戻し、安定した熱を生む。',
    produces: 'ember',
    baseCost: { ember: 1100, ash: 10 },
    baseRate: 8,
    costGrowth: 1.15,
    unlockResearch: 'furnaceSeal',
  },
  {
    id: 'lattice',
    name: '格子網',
    description: '巻線を張り、熱効率を底上げする。',
    produces: 'ember',
    baseCost: { ember: 12000, coil: 25 },
    baseRate: 47,
    costGrowth: 1.15,
    unlockResearch: 'latticeWeave',
  },
  {
    id: 'resonator',
    name: '共鳴器',
    description: '流束を震わせ、生産を加速する。',
    produces: 'flux',
    baseCost: { ember: 5e4, flux: 5 },
    baseRate: 0.5,
    costGrowth: 1.18,
    unlockResearch: 'resonantPath',
    unlockSystem: 'flux',
  },
  {
    id: 'conduit',
    name: '導管',
    description: '残響を束ねて遠方へ送る。',
    produces: 'echo',
    baseCost: { flux: 40, coil: 200 },
    baseRate: 0.2,
    costGrowth: 1.2,
    unlockResearch: 'conduitBind',
    unlockSystem: 'echo',
  },
  {
    id: 'archive',
    name: '記録塔',
    description: '残響を整理し、知識の流速を上げる。',
    produces: 'echo',
    baseCost: { echo: 20, ember: 2e5 },
    baseRate: 1.5,
    costGrowth: 1.2,
    unlockResearch: 'archiveIndex',
  },
  {
    id: 'nullWell',
    name: '虚の井戸',
    description: '沈黙の底から欠片を引き上げる。',
    produces: 'nullShard',
    baseCost: { echo: 100, flux: 250 },
    baseRate: 0.05,
    costGrowth: 1.25,
    unlockResearch: 'nullProbe',
    unlockSystem: 'nullShard',
  },
]

export const RESEARCH: ResearchDef[] = [
  {
    id: 'sparkCapture',
    name: '火花捕捉',
    description: '手動着火の効率を上げる。',
    cost: { ember: 20 },
    requires: [],
    effects: [{ type: 'clickPower', value: 1 }],
  },
  {
    id: 'ashSifting',
    name: '灰の選別',
    description: '熱の副産物を回収し始める。',
    cost: { ember: 80 },
    requires: ['sparkCapture'],
    unlocksSystems: ['ash'],
  },
  {
    id: 'coilWind',
    name: '巻線起こし',
    description: '導線を巻き直し、次の段階へ備える。',
    cost: { ember: 250, ash: 15 },
    requires: ['ashSifting'],
    unlocksSystems: ['coil'],
  },
  {
    id: 'ventTuning',
    name: '通気調整',
    description: '排熱口を運用可能にする。',
    cost: { ember: 150 },
    requires: ['sparkCapture'],
    unlocksGenerators: ['vent'],
  },
  {
    id: 'furnaceSeal',
    name: '炉の封印修復',
    description: '再燃炉を安定稼働させる。',
    cost: { ember: 900, ash: 40 },
    requires: ['ashSifting', 'ventTuning'],
    unlocksGenerators: ['furnace'],
  },
  {
    id: 'fluxOpen',
    name: '流束開放',
    description: '新しい流れを観測する。',
    cost: { ember: 5000, coil: 30 },
    requires: ['coilWind', 'furnaceSeal'],
    unlocksSystems: ['flux'],
  },
  {
    id: 'latticeWeave',
    name: '格子編み',
    description: '格子網を展開する。',
    cost: { ember: 8000, coil: 50 },
    requires: ['coilWind'],
    unlocksGenerators: ['lattice'],
    effects: [{ type: 'generatorMult', generatorId: 'kindler', value: 2 }],
  },
  {
    id: 'resonantPath',
    name: '共鳴経路',
    description: '共鳴器の設計図を復元する。',
    cost: { ember: 2e4, flux: 10 },
    requires: ['fluxOpen'],
    unlocksGenerators: ['resonator'],
    effects: [{ type: 'globalMult', value: 1.25 }],
  },
  {
    id: 'echoListen',
    name: '残響聴取',
    description: '遠い反響を拾い始める。',
    cost: { flux: 80, coil: 120 },
    requires: ['resonantPath'],
    unlocksSystems: ['echo'],
  },
  {
    id: 'conduitBind',
    name: '導管接続',
    description: '導管を敷設する。',
    cost: { echo: 5, flux: 100 },
    requires: ['echoListen'],
    unlocksGenerators: ['conduit'],
  },
  {
    id: 'archiveIndex',
    name: '記録索引',
    description: '記録塔の索引を組み直す。',
    cost: { echo: 40, ember: 1e5 },
    requires: ['conduitBind'],
    unlocksGenerators: ['archive'],
    effects: [{ type: 'globalMult', value: 1.5 }],
  },
  {
    id: 'nullProbe',
    name: '虚の探査',
    description: '沈黙の層へプローブを下ろす。',
    cost: { echo: 120, flux: 300 },
    requires: ['archiveIndex'],
    unlocksSystems: ['nullShard'],
    unlocksGenerators: ['nullWell'],
  },
  {
    id: 'wakeProtocol',
    name: '覚醒プロトコル',
    description: '残熱網を一度整え、印を得る手法。',
    cost: { ember: 5e4, ash: 200, coil: 100 },
    requires: ['furnaceSeal', 'coilWind'],
    unlocksSystems: ['wake'],
  },
  {
    id: 'offlineBuffer',
    name: '待機緩衝',
    description: '離席中の進行上限を延ばす。',
    cost: { ember: 3000, ash: 80 },
    requires: ['ashSifting'],
    effects: [{ type: 'offlineCapHours', value: 8 }],
  },
  {
    id: 'bulkOrders',
    name: '一括手配',
    description: '施設をまとめて発注できるようにする。',
    cost: { ember: 2e4, coil: 80 },
    requires: ['latticeWeave'],
    unlocksSystems: ['bulkBuy'],
  },
  {
    id: 'deepWake',
    name: '深層覚醒',
    description: '覚醒印の効果を強化する。',
    cost: { echo: 60, flux: 200 },
    requires: ['wakeProtocol', 'echoListen'],
    effects: [{ type: 'wakeBonus', value: 0.15 }],
  },
  {
    id: 'challengeGate',
    name: '試練門',
    description: '制約付き再起動の枠を開く。',
    cost: { nullShard: 5, echo: 200 },
    requires: ['nullProbe', 'wakeProtocol'],
    unlocksSystems: ['challenges'],
  },
  {
    id: 'hiddenThread',
    name: '隠れた糸',
    description: '索引の余白に残る配線図。',
    cost: { nullShard: 15, echo: 400 },
    requires: ['nullProbe'],
    hidden: true,
    effects: [{ type: 'globalMult', value: 2 }],
  },
  {
    id: 'finalCircuit',
    name: '最終回路',
    description: '網全体をひとつの信号に束ねる。',
    cost: { nullShard: 50, echo: 1000, flux: 2000 },
    requires: ['challengeGate', 'deepWake', 'hiddenThread'],
    effects: [{ type: 'globalMult', value: 3 }],
  },
]

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'firstSpark',
    name: '最初の火花',
    description: '残熱を手動で起こす。',
    check: (s) => s.lifetimeEmber >= 1,
  },
  {
    id: 'emberHundred',
    name: '百の残熱',
    description: '累計残熱が100に達する。',
    check: (s) => s.lifetimeEmber >= 100,
  },
  {
    id: 'emberThousand',
    name: '千の残熱',
    description: '累計残熱が1000に達する。',
    check: (s) => s.lifetimeEmber >= 1000,
  },
  {
    id: 'ownKindler',
    name: '着火の手',
    description: '着火子を1台用意する。',
    check: (s) => s.generators.kindler >= 1,
  },
  {
    id: 'ownFurnace',
    name: '再燃',
    description: '再燃炉を稼働させる。',
    check: (s) => s.generators.furnace >= 1,
  },
  {
    id: 'researchThree',
    name: '知見の積み上げ',
    description: '研究を3つ完了する。',
    check: (s) => s.researched.length >= 3,
  },
  {
    id: 'ashUnlocked',
    name: '灰層の発見',
    description: '灰層システムを解放する。',
    check: (s) => s.unlockedSystems.includes('ash'),
  },
  {
    id: 'coilUnlocked',
    name: '巻線の復旧',
    description: '巻線システムを解放する。',
    check: (s) => s.unlockedSystems.includes('coil'),
  },
  {
    id: 'firstWake',
    name: '最初の覚醒',
    description: '初めて覚醒を実行する。',
    check: (s) => s.totalWakes >= 1,
  },
  {
    id: 'wakeFive',
    name: '五度の整え',
    description: '覚醒を5回行う。',
    check: (s) => s.totalWakes >= 5,
  },
  {
    id: 'fluxSeen',
    name: '流れの観測',
    description: '流束を解放する。',
    check: (s) => s.unlockedSystems.includes('flux'),
  },
  {
    id: 'echoHeard',
    name: '反響',
    description: '残響を解放する。',
    check: (s) => s.unlockedSystems.includes('echo'),
  },
  {
    id: 'secretThread',
    name: '余白の配線',
    description: '隠れた糸を辿る。',
    secret: true,
    check: (s) => s.researched.includes('hiddenThread'),
  },
  {
    id: 'challengeClear',
    name: '門を越えて',
    description: '試練を1つクリアする。',
    check: (s) => s.clearedChallenges.length >= 1,
  },
  {
    id: 'endingTouch',
    name: '回路完結',
    description: '最終回路を完了する。',
    secret: true,
    check: (s) => s.endingReached,
  },
]

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'coldStart',
    name: '冷えた始動',
    description: '生産が抑えられた状態で残熱を積み上げる。',
    unlockResearch: 'challengeGate',
    goalEmber: 5000,
    rewardWakeMarks: 2,
    modifiers: { productionMult: 0.35, costMult: 1 },
  },
  {
    id: 'thinSignal',
    name: '細い信号',
    description: '施設コストが重い制約下で進む。',
    unlockResearch: 'challengeGate',
    goalEmber: 8000,
    rewardWakeMarks: 3,
    modifiers: { productionMult: 1, costMult: 2.5 },
  },
  {
    id: 'singlePath',
    name: '単一路線',
    description: '限られた施設だけで目標へ届ける。',
    unlockResearch: 'challengeGate',
    goalEmber: 3000,
    rewardWakeMarks: 4,
    modifiers: {
      productionMult: 0.8,
      costMult: 1.2,
      allowedGenerators: ['kindler', 'vent'],
    },
  },
]

export const RESOURCE_IDS = RESOURCES.map((r) => r.id) as ResourceId[]
export const GENERATOR_IDS = GENERATORS.map((g) => g.id) as GeneratorId[]

export function getResource(id: ResourceId): ResourceDef {
  const found = RESOURCES.find((r) => r.id === id)
  if (!found) throw new Error(`unknown resource: ${id}`)
  return found
}

export function getGenerator(id: GeneratorId): GeneratorDef {
  const found = GENERATORS.find((g) => g.id === id)
  if (!found) throw new Error(`unknown generator: ${id}`)
  return found
}

export function getResearch(id: ResearchId): ResearchDef {
  const found = RESEARCH.find((r) => r.id === id)
  if (!found) throw new Error(`unknown research: ${id}`)
  return found
}

export function getAchievement(id: AchievementId): AchievementDef {
  const found = ACHIEVEMENTS.find((a) => a.id === id)
  if (!found) throw new Error(`unknown achievement: ${id}`)
  return found
}

export function getChallenge(id: ChallengeId): ChallengeDef {
  const found = CHALLENGES.find((c) => c.id === id)
  if (!found) throw new Error(`unknown challenge: ${id}`)
  return found
}

export function systemLabel(id: SystemId): string {
  const labels: Record<SystemId, string> = {
    generators: '施設',
    research: '研究',
    achievements: '実績',
    ash: '灰層',
    coil: '巻線',
    flux: '流束',
    echo: '残響',
    nullShard: '虚片',
    wake: '覚醒',
    challenges: '試練',
    bulkBuy: '一括手配',
  }
  return labels[id]
}
