import { FOUNDATIONS } from './foundations'
import { IFRS17 } from './ifrs17'
import { TAGETIK } from './tagetik'
import { GLOSSARY } from './glossary'
import type { Concept, EdgeType, Track } from './types'

export const CONCEPTS: Concept[] = [...FOUNDATIONS, ...IFRS17, ...TAGETIK]
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]))
export const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]))
export { GLOSSARY }

/** Content version shown on every page; bump on each editorial release. */
export const CONTENT_VERSION = '0.1 (prototype)'
export const CONTENT_STATUS = 'Draft: pending independent technical review'

export const TRACKS: Track[] = [
  {
    id: 'A',
    title: 'IFRS Foundations',
    tagline: 'From zero to reading an insurer’s accounts',
    audience: 'No accounting background needed',
    modules: [
      { code: 'A1', title: 'What IFRS is and why it exists', blurb: 'Who writes the rules and why they matter.', concepts: ['what-is-ifrs'] },
      { code: 'A2', title: 'The Conceptual Framework', blurb: 'Assets, liabilities, recognition and measurement.', concepts: [] },
      { code: 'A3', title: 'Reading the financial statements', blurb: 'The primary statements, and what IFRS 18 changes.', concepts: ['financial-statements'] },
      { code: 'A4', title: 'Standards every insurance learner meets', blurb: 'IFRS 9, 13, 15, 16, IAS 12, 21, 37 in brief.', concepts: [] },
      { code: 'A5', title: 'Double entry and the journal', blurb: 'Debits, credits and how numbers reach the accounts.', concepts: ['double-entry'] },
    ],
  },
  {
    id: 'B',
    title: 'IFRS 17 Insurance Contracts',
    tagline: 'The standard, explained, calculated and connected',
    audience: 'Accountants, actuaries, auditors and analysts',
    modules: [
      { code: 'B1', title: 'Why IFRS 17', blurb: 'What changed from IFRS 4 and why.', concepts: ['ifrs17-why'] },
      { code: 'B2', title: 'Scope and definitions', blurb: 'Significant insurance risk and separating components.', concepts: ['insurance-contract'] },
      { code: 'B3', title: 'Level of aggregation', blurb: 'Portfolios, profitability groups and cohorts.', concepts: ['level-of-aggregation'] },
      { code: 'B4', title: 'Recognition and contract boundary', blurb: 'Which cash flows belong to the contract.', concepts: ['contract-boundary'] },
      { code: 'B5', title: 'General Measurement Model', blurb: 'Fulfilment cash flows, discounting, risk adjustment and the CSM.', concepts: ['gmm', 'fulfilment-cash-flows', 'discounting', 'risk-adjustment', 'csm'] },
      { code: 'B6', title: 'Subsequent measurement', blurb: 'LRC, LIC, coverage units and acquisition cash flows.', concepts: ['lrc', 'lic', 'coverage-units', 'acquisition-cash-flows'] },
      { code: 'B7', title: 'Onerous contracts', blurb: 'Day-one losses and the loss component.', concepts: ['onerous-contracts', 'loss-component'] },
      { code: 'B8', title: 'Premium Allocation Approach', blurb: 'The simplified model for short-duration business.', concepts: ['paa'] },
      { code: 'B9', title: 'Variable Fee Approach', blurb: 'Direct participating contracts.', concepts: ['vfa'] },
      { code: 'B10', title: 'Reinsurance contracts held', blurb: 'Separate measurement and the loss-recovery component.', concepts: [] },
      { code: 'B11', title: 'Insurance finance income or expenses', blurb: 'Time value, financial risk and the OCI option.', concepts: ['insurance-finance'] },
      { code: 'B12', title: 'Presentation', blurb: 'Insurance revenue and the insurance service result.', concepts: ['insurance-revenue'] },
      { code: 'B13', title: 'Disclosures', blurb: 'Reconciliations, revenue analysis and CSM release.', concepts: ['disclosures'] },
      { code: 'B14', title: 'Transition', blurb: 'Full, modified retrospective and fair value approaches.', concepts: ['transition'] },
      { code: 'B15', title: 'Operating IFRS 17', blurb: 'Data, actuarial-finance handshake and close.', concepts: [] },
    ],
  },
  {
    id: 'C',
    title: 'IFRS 17 in CCH Tagetik',
    tagline: 'From the standard to a working implementation',
    audience: 'Consultants, developers and finance system owners',
    modules: [
      { code: 'C1', title: 'Platform foundations', blurb: 'Dimensions, scenarios, processing, workflow and reporting.', concepts: [] },
      { code: 'C2', title: 'The end-to-end IFRS 17 chain', blurb: 'Data, calculation, accounting, reporting, control.', concepts: ['tagetik-overview'] },
      { code: 'C3', title: 'Design decisions', blurb: 'Group keys, grain, interfaces and mapping.', concepts: ['tagetik-data-model'] },
      { code: 'C4', title: 'Build patterns', blurb: 'CSM, loss component and journal generation.', concepts: ['tagetik-csm-build', 'tagetik-journals'] },
      { code: 'C5', title: 'Disclosure reporting', blurb: 'Reconciliations straight from movements.', concepts: ['tagetik-disclosures'] },
      { code: 'C6', title: 'Testing and go-live', blurb: 'Unit tests, parallel runs and controls evidence.', concepts: ['tagetik-testing'] },
    ],
  },
]

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<string, Track>

export const EDGE_LABEL: Record<EdgeType, string> = {
  'builds-on': 'Builds on',
  'measured-by': 'Measured by',
  'posts-to': 'Posts to',
  'disclosed-in': 'Disclosed in',
  'implemented-by': 'Implemented by',
  'contrasts-with': 'Compare with',
  'requires-data': 'Requires data from',
}

/** Links in both directions, so a page also lists what points at it. */
export function relatedOf(id: string): { type: EdgeType; concept: Concept; inbound: boolean }[] {
  const c = CONCEPT_BY_ID[id]
  const out = (c?.links ?? [])
    .filter((l) => CONCEPT_BY_ID[l.to])
    .map((l) => ({ type: l.type, concept: CONCEPT_BY_ID[l.to], inbound: false }))
  const seen = new Set(out.map((o) => o.concept.id))
  for (const other of CONCEPTS) {
    for (const l of other.links) {
      if (l.to === id && !seen.has(other.id)) {
        seen.add(other.id)
        out.push({ type: l.type, concept: other, inbound: true })
      }
    }
  }
  return out
}

export const ROLES = [
  { id: 'newcomer', label: 'New to accounting', start: 'what-is-ifrs', depth: 'explain' },
  { id: 'auditor', label: 'Auditor or advisor', start: 'ifrs17-why', depth: 'apply' },
  { id: 'finance', label: 'Insurance finance', start: 'gmm', depth: 'apply' },
  { id: 'actuary', label: 'Actuary', start: 'csm', depth: 'apply' },
  { id: 'developer', label: 'Tagetik consultant or developer', start: 'tagetik-overview', depth: 'implement' },
  { id: 'executive', label: 'Executive', start: 'ifrs17-why', depth: 'explain' },
] as const

export type RoleId = (typeof ROLES)[number]['id']
export type Depth = 'explain' | 'apply' | 'implement'
