import type { GmmResult, YearResult } from './gmm'

export interface DisclosureRow {
  label: string
  values: number[]
  /** Concept page that explains this line. */
  concept?: string
  kind?: 'balance' | 'movement' | 'subtotal'
}

export interface DisclosureTable {
  id: string
  title: string
  reference: string
  columns: string[]
  rows: DisclosureRow[]
}

const withTotal = (vals: number[]) => [...vals, vals.reduce((a, b) => a + b, 0)]

/** IFRS 17.100 and 103: LRC excluding the loss component, the loss component, and the LIC. */
export function liabilityReconciliation(y: YearResult): DisclosureTable {
  const row = (label: string, ex: number, lc: number, lic: number, concept?: string, kind: DisclosureRow['kind'] = 'movement'): DisclosureRow => ({
    label, values: withTotal([ex, lc, lic]), concept, kind,
  })
  return {
    id: 'lrc-lic',
    title: 'Reconciliation of insurance contract liabilities',
    reference: 'IFRS 17.100, 103',
    columns: ['LRC excl. loss component', 'Loss component', 'LIC', 'Total'],
    rows: [
      row('Opening balance', y.open.lrc - y.open.lossComponent, y.open.lossComponent, y.open.lic, undefined, 'balance'),
      row('Insurance revenue', -y.insuranceRevenue, 0, 0, 'insurance-revenue'),
      row('Incurred claims and other insurance service expenses', 0, 0, y.incurredClaimsPv + y.newLicRa + y.expensesPaid, 'lic'),
      row('Amortisation of insurance acquisition cash flows', y.acquisitionAmortisation, 0, 0, 'acquisition-cash-flows'),
      row('Losses on onerous contracts and reversals', 0, y.onerousLoss - y.lossComponentAllocation - y.lossReversal, 0, 'loss-component'),
      row('Adjustments to liabilities for incurred claims', 0, 0, -y.licRaReleased, 'lic'),
      row('Insurance finance expenses', y.interestOnFcf + y.csmAccretion, 0, y.interestOnLic, 'insurance-finance'),
      row('Premiums received', y.premiums, 0, 0, 'lrc'),
      row('Insurance acquisition cash flows paid', -y.acquisitionPaid, 0, 0, 'acquisition-cash-flows'),
      row('Claims and other insurance service expenses paid', 0, 0, -(y.claimsPaid + y.expensesPaid), 'lic'),
      row('Closing balance', y.close.lrc - y.close.lossComponent, y.close.lossComponent, y.close.lic, undefined, 'balance'),
    ],
  }
}

/** IFRS 17.101 and 104: present value of future cash flows, risk adjustment and CSM. */
export function componentReconciliation(r: GmmResult, y: YearResult): DisclosureTable {
  const row = (label: string, pv: number, ra: number, csm: number, concept?: string, kind: DisclosureRow['kind'] = 'movement'): DisclosureRow => ({
    label, values: withTotal([pv, ra, csm]), concept, kind,
  })
  const rows: DisclosureRow[] = [
    row('Opening balance', y.open.fcf + y.open.licPv, y.open.ra + y.open.licRa, y.open.csm, undefined, 'balance'),
  ]
  if (y.year === 1) {
    rows.push(row('Contracts initially recognised', r.initial.fulfilmentCashFlows, r.initial.riskAdjustment, r.initial.csm, 'gmm'))
  }
  if (y.changeInPv !== 0) {
    rows.push(row('Changes in estimates relating to future service', y.changeInPv, y.changeInRa, y.csmAdjustedByChange, 'csm'))
  }
  rows.push(
    row('CSM recognised for services provided', 0, 0, -y.csmRelease, 'coverage-units'),
    row('Change in risk adjustment for risk expired', 0, -y.raReleased, 0, 'risk-adjustment'),
    row('Experience adjustments', y.incurredClaimsPv - y.expectedClaimsReleased, 0, 0, 'fulfilment-cash-flows'),
    row('Risk adjustment on claims incurred', 0, y.newLicRa, 0, 'lic'),
    row('Changes relating to past service', 0, -y.licRaReleased, 0, 'lic'),
    row('Insurance finance expenses', y.interestOnFcf + y.interestOnLic, 0, y.csmAccretion, 'insurance-finance'),
    row('Cash flows', y.premiums - y.expensesPaid - y.acquisitionPaid - y.claimsPaid, 0, 0, 'fulfilment-cash-flows'),
    row('Closing balance', y.close.fcf + y.close.licPv, y.close.ra + y.close.licRa, y.close.csm, undefined, 'balance'),
  )
  return {
    id: 'components',
    title: 'Reconciliation of measurement components',
    reference: 'IFRS 17.101, 104',
    columns: ['PV of future cash flows', 'Risk adjustment', 'CSM', 'Total'],
    rows: rows.filter((x) => x.kind === 'balance' || x.values.some((v) => Math.abs(v) > 1e-9)),
  }
}

/** IFRS 17.106: analysis of insurance revenue. */
export function revenueAnalysis(y: YearResult): DisclosureTable {
  const a = y.revenueAnalysis
  const row = (label: string, v: number, concept?: string, kind: DisclosureRow['kind'] = 'movement'): DisclosureRow => ({ label, values: [v], concept, kind })
  return {
    id: 'revenue',
    title: 'Analysis of insurance revenue',
    reference: 'IFRS 17.106, B124',
    columns: ['Amount'],
    rows: [
      row('Expected claims for the period', a.expectedClaims, 'insurance-revenue'),
      row('Expected other insurance service expenses', a.expectedExpenses, 'insurance-revenue'),
      row('Change in risk adjustment for risk expired', a.riskAdjustmentRelease, 'risk-adjustment'),
      row('CSM recognised for services provided', a.csmRelease, 'csm'),
      row('Recovery of insurance acquisition cash flows', a.acquisitionRecovery, 'acquisition-cash-flows'),
      row('Less amounts allocated to the loss component', a.lessLossComponent, 'loss-component'),
      row('Insurance revenue', a.total, 'insurance-revenue', 'subtotal'),
    ].filter((x) => x.kind === 'subtotal' || Math.abs(x.values[0]) > 1e-9),
  }
}

/** True when the movements of a reconciliation add up from opening to closing in every column. */
export function ties(t: DisclosureTable, tolerance = 1e-6): boolean {
  const open = t.rows[0].values
  const close = t.rows[t.rows.length - 1].values
  const moves = t.rows.slice(1, -1)
  return open.every((o, i) => Math.abs(o + moves.reduce((a, m) => a + m.values[i], 0) - close[i]) < tolerance)
}
