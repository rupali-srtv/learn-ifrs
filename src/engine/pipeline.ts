/**
 * A teaching model of the IFRS 17 data-to-ledger chain that a CCH Tagetik implementation builds:
 * interface load, validation, movement records, posting rules, reconciliation and drill-back.
 * Names and codes are illustrative patterns, not product objects.
 */
import { liabilityReconciliation } from './disclosures'
import type { Account, GmmResult, Journal } from './gmm'

export type FlowType = 'PREMIUM' | 'ACQUISITION' | 'EXPENSE' | 'CLAIM_PAID'
export type ErrorKind = 'missing-key' | 'duplicate' | 'cohort' | 'sign' | 'currency'

export const ERROR_LABEL: Record<ErrorKind, string> = {
  'missing-key': 'Blank portfolio on one row',
  duplicate: 'The same row loaded twice',
  cohort: 'A policy from another annual cohort',
  sign: 'An outflow loaded with the wrong sign',
  currency: 'An unknown currency code',
}

export interface SourceRow {
  rowId: string
  policy: string
  entity: string
  portfolio: string
  cohort: string
  profitability: string
  period: string
  flowType: FlowType
  currency: string
  /** Inflows positive, outflows negative. */
  amount: number
}

export interface Group {
  entity: string
  portfolio: string
  cohort: string
  profitability: string
  key: string
}

const POLICIES: [string, number][] = [['POL-0001', 0.5], ['POL-0002', 0.3], ['POL-0003', 0.2]]
const CURRENCIES = new Set(['EUR', 'GBP', 'USD'])
const FIRST_YEAR = 2025

export function groupOf(r: GmmResult): Group {
  const g = { entity: 'EU01', portfolio: 'TERM-LIFE', cohort: String(FIRST_YEAR), profitability: r.initial.lossComponent > 0 ? 'ONEROUS' : 'NOT-ONEROUS' }
  return { ...g, key: `${g.entity}|${g.portfolio}|${g.cohort}|${g.profitability}` }
}

export const periodOf = (year: number) => String(FIRST_YEAR + year - 1)

/** The cash flows the source systems report for one year, by policy. */
export function controlTotals(r: GmmResult, yearIdx: number): Record<FlowType, number> {
  const y = r.years[yearIdx]
  return { PREMIUM: y.premiums, ACQUISITION: -y.acquisitionPaid, EXPENSE: -y.expensesPaid, CLAIM_PAID: -y.claimsPaid }
}

export function sourceRows(r: GmmResult, yearIdx: number, errors: ErrorKind[] = []): SourceRow[] {
  const g = groupOf(r)
  const y = r.years[yearIdx]
  const totals = controlTotals(r, yearIdx)
  const rows: SourceRow[] = []
  let n = 1
  for (const flowType of ['PREMIUM', 'ACQUISITION', 'EXPENSE', 'CLAIM_PAID'] as FlowType[]) {
    if (Math.abs(totals[flowType]) < 1e-9) continue
    for (const [policy, share] of POLICIES) {
      rows.push({
        rowId: `R${String(n++).padStart(3, '0')}`,
        policy,
        entity: g.entity,
        portfolio: g.portfolio,
        cohort: g.cohort,
        profitability: g.profitability,
        period: periodOf(y.year),
        flowType,
        currency: 'EUR',
        amount: Math.round(totals[flowType] * share * 100) / 100,
      })
    }
  }
  // Rounding: the last row of each flow type absorbs the difference so rows add up to the control total.
  for (const ft of Object.keys(totals) as FlowType[]) {
    const of = rows.filter((x) => x.flowType === ft)
    if (!of.length) continue
    const diff = totals[ft] - of.reduce((a, x) => a + x.amount, 0)
    of[of.length - 1].amount = Math.round((of[of.length - 1].amount + diff) * 100) / 100
  }
  const out = rows.map((x) => ({ ...x }))
  if (!out.length) return out
  if (errors.includes('missing-key')) out[Math.min(1, out.length - 1)].portfolio = ''
  if (errors.includes('currency')) out[Math.min(2, out.length - 1)].currency = 'EUX'
  if (errors.includes('cohort')) out[out.length - 1].cohort = String(FIRST_YEAR - 2)
  if (errors.includes('sign')) {
    const o = out.find((x) => x.amount < 0)
    if (o) o.amount = -o.amount
  }
  if (errors.includes('duplicate')) out.splice(1, 0, { ...out[0] })
  return out
}

