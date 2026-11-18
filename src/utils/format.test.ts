import { describe, expect, it } from 'vitest'
import { formatNumber, formatRate } from './format'

describe('formatNumber', () => {
  it('小さい値はそのまま近い表記', () => {
    expect(formatNumber(12)).toBe('12')
    expect(formatNumber(1.234)).toBe('1.23')
  })

  it('大きい値はコンパクト表記', () => {
    expect(formatNumber(1500)).toBe('1.50K')
    expect(formatNumber(2_500_000)).toBe('2.50M')
  })

  it('指数表記を選べる', () => {
    expect(formatNumber(1500, 'scientific')).toBe('1.50e+3')
  })
})

describe('formatRate', () => {
  it('レートに符号と単位が付く', () => {
    expect(formatRate(1.5)).toContain('/s')
    expect(formatRate(1.5).startsWith('+')).toBe(true)
  })
})
