const fmt0 = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const fmt1 = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

/** Accounting style: negatives in brackets, near-zero shown as a dash. */
export function money(v: number): string {
  if (Math.abs(v) < 0.5) return '–'
  const s = fmt0.format(Math.abs(v))
  return v < 0 ? `(${s})` : s
}
export function pct(v: number): string {
  return `${fmt1.format(v * 100)}%`
}
