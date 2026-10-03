/**
 * IFRS 17 Premium Allocation Approach (PAA) for the same group the GMM engine measures,
 * so the two can be compared side by side.
 *
 * Assumptions, stated in the lab:
 *   - no significant financing component, so the LRC is not adjusted for the time value of money (IFRS 17.56)
 *   - revenue is the expected premium receipts allocated on the basis of coverage units (IFRS 17.B126)
 *   - acquisition cash flows are either amortised over coverage or expensed when paid (IFRS 17.59(a))
 *   - the LIC is measured exactly as under the GMM (discounted, with a risk adjustment)
 *   - the group is not onerous; the lab flags when the GMM shows a day-one loss
 */
import type { GmmInputs } from './gmm'

export interface PaaYear {
  year: number
  inCoverage: boolean
  lrcOpen: number
  premiums: number
  acquisitionPaid: number
  acquisitionAmortisation: number
  insuranceRevenue: number
  lrcClose: number
  licClose: number
  insuranceServiceExpense: number
  insuranceFinanceExpense: number
  profit: number
}

export interface PaaResult {
  years: PaaYear[]
  totals: { revenue: number; serviceExpense: number; financeExpense: number; profit: number; netCash: number }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function runPaa(inp: GmmInputs, opts: { expenseAcquisition: boolean }): PaaResult {
  const N = inp.years
  const r = inp.discountRate
  const v = 1 / (1 + r)
  const s = inp.settlementLag
  const premiumFor = (y: number) => (y > N ? 0 : inp.premiumMode === 'annual' ? inp.premium : y === 1 ? inp.premium : 0)
  const totalPremium = sum(Array.from({ length: N }, (_, i) => premiumFor(i + 1)))
  const cuTotal = sum(inp.coverageUnits.slice(0, N))
  // The same claims reality as the GMM run: a changed outlook also changes the claims that later occur.
  const chg = inp.assumptionChange
  const claimsFor = (y: number) =>
    (inp.claims[y - 1] ?? 0) * (chg && chg.year < N && y > chg.year ? 1 + chg.futureClaimsPct : 1) * (inp.actualClaimsFactor[y - 1] ?? 1)

  let lrc = 0
  let licPv = 0
  let licRa = 0
  const years: PaaYear[] = []
  const last = s > 0 ? N + 1 : N
  for (let y = 1; y <= last; y++) {
    const inCoverage = y <= N
    const share = inCoverage && cuTotal > 0 ? inp.coverageUnits[y - 1] / cuTotal : 0
    const P = premiumFor(y)
    const A = y === 1 ? inp.acquisition : 0
    const E = inCoverage ? inp.expenses[y - 1] ?? 0 : 0
    const amort = opts.expenseAcquisition ? 0 : inp.acquisition * share
    const revenue = totalPremium * share

    const lrcOpen = lrc
    // Acquisition cash flows reduce the LRC only when they are deferred rather than expensed.
    lrc = lrcOpen + P - (opts.expenseAcquisition ? 0 : A) + amort - revenue

    const actual = inCoverage ? claimsFor(y) : 0
    const incurredPv = actual * (1 - s + s * v)
    const newLicPv = s * v * actual
    const newLicRa = inp.raPct * newLicPv
    const interestLic = r * licPv
    const ise = incurredPv + newLicRa - licRa + E + amort + (opts.expenseAcquisition ? A : 0)
    licPv = newLicPv
    licRa = newLicRa

    years.push({
      year: y,
      inCoverage,
      lrcOpen,
      premiums: P,
      acquisitionPaid: A,
      acquisitionAmortisation: amort,
      insuranceRevenue: revenue,
      lrcClose: lrc,
      licClose: licPv + licRa,
      insuranceServiceExpense: ise,
      insuranceFinanceExpense: interestLic,
      profit: revenue - ise - interestLic,
    })
  }

  // Claims paid each year, for the net cash check
  const paid = years.map((yr, i) => {
    const prev = i > 0 ? claimsFor(i) : 0
    const cur = yr.inCoverage ? claimsFor(i + 1) : 0
    return s * prev + (1 - s) * cur
  })
  const netCash = sum(years.map((yr, i) => yr.premiums - yr.acquisitionPaid - (yr.inCoverage ? inp.expenses[i] ?? 0 : 0) - paid[i]))

  return {
    years,
    totals: {
      revenue: sum(years.map((y) => y.insuranceRevenue)),
      serviceExpense: sum(years.map((y) => y.insuranceServiceExpense)),
      financeExpense: sum(years.map((y) => y.insuranceFinanceExpense)),
      profit: sum(years.map((y) => y.profit)),
      netCash,
    },
  }
}