export interface RuleResult {
  id: string
  rule: string
  why: string
  failing: string[]
  /** Blocking rules stop the period from being submitted. */
  blocking: boolean
}

export function validate(rows: SourceRow[], group: Group, control: Record<FlowType, number>): RuleResult[] {
  const seen = new Map<string, number>()
  for (const x of rows) seen.set(x.rowId, (seen.get(x.rowId) ?? 0) + 1)
  const loaded = (ft: FlowType) => rows.filter((x) => x.flowType === ft).reduce((a, x) => a + x.amount, 0)
  const outflow = (ft: FlowType) => ft !== 'PREMIUM'
  return [
    {
      id: 'V01',
      rule: 'Every row carries a complete group key',
      why: 'Entity, portfolio, annual cohort and profitability group identify the unit of account (IFRS 17.14–24).',
      failing: rows.filter((x) => !x.entity || !x.portfolio || !x.cohort || !x.profitability).map((x) => x.rowId),
      blocking: true,
    },
    {
      id: 'V02',
      rule: 'No row is loaded twice',
      why: 'A duplicate silently doubles cash flows. Row identifiers must be unique per load.',
      failing: [...seen.entries()].filter(([, c]) => c > 1).map(([id]) => id),
      blocking: true,
    },
    {
      id: 'V03',
      rule: 'Policies belong to the group’s annual cohort',
      why: 'A group may not contain contracts issued more than one year apart (IFRS 17.22).',
      failing: rows.filter((x) => x.cohort && x.cohort !== group.cohort).map((x) => x.rowId),
      blocking: true,
    },
    {
      id: 'V04',
      rule: 'Sign convention: inflows positive, outflows negative',
      why: 'A flipped sign turns a payment into a receipt and misstates the liability.',
      failing: rows.filter((x) => (outflow(x.flowType) ? x.amount > 0 : x.amount < 0)).map((x) => x.rowId),
      blocking: true,
    },
    {
      id: 'V05',
      rule: 'Currency exists in the currency master',
      why: 'Unknown currencies cannot be translated or grouped (IAS 21).',
      failing: rows.filter((x) => !CURRENCIES.has(x.currency)).map((x) => x.rowId),
      blocking: true,
    },
    {
      id: 'V06',
      rule: 'Loaded totals equal source-system control totals',
      why: 'Completeness and accuracy: what was loaded is what the source system holds.',
      failing: (Object.keys(control) as FlowType[]).filter((ft) => Math.abs(loaded(ft) - control[ft]) > 0.005),
      blocking: true,
    },
  ]
}

export interface MovementRecord {
  code: string
  label: string
  lrcExLc: number
  lc: number
  lic: number
  kind: 'balance' | 'movement'
}

const MOVEMENT_CODES = ['M00', 'M10', 'M20', 'M30', 'M40', 'M50', 'M60', 'M70', 'M80', 'M90', 'M99']

export function movementRecords(r: GmmResult, yearIdx: number): MovementRecord[] {
  const t = liabilityReconciliation(r.years[yearIdx])
  return t.rows.map((row, i) => ({
    code: MOVEMENT_CODES[i],
    label: row.label,
    lrcExLc: row.values[0],
    lc: row.values[1],
    lic: row.values[2],
    kind: row.kind === 'balance' ? 'balance' : 'movement',
  }))
}

export const GL: Record<Account, { code: string; name: string }> = {
  Cash: { code: '1000', name: 'Cash and cash equivalents' },
  LRC: { code: '2100', name: 'Insurance contract liabilities: remaining coverage' },
  LIC: { code: '2200', name: 'Insurance contract liabilities: incurred claims' },
  'Insurance revenue': { code: '4100', name: 'Insurance revenue' },
  'Insurance service expense': { code: '5100', name: 'Insurance service expenses' },
  'Insurance finance expense': { code: '6100', name: 'Insurance finance expenses' },
}

