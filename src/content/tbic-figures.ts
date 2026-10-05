import { runGmm, type GmmResult } from '../engine/gmm'
import { TBIC_GROUPS } from '../engine/tbic'

/** Engine results for the TBIC groups. Every TBIC figure on the site is read from here, never typed by hand. */
export const TBIC_RESULTS: { suraksha: GmmResult; arogya: GmmResult; griha: GmmResult } = {
  suraksha: runGmm(TBIC_GROUPS['tbic-suraksha'].inputs),
  arogya: runGmm(TBIC_GROUPS['tbic-arogya'].inputs),
  griha: runGmm(TBIC_GROUPS['tbic-griha'].inputs),
}

const fmt1 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmt4 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })

/** One decimal, Indian digit grouping; negatives in brackets. */
export function n1(v: number): string {
  const r = Math.round(v * 10) / 10
  const s = fmt1.format(Math.abs(r))
  return r < 0 ? `(${s})` : s
}
/** ₹ amount in lakh, one decimal. */
export function rs(v: number): string {
  const r = Math.round(v * 10) / 10
  return r < 0 ? `minus ₹${fmt1.format(-r)} lakh` : `₹${fmt1.format(r)} lakh`
}
/** Discount factors and other ratios to four decimals. */
export function f4(v: number): string {
  return fmt4.format(v)
}

/** v^t for a flat annual rate. */
export const df = (rate: number, t: number) => Math.pow(1 + rate, -t)
