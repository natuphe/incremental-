/** ゲーム状態・コンテンツの型定義 */

export type ResourceId =
  | 'ember'
  | 'ash'
  | 'coil'
  | 'flux'
  | 'echo'
  | 'nullShard'

export type GeneratorId =
  | 'kindler'
  | 'vent'
  | 'furnace'
  | 'lattice'
  | 'resonator'
  | 'conduit'
  | 'archive'
  | 'nullWell'

export type ResearchId =
  | 'sparkCapture'
  | 'ashSifting'
  | 'coilWind'
  | 'ventTuning'
  | 'furnaceSeal'
  | 'fluxOpen'
  | 'latticeWeave'
  | 'resonantPath'
  | 'echoListen'
  | 'conduitBind'
  | 'archiveIndex'
  | 'nullProbe'
  | 'wakeProtocol'
  | 'offlineBuffer'
  | 'bulkOrders'
  | 'deepWake'
  | 'challengeGate'
  | 'hiddenThread'
  | 'finalCircuit'

export type AchievementId =
  | 'firstSpark'
  | 'emberHundred'
  | 'emberThousand'
  | 'ownKindler'
  | 'ownFurnace'
  | 'researchThree'
  | 'ashUnlocked'
  | 'coilUnlocked'
  | 'firstWake'
  | 'wakeFive'
  | 'fluxSeen'
  | 'echoHeard'
  | 'secretThread'
  | 'challengeClear'
  | 'endingTouch'

export type SystemId =
  | 'generators'
  | 'research'
  | 'achievements'
  | 'ash'
  | 'coil'
  | 'flux'
  | 'echo'
  | 'nullShard'
  | 'wake'
  | 'challenges'
  | 'bulkBuy'

export type ChallengeId = 'coldStart' | 'thinSignal' | 'singlePath'

export type TabId =
  | 'ops'
  | 'research'
  | 'wake'
  | 'achievements'
  | 'challenges'
  | 'settings'

export interface ResourceDef {
  id: ResourceId
  name: string
  /** 初期表示する資源か */
  startVisible: boolean
  unlockSystem?: SystemId
}

export interface GeneratorDef {
  id: GeneratorId
  name: string
  description: string
  /** 主に生産する資源 */
  produces: ResourceId
  baseCost: Partial<Record<ResourceId, number>>
  baseRate: number
  costGrowth: number
  unlockResearch?: ResearchId
  unlockSystem?: SystemId
}

export interface ResearchDef {
  id: ResearchId
  name: string
  description: string
  cost: Partial<Record<ResourceId, number>>
  requires: ResearchId[]
  unlocksSystems?: SystemId[]
  unlocksGenerators?: GeneratorId[]
  /** 生産倍率など */
  effects?: ResearchEffect[]
  hidden?: boolean
}

export type ResearchEffect =
  | { type: 'globalMult'; value: number }
  | { type: 'generatorMult'; generatorId: GeneratorId; value: number }
  | { type: 'clickPower'; value: number }
  | { type: 'offlineCapHours'; value: number }
  | { type: 'wakeBonus'; value: number }

export interface AchievementDef {
  id: AchievementId
  name: string
  description: string
  secret?: boolean
  check: (state: GameState) => boolean
}

export interface ChallengeDef {
  id: ChallengeId
  name: string
  description: string
  unlockResearch: ResearchId
  /** クリア条件は内部のみ */
  goalEmber: number
  rewardWakeMarks: number
  modifiers: ChallengeModifiers
}

export interface ChallengeModifiers {
  productionMult: number
  costMult: number
  /** 購入可能な施設を制限（未指定なら全解放済み） */
  allowedGenerators?: GeneratorId[]
}

export interface GameState {
  version: number
  createdAt: number
  lastTickAt: number
  resources: Record<ResourceId, number>
  generators: Record<GeneratorId, number>
  researched: ResearchId[]
  unlockedSystems: SystemId[]
  achievements: AchievementId[]
  wakeMarks: number
  totalWakes: number
  lifetimeEmber: number
  clickPower: number
  globalMult: number
  offlineCapHours: number
  bulkBuyUnlocked: boolean
  activeChallenge: ChallengeId | null
  clearedChallenges: ChallengeId[]
  endingReached: boolean
  /** 設定 */
  settings: GameSettings
  /** UI 通知用の一時フラグ（セーブ対象外でも可） */
  justUnlocked: SystemId[]
}

export interface GameSettings {
  numberFormat: 'compact' | 'scientific'
  reduceMotion: boolean
}

export interface Rates {
  perSecond: Record<ResourceId, number>
}

export interface BuyResult {
  ok: boolean
  state: GameState
  reason?: string
}

export const SAVE_VERSION = 1
export const SAVE_KEY = 'ashwake.save.v1'
