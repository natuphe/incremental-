import type { GameSettings } from '../game/types'

export function formatNumber(
  value: number,
  format: GameSettings['numberFormat'] = 'compact',
): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1000) {
    if (Number.isInteger(value)) return String(value)
    if (Math.abs(value) < 10) return value.toFixed(2)
    return value.toFixed(1)
  }

  if (format === 'scientific') {
    return value.toExponential(2)
  }

  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp']
  let v = value
  let i = 0
  while (Math.abs(v) >= 1000 && i < units.length - 1) {
    v /= 1000
    i++
  }
  const digits = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2
  return `${v.toFixed(digits)}${units[i]}`
}

export function formatRate(
  value: number,
  format: GameSettings['numberFormat'] = 'compact',
): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatNumber(value, format)}/s`
}
