import { describe, expect, it } from 'vitest'
import { runGmm, type GmmInputs } from './gmm'
import { PRESETS } from './presets'

const base: GmmInputs = {
  years: 1,
  premiumMode: 'single',
  premium: 100,
  claims: [70],
  expenses: [0],
  acquisition: 0,
  discountRate: 0,
  raPct: 0.1,
  settlementLag: 0,
  coverageUnits: [1],
  actualClaimsFactor: [1],
  assumptionChange: null,
}

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6)

describe('hand-checked cases', () => {
  it('one-year profitable contract', () => {
    const r = runGmm(base)
    close(r.initial.riskAdjustment, 7)
    close(r.initial.csm, 23)
    close(r.initial.lossComponent, 0)
    const y = r.years[0]
    close(y.insuranceRevenue, 100)
    close(y.insuranceServiceExpense, 70)
    close(y.profit, 30)
  })

  it('one-year onerous contract', () => {
    const r = runGmm({ ...base, claims: [110] })
    close(r.initial.lossComponent, 21)
    close(r.initial.csm, 0)
    const y = r.years[0]
    // revenue excludes amounts allocated to the loss component
    close(y.insuranceRevenue, 100)
    close(y.insuranceServiceExpense, 110)
    close(y.profit, -10)
    close(y.close.lossComponent, 0)
  })

  it('CSM accretes at the discount rate and releases by coverage units', () => {
    const r = runGmm({ ...base, years: 2, claims: [40, 40], expenses: [0, 0], coverageUnits: [1, 1], actualClaimsFactor: [1, 1], discountRate: 0.05, raPct: 0 })
    const [y1, y2] = r.years
    close(y1.csmAccretion, r.initial.csm * 0.05)
    close(y1.csmRelease, (r.initial.csm * 1.05) / 2)
    close(y2.close.csm, 0)
  })
})

const scenarios: [string, GmmInputs][] = [
  ...PRESETS.map((p) => [p.name, p.inputs] as [string, GmmInputs]),
  ['favourable change reverses losses', { ...PRESETS[1].inputs, years: 3, assumptionChange: { year: 1, futureClaimsPct: -0.3 } }],
  ['severe deterioration makes group onerous', { ...PRESETS[0].inputs, assumptionChange: { year: 1, futureClaimsPct: 0.6 } }],
  ['experience variance with lag', { ...PRESETS[3].inputs, actualClaimsFactor: [1.3, 0.7, 1.2, 0.9] }],
]

describe.each(scenarios)('invariants: %s', (_name, inputs) => {
  const r = runGmm(inputs)

  it('lifetime profit equals undiscounted net cash flow', () => {
    close(r.totals.profit, r.totals.netCash)
  })

  it('all balances run off to zero', () => {
    const last = r.years[r.years.length - 1].close
    close(last.lrc, 0)
    close(last.lic, 0)
    close(last.csm, 0)
    close(last.lossComponent, 0)
  })

  it('CSM and loss component are never negative and never coexist', () => {
    for (const y of r.years) {
      expect(y.close.csm).toBeGreaterThanOrEqual(-1e-9)
      expect(y.close.lossComponent).toBeGreaterThanOrEqual(-1e-9)
      expect(y.close.csm > 1e-6 && y.close.lossComponent > 1e-6).toBe(false)
    }
  })

  it('LRC and LIC roll forward from their movements', () => {
    for (const y of r.years) {
      const lrcMove = y.premiums - y.acquisitionPaid - y.insuranceRevenue + y.acquisitionAmortisation +
        y.onerousLoss - y.lossComponentAllocation - y.lossReversal + y.interestOnFcf + y.csmAccretion
      close(y.close.lrc - y.open.lrc, lrcMove)
      const licMove = y.incurredClaimsPv + y.newLicRa - y.licRaReleased + y.expensesPaid + y.interestOnLic -
        y.claimsPaid - y.expensesPaid
      close(y.close.lic - y.open.lic, licMove)
    }
  })

  it('journals balance and post exactly to the measured liabilities', () => {
    let lrc = 0
    let lic = 0
    for (const y of r.years) {
      for (const j of y.journals) {
        const dr = j.lines.reduce((a, l) => a + l.debit, 0)
        const cr = j.lines.reduce((a, l) => a + l.credit, 0)
        close(dr, cr)
        for (const l of j.lines) {
          if (l.account === 'LRC') lrc += l.credit - l.debit
          if (l.account === 'LIC') lic += l.credit - l.debit
        }
      }
      close(lrc, y.close.lrc)
      close(lic, y.close.lic)
    }
  })

  it('revenue analysis sums to insurance revenue', () => {
    for (const y of r.years) {
      const a = y.revenueAnalysis
      close(a.expectedClaims + a.expectedExpenses + a.riskAdjustmentRelease + a.csmRelease + a.acquisitionRecovery + a.lessLossComponent, y.insuranceRevenue)
    }
  })
})

import { componentReconciliation, liabilityReconciliation, revenueAnalysis, ties } from './disclosures'

describe.each(scenarios)('disclosures tie: %s', (_name, inputs) => {
  const r = runGmm(inputs)
  it('every reconciliation ties opening to closing', () => {
    for (const y of r.years) {
      expect(ties(liabilityReconciliation(y))).toBe(true)
      expect(ties(componentReconciliation(r, y))).toBe(true)
      const rev = revenueAnalysis(y)
      close(rev.rows[rev.rows.length - 1].values[0], y.insuranceRevenue)
    }
  })
})
