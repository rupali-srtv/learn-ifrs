/**
 * IFRS 17 General Measurement Model (GMM) teaching engine.
 *
 * Models one group of insurance contracts recognised at the start of year 1.
 * Timing convention (all cash flows sit on year boundaries):
 *   - premiums, maintenance expenses and acquisition cash flows: start of the year
 *   - claims incurred in a year: (1 - lag) paid at the end of that year,
 *     `lag` share paid at the end of the following year (creates a liability for incurred claims)
 * Measurement points are the year ends, after that year's end-of-year payments.
 *
 * Simplifications (stated on the sandbox page):
 *   - one flat discount rate, used both as the current rate and the locked-in rate
 *   - the risk adjustment is a percentage of the present value of claims and is not
 *     disaggregated into a finance component (IFRS 17.81 permits this)
 *   - no OCI option, no reinsurance, no foreign currency
 */

export interface AssumptionChange {
  /** Change is estimated at the end of this year and affects claims of later years. */
  year: number
  /** e.g. 0.2 means expected claims for all later years rise by 20%. */
  futureClaimsPct: number
}

export interface GmmInputs {
  years: number
  premiumMode: 'single' | 'annual'
  /** Single premium, or the premium for each year when premiumMode is 'annual'. */
  premium: number
  /** Expected claims incurred in each coverage year. */
  claims: number[]
  /** Expected maintenance expenses paid at the start of each coverage year. */
  expenses: number[]
  /** Insurance acquisition cash flows paid at initial recognition. */
  acquisition: number
  discountRate: number
  /** Risk adjustment as a share of the present value of future claims. */
  raPct: number
  /** Share of each year's claims paid one year after they are incurred. */
  settlementLag: number
  coverageUnits: number[]
  /** Actual claims as a multiple of expected claims, per year. */
  actualClaimsFactor: number[]
  assumptionChange?: AssumptionChange | null
}

export interface InitialRecognition {
  pvInflows: number
  pvOutflows: number
  fulfilmentCashFlows: number
  riskAdjustment: number
  csm: number
  lossComponent: number
}

export interface YearResult {
  year: number
  inCoverage: boolean
  // cash
  premiums: number
  acquisitionPaid: number
  expensesPaid: number
  claimsPaid: number
  actualClaims: number
  // LRC components
  open: Balances
  close: Balances
  // movements
  interestOnFcf: number
  csmAccretion: number
  interestOnLic: number
  expectedClaimsReleased: number
  raReleased: number
  changeInPv: number
  changeInRa: number
  csmAdjustedByChange: number
  /** Total losses on onerous contracts recognised this year (initial plus changes). */
  onerousLoss: number
  initialLoss: number
  changeLoss: number
  lossReversal: number
  lossComponentAllocation: number
  csmRelease: number
  acquisitionAmortisation: number
  incurredClaimsPv: number
  newLicRa: number
  licRaReleased: number
  // P&L
  insuranceRevenue: number
  insuranceServiceExpense: number
  insuranceServiceResult: number
  insuranceFinanceExpense: number
  profit: number
  revenueAnalysis: RevenueAnalysis
  journals: Journal[]
}

export interface Balances {
  fcf: number
  ra: number
  csm: number
  lossComponent: number
  licPv: number
  licRa: number
  lrc: number
  lic: number
}

export interface RevenueAnalysis {
  expectedClaims: number
  expectedExpenses: number
  riskAdjustmentRelease: number
  csmRelease: number
  acquisitionRecovery: number
  lessLossComponent: number
  total: number
}

export type Account =
  | 'Cash'
  | 'LRC'
  | 'LIC'
  | 'Insurance revenue'
  | 'Insurance service expense'
  | 'Insurance finance expense'

export interface JournalLine {
  account: Account
  debit: number
  credit: number
}

export interface Journal {
  id: string
  description: string
  conceptId: string
  lines: JournalLine[]
}