/** Which movement record each journal is generated from (the posting scheme). */
export const POSTING_RULE: Record<string, { movement: string; sources: FlowType[] }> = {
  premium: { movement: 'M70', sources: ['PREMIUM'] },
  'acq-paid': { movement: 'M80', sources: ['ACQUISITION'] },
  'initial-loss': { movement: 'M40', sources: [] },
  revenue: { movement: 'M10', sources: [] },
  'acq-amort': { movement: 'M30', sources: [] },
  'claims-incurred': { movement: 'M20', sources: [] },
  'lic-ra': { movement: 'M50', sources: [] },
  'future-loss': { movement: 'M40', sources: [] },
  'lc-alloc': { movement: 'M40', sources: [] },
  'ifie-lrc': { movement: 'M60', sources: [] },
  'ifie-lic': { movement: 'M60', sources: [] },
  paid: { movement: 'M90', sources: ['CLAIM_PAID', 'EXPENSE'] },
}

export interface Posting {
  journalId: string
  description: string
  conceptId: string
  movement: string
  sources: FlowType[]
  account: Account
  gl: string
  debit: number
  credit: number
}

export function postings(r: GmmResult, yearIdx: number): Posting[] {
  return r.years[yearIdx].journals.flatMap((j: Journal) =>
    j.lines.map((l) => ({
      journalId: j.id,
      description: j.description,
      conceptId: j.conceptId,
      movement: POSTING_RULE[j.id]?.movement ?? 'M??',
      sources: POSTING_RULE[j.id]?.sources ?? [],
      account: l.account,
      gl: GL[l.account].code,
      debit: l.debit,
      credit: l.credit,
    })),
  )
}

export interface TieOut {
  id: string
  check: string
  left: { label: string; value: number }
  right: { label: string; value: number }
  ok: boolean
}

/** Closing GL balance (credit positive for liabilities) from all postings up to and including the year. */
function glCredit(r: GmmResult, yearIdx: number, account: Account): number {
  let bal = 0
  for (let i = 0; i <= yearIdx; i++) for (const p of postings(r, i)) if (p.account === account) bal += p.credit - p.debit
  return bal
}

export function reconcile(r: GmmResult, yearIdx: number, loaded: SourceRow[]): TieOut[] {
  const y = r.years[yearIdx]
  const ps = postings(r, yearIdx)
  const dr = ps.reduce((a, p) => a + p.debit, 0)
  const cr = ps.reduce((a, p) => a + p.credit, 0)
  const mv = movementRecords(r, yearIdx)
  const close = mv[mv.length - 1]
  const sumMv = (f: (m: MovementRecord) => number) => mv.slice(0, -1).reduce((a, m) => a + f(m), 0)
  const glCashMove = ps.filter((p) => p.account === 'Cash').reduce((a, p) => a + p.debit - p.credit, 0)
  const ifCash = loaded.reduce((a, x) => a + x.amount, 0)
  const revGl = ps.filter((p) => p.account === 'Insurance revenue').reduce((a, p) => a + p.credit - p.debit, 0)
  const tol = 0.005
  const mk = (id: string, check: string, l: string, lv: number, rl: string, rv: number): TieOut => ({
    id, check, left: { label: l, value: lv }, right: { label: rl, value: rv }, ok: Math.abs(lv - rv) < tol,
  })
  return [
    mk('T1', 'Journals balance', 'Total debits', dr, 'Total credits', cr),
    mk('T2', 'Movement records roll from opening to closing', 'Opening plus movements', sumMv((m) => m.lrcExLc + m.lc + m.lic), 'Closing balance', close.lrcExLc + close.lc + close.lic),
    mk('T3', 'GL remaining coverage equals the measured LRC', 'GL 2100 balance', glCredit(r, yearIdx, 'LRC'), 'Measured LRC', y.close.lrc),
    mk('T4', 'GL incurred claims equals the measured LIC', 'GL 2200 balance', glCredit(r, yearIdx, 'LIC'), 'Measured LIC', y.close.lic),
    mk('T5', 'Interface cash equals cash booked from treasury', 'Cash per IFRS 17 interface', ifCash, 'Cash per general ledger', glCashMove),
    mk('T6', 'GL revenue equals the disclosed revenue analysis', 'GL 4100', revGl, 'IFRS 17.106 total', y.revenueAnalysis.total),
  ]
}
