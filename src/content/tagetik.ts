import type { Concept } from './types'

/*
 * Tagetik track content describes implementation patterns. Product object names and screens
 * must be validated against a licensed CCH Tagetik release before publication; the UI shows
 * this as a validation banner on every page of the track.
 */
export const TAGETIK: Concept[] = [
  {
    id: 'tagetik-overview',
    title: 'IFRS 17 in CCH Tagetik: the end-to-end chain',
    track: 'C',
    module: 'C2',
    kind: 'tagetik',
    summary:
      'CCH Tagetik, a Wolters Kluwer product, offers an IFRS 17 solution that takes contract and actuarial data, calculates the CSM, LRC and LIC for the GMM, PAA and VFA, generates journals and produces disclosures. This track explains how each IFRS 17 concept maps to that chain.',
    explain: [
      'An IFRS 17 platform is a production line with five stations:',
      '- Data: contract, actuarial and actual cash flow data arrive and are validated.',
      '- Calculation: the measurement engine computes fulfilment cash flows, CSM, loss component, LRC and LIC per group.',
      '- Accounting: results become journal entries for the general ledger.',
      '- Reporting: reconciliations, revenue analysis and dashboards are produced.',
      '- Control: workflow, audit trail and drill-down prove how each number was produced.',
      'Wolters Kluwer describes its offering as covering a contract data repository, calculation of the CSM, LRC and LIC, support for all three measurement models, automatic journals and disclosures, and audit trail with drill-down.',
    ],
    apply: [
      'Design starts with the IFRS 17 policy decisions, because each one becomes configuration:',
      '- Grouping rules ([[level-of-aggregation|portfolio, profitability, cohort]]).',
      '- Measurement model per portfolio ([[gmm|GMM]], [[paa|PAA]], [[vfa|VFA]]).',
      '- Discount rate approach and locked-in rate method ([[discounting|discounting]]).',
      '- Coverage unit definition ([[coverage-units|coverage units]]).',
      '- OCI option and risk adjustment disaggregation ([[insurance-finance|finance]]).',
      '- Transition approach per group ([[transition|transition]]).',
    ],
    implement: [
      'A typical programme sequence: policy paper, data dictionary and interface specification, configuration of dimensions and grouping, calculation build and unit tests, accounting scheme and journal tests, disclosure reports, parallel runs, then go-live with a close calendar.',
      '> This track describes implementation patterns. Exact object names, screens and options differ by CCH Tagetik release and must be validated in your environment.',
    ],
    refs: ['IFRS 17.29–32', 'IFRS 17.93'],
    links: [
      { type: 'builds-on', to: 'ifrs17-why' },
      { type: 'builds-on', to: 'tagetik-data-model' },
      { type: 'builds-on', to: 'tagetik-csm-build' },
      { type: 'builds-on', to: 'tagetik-journals' },
      { type: 'builds-on', to: 'tagetik-disclosures' },
    ],
  },
  {
    id: 'tagetik-data-model',
    title: 'Designing the IFRS 17 data model',
    track: 'C',
    module: 'C3',
    kind: 'tagetik',
    summary:
      'Every IFRS 17 number is held at group-of-contracts level, so the data model must make the group key explicit and consistent across actuarial, finance and actual cash data. Most downstream problems trace back to this layer.',
    explain: [
      'Think of the data model as the filing system. If a cash flow is filed under the wrong group, the CSM, revenue and disclosures for both groups are wrong.',
    ],
    apply: [
      'Dimensions commonly needed for IFRS 17:',
      '- Legal entity and reporting currency',
      '- Portfolio, profitability bucket and cohort (together the group key)',
      '- Measurement model (GMM, PAA, VFA) and contract type (direct, reinsurance held)',
      '- Cash flow type (premium, claim, expense, acquisition, investment component)',
      '- Projection period and reporting period',
      '- Assumption version (current, prior, locked-in) for the analysis of change',
      '- Movement type, so each roll-forward step is its own record',
      '- Transition approach flag',
    ],
    implement: [
      'Patterns that work:',
      '- Validate the group key on load and reject unknown combinations rather than defaulting them.',
      '- Keep projected cash flows (from actuarial models) and actual cash flows (from policy admin and the ledger) in separate scenarios, then compare them for experience adjustments.',
      '- Version assumption sets so that a rerun reproduces a prior close exactly.',
      '- Keep the chart of accounts mapping outside the calculation so presentation changes, such as IFRS 18, do not touch measurement.',
    ],
    refs: ['IFRS 17.14–24'],
    links: [
      { type: 'builds-on', to: 'level-of-aggregation' },
      { type: 'builds-on', to: 'fulfilment-cash-flows' },
      { type: 'builds-on', to: 'coverage-units' },
    ],
    lenses: {
      developer: 'Agree the grain and sign convention with the actuarial team before building any calculation.',
    },
  },
  {
    id: 'tagetik-csm-build',
    title: 'Building the CSM and loss component calculation',
    track: 'C',
    module: 'C4',
    kind: 'tagetik',
    summary:
      'The CSM calculation runs per group and period in a fixed order of steps, storing each movement separately. The same structure handles the loss component when a group is or becomes onerous.',
    explain: [
      'The engine follows the same order as the standard: start with the opening CSM, add new business, add interest, adjust for changes in estimates, then release for service. Releasing before adjusting would give the wrong answer.',
    ],
    apply: [
      'Calculation steps for a GMM group, each stored as its own movement:',
      '- Opening CSM and loss component from the prior close',
      '- New contracts: fulfilment cash flows at initial recognition; CSM or loss',
      '- Interest accretion on the CSM at the locked-in rate',
      '- Changes in fulfilment cash flows relating to future service at locked-in rates',
      '- Onerous test: excess over CSM becomes a loss; favourable changes reverse the loss component first',
      '- Systematic allocation of the period’s release to the loss component',
      '- CSM release using coverage units for the period against current and future units',
      '- Closing CSM and loss component',
    ],
    implement: [
      'Build the steps as discrete calculation rules with intermediate results persisted, not as one formula. That gives auditors drill-down, lets you unit-test each rule against hand calculations, and lets the disclosure read movements directly.',
      'Golden-file testing: maintain a spreadsheet model for a handful of representative groups and compare every step after each change. This portal’s own sandbox engine is tested the same way, with checks that lifetime profit equals net cash and that every balance runs off to zero.',
    ],
    refs: ['IFRS 17.38', 'IFRS 17.44', 'IFRS 17.47–52', 'IFRS 17.B96', 'IFRS 17.B119'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'builds-on', to: 'loss-component' },
      { type: 'builds-on', to: 'coverage-units' },
      { type: 'builds-on', to: 'tagetik-data-model' },
    ],
    sandbox: 'rollforward',
  },
  {
    id: 'tagetik-journals',
    title: 'Accounting engine and journals',
    track: 'C',
    module: 'C4',
    kind: 'tagetik',
    summary:
      'An accounting scheme maps each IFRS 17 movement type to a debit and credit account. Journals are generated per group, aggregated to the general ledger grain, and posted with a reference back to the calculation.',
    explain: [
      'The calculation says "CSM released: 180". The accounting engine turns that into "debit LRC 180, credit insurance revenue 180" and sends it to the ledger.',
    ],
    apply: [
      'Typical posting scheme entries:',
      '- Premiums received: debit cash, credit LRC',
      '- Acquisition cash flows paid: debit LRC, credit cash',
      '- Insurance revenue: debit LRC, credit insurance revenue',
      '- Claims and expenses incurred: debit insurance service expense, credit LIC',
      '- Claims paid: debit LIC, credit cash',
      '- Interest accretion: debit insurance finance expense, credit LRC or LIC',
      '- Onerous losses and reversals: insurance service expense against LRC (loss component)',
    ],
    implement: [
      'Design choices to settle early: posting grain (group or portfolio), whether to post balances or movements, how to handle reversals of prior-period estimates, and how GL accounts map to IFRS 18 presentation lines. Every posted journal should carry the run identifier for drill-back.',
      '> The sandbox Journals tab shows this scheme posting live, and its tests prove the postings equal the measured LRC and LIC each year.',
    ],
    refs: ['IFRS 17.80–87'],
    links: [
      { type: 'builds-on', to: 'double-entry' },
      { type: 'builds-on', to: 'insurance-revenue' },
      { type: 'builds-on', to: 'tagetik-csm-build' },
    ],
    sandbox: 'journals',
  },
  {
    id: 'tagetik-disclosures',
    title: 'Disclosure reporting',
    track: 'C',
    module: 'C5',
    kind: 'tagetik',
    summary:
      'Disclosure reports read the stored movements and present them in the IFRS 17 reconciliation layouts. If movements are stored correctly, disclosures need no separate calculation.',
    explain: [
      'A reconciliation is just the movements of a balance, grouped into the lines the standard asks for.',
    ],
    apply: [
      'Map each movement type to a disclosure line once, for each of the reconciliations in IFRS 17.100–109. Check that every movement maps to exactly one line, and that each reconciliation ties to the balance sheet.',
    ],
    implement: [
      'Build automated tie-out checks into the close: opening equals prior closing, closing equals balance sheet, revenue analysis equals income statement revenue. Present failures in the workflow before reports are released.',
    ],
    refs: ['IFRS 17.98–109'],
    links: [
      { type: 'builds-on', to: 'disclosures' },
      { type: 'builds-on', to: 'tagetik-journals' },
    ],
    sandbox: 'disclosures',
  },
  {
    id: 'tagetik-testing',
    title: 'Testing, parallel runs and go-live',
    track: 'C',
    module: 'C6',
    kind: 'tagetik',
    summary:
      'IFRS 17 implementations are proven through layered testing: unit tests per calculation rule, end-to-end tests per group, and parallel runs over several closes before go-live. Each layer produces evidence auditors will ask for.',
    explain: [
      'Testing answers three questions: does each step calculate correctly, do the steps together produce the right balances, and does the full close run on time with real data?',
    ],
    apply: [
      '- Unit tests: each calculation rule against hand-built expected values.',
      '- Invariant tests: roll-forwards tie, balances run off to zero, journals balance.',
      '- Reconciliations: actuarial outputs to engine inputs; engine outputs to GL.',
      '- Parallel runs: at least two quarterly closes alongside the existing process.',
      '- Performance: full-volume close within the calendar window.',
    ],
    implement: [
      'Keep tests as a living asset after go-live. Every assumption change, release upgrade or new product should rerun the suite before the next close.',
    ],
    refs: ['IFRS 17.117'],
    links: [
      { type: 'builds-on', to: 'tagetik-csm-build' },
      { type: 'builds-on', to: 'tagetik-disclosures' },
    ],
  },
]