export interface GmmResult {
  inputs: GmmInputs
  initial: InitialRecognition
  years: YearResult[]
  totals: {
    revenue: number
    serviceExpense: number
    financeExpense: number
    profit: number
    netCash: number
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

function premiumFor(inp: GmmInputs, year: number): number {
  if (year < 1 || year > inp.years) return 0
  if (inp.premiumMode === 'annual') return inp.premium
  return year === 1 ? inp.premium : 0
}

/** Present values at year end `t` (t = 0 is initial recognition, before any cash flow). */
function presentValues(inp: GmmInputs, est: number[], t: number) {
  const v = 1 / (1 + inp.discountRate)
  const s = inp.settlementLag
  let claimsPv = 0
  let expensesPv = 0
  let inflowsPv = 0
  for (let k = t + 1; k <= inp.years; k++) {
    const startDisc = Math.pow(v, k - 1 - t)
    expensesPv += (inp.expenses[k - 1] ?? 0) * startDisc
    inflowsPv += premiumFor(inp, k) * startDisc
    claimsPv += (est[k - 1] ?? 0) * ((1 - s) * Math.pow(v, k - t) + s * Math.pow(v, k + 1 - t))
  }
  const acquisitionPv = t === 0 ? inp.acquisition : 0
  const outflowsPv = claimsPv + expensesPv + acquisitionPv
  return { claimsPv, outflowsPv, inflowsPv, fcf: outflowsPv - inflowsPv }
}

export function runGmm(inp: GmmInputs): GmmResult {
  const N = inp.years
  const r = inp.discountRate
  const v = 1 / (1 + r)
  const s = inp.settlementLag
  const est = inp.claims.slice(0, N).map((c) => c ?? 0)
  const cuTotal = sum(inp.coverageUnits.slice(0, N))
  const change = inp.assumptionChange && inp.assumptionChange.year >= 1 && inp.assumptionChange.year < N
    ? inp.assumptionChange
    : null

  // Initial recognition
  const pv0 = presentValues(inp, est, 0)
  const ra0 = inp.raPct * pv0.claimsPv
  const net0 = pv0.fcf + ra0
  const initial: InitialRecognition = {
    pvInflows: pv0.inflowsPv,
    pvOutflows: pv0.outflowsPv,
    fulfilmentCashFlows: pv0.fcf,
    riskAdjustment: ra0,
    csm: net0 < 0 ? -net0 : 0,
    lossComponent: net0 > 0 ? net0 : 0,
  }

  let fcf = pv0.fcf
  let ra = ra0
  let csm = initial.csm
  let lc = initial.lossComponent
  let licPv = 0
  let licRa = 0

  const years: YearResult[] = []
  const lastYear = s > 0 ? N + 1 : N

  for (let y = 1; y <= lastYear; y++) {
    const inCoverage = y <= N
    // Year 1 opens before the group exists; initial recognition is shown as a movement.
    const open: Balances = y === 1
      ? { fcf: 0, ra: 0, csm: 0, lossComponent: 0, licPv: 0, licRa: 0, lrc: 0, lic: 0 }
      : { fcf, ra, csm, lossComponent: lc, licPv, licRa, lrc: fcf + ra + csm, lic: licPv + licRa }
    const P = premiumFor(inp, y)
    const E = inCoverage ? inp.expenses[y - 1] ?? 0 : 0
    const A = y === 1 ? inp.acquisition : 0
    const expClaims = inCoverage ? est[y - 1] : 0
    const X = expClaims * (1 - s + s * v)

    const interestOnFcf = r * (fcf + P - E - A)
    const csmAccretion = r * csm
    const raCloseBefore = inCoverage ? inp.raPct * presentValues(inp, est, y).claimsPv : 0
    const raReleased = ra - raCloseBefore

    // Systematic allocation of the year's release between the loss component and the rest (IFRS 17.49-52)
    let alloc = 0
    if (lc > 0 && inCoverage) {
      const outflowsOpen = presentValues(inp, est, y - 1).outflowsPv - A
      const base = outflowsOpen + ra
      alloc = y === N ? lc : Math.min(lc, base > 0 ? (lc / base) * (X + E + raReleased) : lc)
    }
    let lcMid = lc - alloc

    // Change in estimates relating to future service (IFRS 17.44(c), B96)
    let changeInPv = 0
    let changeInRa = 0
    let csmAdjustedByChange = 0
    const initialLoss = y === 1 ? initial.lossComponent : 0
    let changeLoss = 0
    let lossReversal = 0
    let csmPre = csm + csmAccretion
    if (change && change.year === y) {
      const before = presentValues(inp, est, y).claimsPv
      for (let k = y + 1; k <= N; k++) est[k - 1] = est[k - 1] * (1 + change.futureClaimsPct)
      const after = presentValues(inp, est, y).claimsPv
      changeInPv = after - before
      changeInRa = inp.raPct * changeInPv
      const delta = changeInPv + changeInRa
      if (delta >= 0) {
        const absorbed = Math.min(csmPre, delta)
        csmPre -= absorbed
        csmAdjustedByChange = -absorbed
        changeLoss = delta - absorbed
        lcMid += changeLoss
      } else {
        const reversal = Math.min(lcMid, -delta)
        lcMid -= reversal
        lossReversal = reversal
        csmAdjustedByChange = -delta - reversal
        csmPre += csmAdjustedByChange
      }
    }

    const cuRemaining = sum(inp.coverageUnits.slice(y - 1, N))
    const csmRelease = inCoverage && cuRemaining > 0 ? csmPre * (inp.coverageUnits[y - 1] / cuRemaining) : 0
    const csmClose = csmPre - csmRelease
    const acquisitionAmortisation = inCoverage && cuTotal > 0 ? inp.acquisition * (inp.coverageUnits[y - 1] / cuTotal) : 0

    // Incurred claims and the liability for incurred claims
    const actualClaims = expClaims * (inCoverage ? inp.actualClaimsFactor[y - 1] ?? 1 : 0)
    const incurredClaimsPv = actualClaims * (1 - s + s * v)
    const newLicPv = s * v * actualClaims
    const newLicRa = inp.raPct * newLicPv
    const interestOnLic = r * licPv
    const claimsPaid = licPv * (1 + r) + (1 - s) * actualClaims
    const licRaReleased = licRa

    // Closing LRC fulfilment cash flows, measured directly
    const pvClose = inCoverage ? presentValues(inp, est, y) : { fcf: 0, claimsPv: 0 }
    const fcfClose = pvClose.fcf
    const raClose = inCoverage ? inp.raPct * pvClose.claimsPv : 0

    const revenueAnalysis: RevenueAnalysis = {
      expectedClaims: X,
      expectedExpenses: E,
      riskAdjustmentRelease: raReleased,
      csmRelease,
      acquisitionRecovery: acquisitionAmortisation,
      lessLossComponent: -alloc,
      total: X + E + raReleased + csmRelease + acquisitionAmortisation - alloc,
    }
    const onerousLoss = initialLoss + changeLoss
    const insuranceRevenue = revenueAnalysis.total
    const insuranceServiceExpense =
      incurredClaimsPv + newLicRa - licRaReleased + E + acquisitionAmortisation + onerousLoss - alloc - lossReversal
    const insuranceFinanceExpense = interestOnFcf + csmAccretion + interestOnLic
    const insuranceServiceResult = insuranceRevenue - insuranceServiceExpense

    const close: Balances = {
      fcf: fcfClose,
      ra: raClose,
      csm: csmClose,
      lossComponent: lcMid,
      licPv: newLicPv,
      licRa: newLicRa,
      lrc: fcfClose + raClose + csmClose,
      lic: newLicPv + newLicRa,
    }

    const yr: YearResult = {
      year: y,
      inCoverage,
      premiums: P,
      acquisitionPaid: A,
      expensesPaid: E,
      claimsPaid,
      actualClaims,
      open,
      close,
      interestOnFcf,
      csmAccretion,
      interestOnLic,
      expectedClaimsReleased: X,
      raReleased,
      changeInPv,
      changeInRa,
      csmAdjustedByChange,
      onerousLoss,
      initialLoss,
      changeLoss,
      lossReversal,
      lossComponentAllocation: alloc,
      csmRelease,
      acquisitionAmortisation,
      incurredClaimsPv,
      newLicRa,
      licRaReleased,
      insuranceRevenue,
      insuranceServiceExpense,
      insuranceServiceResult,
      insuranceFinanceExpense,
      profit: insuranceServiceResult - insuranceFinanceExpense,
      revenueAnalysis,
      journals: [],
    }
    yr.journals = buildJournals(yr)
    years.push(yr)

    fcf = fcfClose
    ra = raClose
    csm = csmClose
    lc = lcMid
    licPv = newLicPv
    licRa = newLicRa
  }

  const totals = {
    revenue: sum(years.map((y) => y.insuranceRevenue)),
    serviceExpense: sum(years.map((y) => y.insuranceServiceExpense)),
    financeExpense: sum(years.map((y) => y.insuranceFinanceExpense)),
    profit: sum(years.map((y) => y.profit)),
    netCash: sum(years.map((y) => y.premiums - y.acquisitionPaid - y.expensesPaid - y.claimsPaid)),
  }
  return { inputs: inp, initial, years, totals }
}

function entry(id: string, description: string, conceptId: string, debit: Account, credit: Account, amount: number): Journal | null {
  if (Math.abs(amount) < 1e-9) return null
  // A negative amount flips the entry so every line shows a positive figure.
  const [dr, cr, amt] = amount >= 0 ? [debit, credit, amount] : [credit, debit, -amount]
  return {
    id,
    description,
    conceptId,
    lines: [
      { account: dr, debit: amt, credit: 0 },
      { account: cr, debit: 0, credit: amt },
    ],
  }
}

function buildJournals(y: YearResult): Journal[] {
  const j: (Journal | null)[] = [
    entry('premium', 'Premiums received', 'lrc', 'Cash', 'LRC', y.premiums),
    entry('acq-paid', 'Insurance acquisition cash flows paid', 'acquisition-cash-flows', 'LRC', 'Cash', y.acquisitionPaid),
    entry('initial-loss', 'Loss on onerous group at initial recognition', 'onerous-contracts',
      'Insurance service expense', 'LRC', y.initialLoss),
    entry('revenue', 'Insurance revenue for services provided', 'insurance-revenue', 'LRC', 'Insurance revenue', y.insuranceRevenue),
    entry('acq-amort', 'Amortisation of insurance acquisition cash flows', 'acquisition-cash-flows',
      'Insurance service expense', 'LRC', y.acquisitionAmortisation),
    entry('claims-incurred', 'Claims and expenses incurred', 'lic',
      'Insurance service expense', 'LIC', y.incurredClaimsPv + y.newLicRa + y.expensesPaid),
    entry('lic-ra', 'Release of risk adjustment on incurred claims (past service)', 'risk-adjustment',
      'LIC', 'Insurance service expense', y.licRaReleased),
    entry('future-loss', 'Loss from changes in estimates (onerous)', 'onerous-contracts',
      'Insurance service expense', 'LRC', y.changeLoss),
    entry('lc-alloc', 'Allocation to the loss component and loss reversals', 'loss-component',
      'LRC', 'Insurance service expense', y.lossComponentAllocation + y.lossReversal),
    entry('ifie-lrc', 'Insurance finance expense: interest on LRC and CSM accretion', 'insurance-finance',
      'Insurance finance expense', 'LRC', y.interestOnFcf + y.csmAccretion),
    entry('ifie-lic', 'Insurance finance expense: interest on LIC', 'insurance-finance',
      'Insurance finance expense', 'LIC', y.interestOnLic),
    entry('paid', 'Claims and expenses paid', 'lic', 'LIC', 'Cash', y.claimsPaid + y.expensesPaid),
  ]
  return j.filter((x): x is Journal => x !== null)
}
