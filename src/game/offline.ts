import { applyTick } from './engine'
import { computeRates, offlineCapMs } from './formulas'
import type { GameState, Rates } from './types'

export interface OfflineResult {
  state: GameState
  elapsedMs: number
  appliedMs: number
  capped: boolean
  rates: Rates
}

/**
 * 最終 tick からの経過をオフライン進行として適用する。
 * 上限を超えた分は切り捨て。
 */
export function applyOfflineProgress(
  state: GameState,
  now = Date.now(),
): OfflineResult {
  const elapsedMs = Math.max(0, now - state.lastTickAt)
  const cap = offlineCapMs(state)
  const appliedMs = Math.min(elapsedMs, cap)
  const capped = elapsedMs > cap

  if (appliedMs < 1000) {
    return {
      state: { ...state, lastTickAt: now },
      elapsedMs,
      appliedMs: 0,
      capped: false,
      rates: computeRates(state),
    }
  }

  const rates = computeRates(state)
  const next = applyTick(
    { ...state, lastTickAt: state.lastTickAt },
    appliedMs / 1000,
  )

  return {
    state: { ...next, lastTickAt: now },
    elapsedMs,
    appliedMs,
    capped,
    rates,
  }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}時間${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}
