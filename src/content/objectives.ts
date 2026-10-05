/**
 * What each page teaches and what a learner should read first.
 * Objectives are things a learner can do after the page; prerequisites are concept ids.
 */
export interface PageGoals {
  objectives: string[]
  prerequisites: string[]
}

export const GOALS: Record<string, PageGoals> = {
  'what-is-ifrs': {
    objectives: [
      'Explain who issues IFRS Accounting Standards and why countries adopt them',
      'Describe what a preparer does when no Standard applies to a transaction',
      'Recognise that a country can adopt IFRS with local changes, as India does with Ind AS',
    ],
    prerequisites: [],
  },
  'conceptual-framework': {
    objectives: [
      'Define an asset, a liability, income and expenses in the Conceptual Framework’s terms',
      'Explain the role of the Framework when no Standard applies',
      'Connect the Framework’s measurement ideas to how IFRS 17 measures insurance liabilities',
    ],
    prerequisites: ['what-is-ifrs'],
  },
  'financial-statements': {
    objectives: [
      'Name the primary financial statements and the question each one answers',
      'Find where insurance contract balances and results appear in an insurer’s accounts',
      'Describe in outline what IFRS 18 changes in the statement of profit or loss',
    ],
    prerequisites: ['what-is-ifrs'],
  },
  'key-standards': {
    objectives: [
      'Name the other Standards that shape an insurer’s accounts alongside IFRS 17',
      'Explain why IFRS 9 choices for investments interact with IFRS 17 choices for liabilities',
      'Identify contracts that look like insurance but fall under another Standard',
    ],
    prerequisites: ['conceptual-framework', 'financial-statements'],
  },
  'double-entry': {
    objectives: [
      'Record a transaction as a debit and an equal credit',
      'Explain why a premium received is credited to a liability rather than to revenue under IFRS 17',
      'Read a simple IFRS 17 journal entry and say what it does to the accounts',
    ],
    prerequisites: ['financial-statements'],
  },
  'ifrs17-why': {
    objectives: [
      'Explain the problems with IFRS 4 that IFRS 17 was designed to solve',
      'List the main changes IFRS 17 brought to insurers’ accounts',
      'State when IFRS 17 became effective, and how India applies it through Ind AS 117',
    ],
    prerequisites: ['what-is-ifrs'],
  },
  'insurance-contract': {
    objectives: [
      'Apply the definition of an insurance contract, including significant insurance risk',
      'Identify contracts excluded from IFRS 17’s scope',
      'Explain when components of a contract are separated and accounted for under other Standards',
    ],
    prerequisites: ['ifrs17-why'],
  },
  'level-of-aggregation': {
    objectives: [
      'Divide a portfolio into groups by expected profitability at initial recognition',
      'Explain why contracts issued more than one year apart cannot be in the same group',
      'Explain why the group is the unit of account for the CSM and the loss component',
    ],
    prerequisites: ['insurance-contract'],
  },
  'contract-boundary': {
    objectives: [
      'Decide which future premiums and benefits fall within a contract’s boundary',
      'Apply the repricing tests for an individual policyholder and for a portfolio',
      'Explain why cash flows outside the boundary are not recognised',
    ],
    prerequisites: ['level-of-aggregation'],
  },
  gmm: {
    objectives: [
      'Name the building blocks of the General Measurement Model',
      'Measure a group at initial recognition so that no day-one gain arises',
      'Explain why total profit over a group’s life equals its net cash flows before investment income',
    ],
    prerequisites: ['level-of-aggregation', 'contract-boundary'],
  },
  'fulfilment-cash-flows': {
    objectives: [
      'List the cash flows that belong in the fulfilment cash flows',
      'Calculate the present value of expected outflows for a group',
      'Explain why fulfilment cash flows are remeasured at every reporting date',
    ],
    prerequisites: ['gmm'],
  },
  discounting: {
    objectives: [
      'Calculate discount factors and present values for cash flows at different times in a year',
      'Explain the difference between current rates and the locked-in rate used for the CSM',
      'Describe how unwinding the discount creates insurance finance expenses',
    ],
    prerequisites: ['fulfilment-cash-flows'],
  },
  'risk-adjustment': {
    objectives: [
      'Explain what the risk adjustment compensates the insurer for',
      'Calculate a risk adjustment and its release as risk expires',
      'Describe the confidence level disclosure IFRS 17 requires',
    ],
    prerequisites: ['fulfilment-cash-flows'],
  },
  csm: {
    objectives: [
      'Calculate the CSM at initial recognition',
      'Roll the CSM forward for a year: interest accretion, changes in estimates and release',
      'List the steps of the CSM roll-forward in the order they are applied',
    ],
    prerequisites: ['gmm', 'discounting', 'risk-adjustment'],
  },
  'coverage-units': {
    objectives: [
      'Explain what coverage units measure',
      'Calculate the CSM release for a period from coverage units',
      'Show how falling cover, for example from lapses, brings profit forward',
    ],
    prerequisites: ['csm'],
  },
  lrc: {
    objectives: [
      'Identify the components of the liability for remaining coverage',
      'Calculate the LRC at a reporting date from its building blocks',
      'Explain how the LRC turns into insurance revenue as cover is provided',
    ],
    prerequisites: ['csm'],
  },
  lic: {
    objectives: [
      'Explain why the liability for incurred claims carries no CSM',
      'Measure the LIC for unpaid claims: discounting and the risk adjustment',
      'Trace how incurred claims move from the LIC to cash when they are paid',
    ],
    prerequisites: ['lrc', 'discounting', 'risk-adjustment'],
  },
  'acquisition-cash-flows': {
    objectives: [
      'Explain how acquisition cash flows such as commission affect the CSM',
      'Calculate the recovery of acquisition cash flows included in revenue each period',
      'Explain why that recovery is matched by an equal insurance service expense',
    ],
    prerequisites: ['fulfilment-cash-flows', 'csm'],
  },
  'onerous-contracts': {
    objectives: [
      'Test whether a group is onerous at initial recognition',
      'Calculate the loss recognised immediately in profit or loss',
      'Explain how a profitable group can become onerous later',
    ],
    prerequisites: ['csm', 'risk-adjustment'],
  },
  'loss-component': {
    objectives: [
      'Explain why the loss component exists',
      'Allocate the release of expected outflows between the loss component and the rest of the LRC',
      'Show why the day-one loss is not counted again as claims are incurred',
    ],
    prerequisites: ['onerous-contracts'],
  },
  paa: {
    objectives: [
      'Decide whether a group is eligible for the Premium Allocation Approach',
      'Measure the LRC under the PAA',
      'Compare PAA results with the General Measurement Model',
    ],
    prerequisites: ['gmm', 'lrc', 'lic'],
  },
  vfa: {
    objectives: [
      'Test whether contracts have direct participation features',
      'Explain how the insurer’s share of changes in underlying items adjusts the CSM',
      'Contrast the VFA with the General Measurement Model',
    ],
    prerequisites: ['csm'],
  },
  'reinsurance-held': {
    objectives: [
      'Explain why reinsurance held is measured separately from the contracts it covers',
      'Describe how the net cost or gain of buying cover is treated',
      'Explain how the loss-recovery component matches recoveries to losses on onerous contracts',
    ],
    prerequisites: ['csm', 'onerous-contracts'],
  },
  'insurance-finance': {
    objectives: [
      'Explain what insurance finance income or expenses represent',
      'Separate the insurance service result from insurance finance income or expenses',
      'Describe the option to present part of insurance finance income or expenses in OCI',
    ],
    prerequisites: ['discounting'],
  },
  'insurance-revenue': {
    objectives: [
      'Build insurance revenue for a period from its GMM components',
      'Explain why revenue is not the premiums received',
      'Identify the investment components that are excluded from insurance revenue',
    ],
    prerequisites: ['lrc', 'csm'],
  },
  disclosures: {
    objectives: [
      'Name the main IFRS 17 reconciliations and what each explains',
      'Read an analysis of insurance revenue and of the expected CSM release',
      'Explain why good data design makes disclosures a by-product of the calculation',
    ],
    prerequisites: ['lrc', 'lic', 'csm'],
  },
  transition: {
    objectives: [
      'Name the three transition approaches and when each can be used',
      'Explain why a CSM had to be worked out for business already in force',
      'Explain why revenue and the CSM are disclosed by transition approach',
    ],
    prerequisites: ['csm'],
  },
  'operating-ifrs17': {
    objectives: [
      'Describe the hand-offs between actuarial, finance and IT in an IFRS 17 close',
      'Explain why data at group level drives the quality of results',
      'Identify the controls and evidence an auditor will ask for',
    ],
    prerequisites: ['level-of-aggregation', 'fulfilment-cash-flows'],
  },
  'tagetik-platform': {
    objectives: [
      'Explain how a multidimensional platform stores every number against dimensions',
      'Describe the roles of scenarios, processing, workflow and reporting',
      'Explain why platform foundations come before IFRS 17 configuration',
    ],
    prerequisites: ['double-entry'],
  },
  'tagetik-overview': {
    objectives: [
      'Walk the IFRS 17 chain from source data to disclosures',
      'Map each IFRS 17 concept to its place in an implementation',
      'Identify where data, calculation, accounting and reporting meet',
    ],
    prerequisites: ['tagetik-platform', 'ifrs17-why'],
  },
  'tagetik-data-model': {
    objectives: [
      'Design a group-of-contracts key that is consistent across systems',
      'Choose the grain for actuarial, finance and actual cash data',
      'Explain why most downstream problems trace back to the data model',
    ],
    prerequisites: ['level-of-aggregation', 'tagetik-platform'],
  },
  'tagetik-csm-build': {
    objectives: [
      'Order the steps of a CSM and loss component calculation per group and period',
      'Explain why each movement is stored separately',
      'Handle a group that becomes onerous in the same calculation structure',
    ],
    prerequisites: ['csm', 'loss-component', 'tagetik-data-model'],
  },
  'tagetik-journals': {
    objectives: [
      'Map IFRS 17 movement types to debit and credit accounts',
      'Explain how journals are aggregated to the general ledger grain',
      'Trace a ledger line back to the calculation that produced it',
    ],
    prerequisites: ['double-entry', 'insurance-revenue', 'tagetik-csm-build'],
  },
  'tagetik-disclosures': {
    objectives: [
      'Produce IFRS 17 reconciliations from stored movements',
      'Explain why disclosures should need no separate calculation',
      'Check that a reconciliation ties opening to closing balances',
    ],
    prerequisites: ['disclosures', 'tagetik-journals'],
  },
  'tagetik-testing': {
    objectives: [
      'Plan unit, end-to-end and parallel-run testing for an IFRS 17 build',
      'Describe the evidence each testing layer gives an auditor',
      'Connect testing to the judgements an entity must disclose',
    ],
    prerequisites: ['tagetik-csm-build', 'tagetik-disclosures'],
  },
}
