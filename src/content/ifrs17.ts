import type { Concept } from './types'

export const IFRS17: Concept[] = [
  {
    id: 'ifrs17-why',
    title: 'Why IFRS 17 exists',
    track: 'B',
    module: 'B1',
    kind: 'scope',
    summary:
      'IFRS 17 replaced IFRS 4, an interim standard that let insurers keep their local accounting. It requires every insurer to measure contracts on current estimates and to recognise profit as service is provided, effective for periods beginning on or after 1 January 2023.',
    explain: [
      'Before IFRS 17, two insurers selling the same policy could report it in very different ways, because IFRS 4 allowed each country’s old practices to continue. Investors could not compare them.',
      'IFRS 17 sets one model. An insurer estimates the cash it expects to pay and receive, adjusts for the time value of money and for uncertainty, and holds back any expected profit to release gradually as it provides cover. That held-back profit is the [[csm|contractual service margin]].',
      'Losses are different: if a group of contracts is expected to lose money, the loss is recognised immediately. See [[onerous-contracts|onerous contracts]].',
    ],
    apply: [
      'Key changes from IFRS 4 practice:',
      '- Current, explicit estimates of cash flows, discount rates and a [[risk-adjustment|risk adjustment]], updated each reporting date.',
      '- No day-one profit; unearned profit is carried in the CSM.',
      '- [[insurance-revenue|Insurance revenue]] reflects services provided, not premiums written, and excludes investment components.',
      '- Separation of the insurance service result from insurance finance income or expenses.',
      '- Extensive [[disclosures|disclosures]], including reconciliations of every liability component.',
      'The standard was issued in May 2017 and amended in June 2020, when the effective date moved to 1 January 2023.',
      'In India, IFRS 17 applies through Ind AS 117 Insurance Contracts, notified by the Ministry of Corporate Affairs on 12 August 2024 (G.S.R. 492(E)). It replaces Ind AS 104, India’s equivalent of IFRS 4. When an insurer moves to Ind AS is set by the insurance regulator, IRDAI: its Ind AS framework applies from 1 April 2026 (FY 2026-27), with up to one year of forbearance for insurers that were not ready and up to two years of parallel reporting on the old and new bases.',
      '> Dates in India have moved more than once, so check IRDAI’s latest circulars before relying on one. In September 2026 IRDAI reported that 11 insurers had adopted Ind AS from FY 2026-27 and that insurers granted forbearance will adopt from FY 2027-28.',
    ],
    implement: [
      'IFRS 17 is as much a data and process change as an accounting one. It needs cash flow projections from actuarial models at group-of-contracts level, a calculation engine for the CSM and loss components, an accounting engine for journals, and a reporting layer for disclosures. The [[tagetik-overview|Tagetik track]] follows that chain end to end.',
    ],
    refs: ['IFRS 17.1', 'IFRS 17.C1', 'IFRS 17 Introduction (May 2017)', 'Ind AS 117'],
    links: [
      { type: 'builds-on', to: 'what-is-ifrs' },
      { type: 'measured-by', to: 'gmm' },
      { type: 'implemented-by', to: 'tagetik-overview' },
    ],
  },
  {
    id: 'insurance-contract',
    title: 'What counts as an insurance contract',
    track: 'B',
    module: 'B2',
    kind: 'scope',
    summary:
      'An insurance contract is one where the insurer accepts significant insurance risk by agreeing to compensate the policyholder if an uncertain future event harms them. Whether risk is significant is judged contract by contract, not by legal form.',
    explain: [
      'Insurance risk is risk transferred from the policyholder to the insurer that is not purely financial. A house fire, a death, or a car accident are insured events; a change in an interest rate on its own is not.',
      'The risk must be significant: there must be at least one scenario with commercial substance, however unlikely, in which the insurer could pay significant additional amounts and suffer a loss on a present value basis (IFRS 17.B18–B20).',
      'Some products look like insurance but are mainly savings (investment contracts without discretionary participation features). Those fall under IFRS 9 instead.',
    ],
    apply: [
      'Scope assessment considers:',
      '- Significant insurance risk, assessed on a present value basis in scenarios with commercial substance (B17–B23).',
      '- Exclusions such as product warranties issued by a manufacturer and certain financial guarantee contracts (IFRS 17.7).',
      '- Separation of distinct components: embedded derivatives, distinct investment components and distinct goods or services are accounted for under other standards (IFRS 17.10–13).',
      '- [[reinsurance-held|Reinsurance contracts held]] are in scope but measured separately from the underlying contracts.',
      '- Investment contracts with discretionary participation features are in scope if the entity also issues insurance contracts.',
    ],
    implement: [
      'In a system, scope is a set of attributes on each product or policy: an IFRS 17 in-scope flag, the measurement model ([[gmm|GMM]], [[paa|PAA]] or [[vfa|VFA]]) and any separated components. These attributes drive which calculation path a contract follows, so they belong in governed master data, not in calculation logic.',
    ],
    refs: ['IFRS 17 Appendix A', 'IFRS 17.3–13', 'IFRS 17.B17–B23'],
    links: [
      { type: 'builds-on', to: 'ifrs17-why' },
      { type: 'measured-by', to: 'level-of-aggregation' },
      { type: 'contrasts-with', to: 'key-standards' },
    ],
    lenses: {
      auditor: 'Test the product-level scope conclusions, especially for savings products where insurance risk may be insignificant.',
    },
  },
  {
    id: 'level-of-aggregation',
    title: 'Level of aggregation: portfolios, groups and cohorts',
    track: 'B',
    module: 'B3',
    kind: 'scope',
    summary:
      'IFRS 17 is measured for groups of contracts, not single policies or whole books. Groups split portfolios by expected profitability and by year of issue, so profitable and loss-making business cannot be offset.',
    explain: [
      'A portfolio is contracts with similar risks managed together, for example all motor policies.',
      'Each portfolio is split, at a minimum, into three profitability groups at initial recognition (some may be empty): contracts that are onerous, contracts with no significant possibility of becoming onerous subsequently, and the rest.',
      'Each group may only contain contracts issued no more than one year apart. This is the annual cohort. Annual cohorts stop profitable older business from masking a fall in the profitability of newer business over time.',
      '> The group of contracts is the unit of account. The [[csm|CSM]], [[loss-component|loss component]] and every disclosure are built from groups.',
    ],
    apply: [
      'Groups are fixed at initial recognition and not reassessed. An entity may form more granular groups than required.',
      'The EU endorsed IFRS 17 with an optional exemption from the annual cohort requirement for certain intergenerationally-mutualised and cash-flow-matched contracts. Entities applying the exemption disclose it.',
      '[[reinsurance-held|Reinsurance contracts held]] are grouped separately, with the onerous split replaced by a split based on net gain at initial recognition (IFRS 17.61).',
    ],
    implement: [
      'The group key (portfolio × profitability bucket × cohort year, often with currency and legal entity) is the backbone of the data model. Actuarial cash flows, actual cash, CSM balances and journals must all carry the same key. Getting it wrong is the most expensive implementation mistake. See [[tagetik-data-model|data model design]].',
    ],
    refs: ['IFRS 17.14–24', 'IFRS 17.61'],
    links: [
      { type: 'builds-on', to: 'insurance-contract' },
      { type: 'builds-on', to: 'conceptual-framework' },
      { type: 'measured-by', to: 'gmm' },
      { type: 'implemented-by', to: 'tagetik-data-model' },
      { type: 'requires-data', to: 'tagetik-data-model' },
    ],
    lenses: {
      actuary: 'Cash flow projections need to be produced at, or allocated down to, group level.',
      developer: 'Make the group key a governed dimension combination, validated on load.',
    },
  },
  {
    id: 'gmm',
    title: 'The General Measurement Model (building blocks)',
    track: 'B',
    module: 'B5',
    kind: 'measurement',
    summary:
      'Under the General Measurement Model a group of contracts is measured as fulfilment cash flows plus a contractual service margin. Fulfilment cash flows are the discounted expected cash flows plus a risk adjustment.',
    explain: [
      'Picture four building blocks stacked together:',
      '- Block 1: the expected future cash flows, premiums in and claims and expenses out.',
      '- Block 2: an adjustment for the time value of money ([[discounting|discounting]]).',
      '- Block 3: a [[risk-adjustment|risk adjustment]] for uncertainty about amount and timing.',
      '- Block 4: the [[csm|contractual service margin]], the unearned profit.',
      'Blocks 1 to 3 together are the [[fulfilment-cash-flows|fulfilment cash flows]]. If they show a net inflow at the start, the CSM is set equal and opposite, so no profit appears on day one.',
    ],
    apply: [
      '$ Insurance contract liability = Fulfilment cash flows + CSM',
      '$ Fulfilment cash flows = PV(future outflows) − PV(future inflows) + Risk adjustment',
      'The GMM is the default model. The [[paa|PAA]] is an optional simplification for short-duration contracts, and the [[vfa|VFA]] is a mandatory modification for contracts with direct participation features.',
      'After initial recognition the liability is split into the [[lrc|LRC]] (future service) and the [[lic|LIC]] (claims already incurred).',
    ],
    implement: [
      'A GMM engine needs, per group and reporting date: cash flow vectors by type and period, discount curves (current and locked-in), the risk adjustment, coverage units, and the prior-period CSM and loss component balances. The [[tagetik-csm-build|CSM calculation build]] walks through the steps.',
      '> Try it: the [[measurement-sandbox|measurement sandbox]] runs the full GMM for one group.',
    ],
    refs: ['IFRS 17.29–32', 'IFRS 17.40'],
    links: [
      { type: 'builds-on', to: 'level-of-aggregation' },
      { type: 'measured-by', to: 'fulfilment-cash-flows' },
      { type: 'measured-by', to: 'csm' },
      { type: 'contrasts-with', to: 'paa' },
      { type: 'contrasts-with', to: 'vfa' },
      { type: 'implemented-by', to: 'tagetik-csm-build' },
    ],
    sandbox: 'overview',
  },
  {
    id: 'fulfilment-cash-flows',
    title: 'Fulfilment cash flows',
    track: 'B',
    module: 'B5',
    kind: 'measurement',
    summary:
      'Fulfilment cash flows are the insurer’s current, unbiased estimate of what it will cost to fulfil the contracts, in today’s money and including a margin for uncertainty. They are remeasured at every reporting date.',
    explain: [
      'Only cash flows inside the [[contract-boundary|contract boundary]] count: premiums the insurer can compel, claims, claims handling costs, directly attributable expenses and [[acquisition-cash-flows|acquisition cash flows]].',
      'Estimates are probability-weighted: an average across scenarios, not the single most likely outcome.',
    ],
    apply: [
      'Cash flow estimates must be explicit, current, unbiased and consistent with observable market prices for financial variables (IFRS 17.33). Discount rates must also be consistent with observable current market prices (IFRS 17.36). Non-financial assumptions (mortality, lapse, claims frequency) reflect the entity’s own experience.',
      'Changes in fulfilment cash flows are classified as relating to future service (adjust the CSM), current or past service (profit or loss in the insurance service result), or the effect of time value and financial risk (insurance finance income or expenses).',
    ],
    implement: [
      'Actuarial models typically produce the cash flow vectors and the subledger consumes them. Interface design should fix the grain (group, period, cash flow type), the sign convention, and versioning of assumption sets so that changes in estimates can be isolated in an analysis of change.',
    ],
    refs: ['IFRS 17.32–35', 'IFRS 17.B37–B71'],
    links: [
      { type: 'builds-on', to: 'gmm' },
      { type: 'measured-by', to: 'discounting' },
      { type: 'measured-by', to: 'risk-adjustment' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'requires-data', to: 'tagetik-data-model' },
    ],
    sandbox: 'overview',
    lenses: {
      actuary: 'Provide cash flows by group with a clear split between expected outflows for the current period and later periods.',
    },
  },
  {
    id: 'contract-boundary',
    title: 'Contract boundary',
    track: 'B',
    module: 'B4',
    kind: 'measurement',
    summary:
      'The contract boundary decides which future premiums and benefits belong to today’s contract. Cash flows after the point where the insurer can reprice to fully reflect the risk, of the policyholder or of the portfolio, are outside the boundary.',
    explain: [
      'If a one-year motor policy is likely to be renewed, next year’s premium is still not part of this year’s contract, because at renewal the insurer can set a new price. Renewals are new contracts.',
    ],
    apply: [
      'Cash flows are within the boundary if they arise from substantive rights and obligations in the period in which the entity can compel premiums or has a substantive obligation to provide services. That obligation ends when the entity has the practical ability to reassess the risks of the particular policyholder and set a price or level of benefits that fully reflects them, or when it can do so for the portfolio and the premiums for cover up to the reassessment date do not reflect risks of later periods (IFRS 17.34).',
    ],
    implement: [
      'Boundary decisions are made in actuarial projections, but the subledger should store the boundary assumption per product so analysts can explain why projected premiums stop where they do.',
    ],
    refs: ['IFRS 17.34–35', 'IFRS 17.B61–B66'],
    links: [
      { type: 'builds-on', to: 'level-of-aggregation' },
      { type: 'measured-by', to: 'fulfilment-cash-flows' },
    ],
  },
  {
    id: 'discounting',
    title: 'Discount rates and the time value of money',
    track: 'B',
    module: 'B5',
    kind: 'measurement',
    summary:
      'Future cash flows are discounted to today using rates that reflect the characteristics of the insurance liabilities. A locked-in rate from initial recognition is kept for accreting interest on the CSM.',
    explain: [
      '1,000 paid in five years costs less than 1,000 paid today, because money set aside can earn a return in the meantime. Discounting turns future amounts into present value.',
      '$ PV = Cash flow ÷ (1 + r)^t',
    ],
    apply: [
      'IFRS 17 does not prescribe a method. Two approaches are common:',
      '- Bottom-up: a liquid risk-free curve plus an illiquidity premium reflecting the liabilities.',
      '- Top-down: a reference portfolio yield less adjustments for factors not relevant to the liabilities, such as expected credit losses.',
      'Current rates measure the fulfilment cash flows each period. Locked-in rates at initial recognition accrete interest on the CSM and measure changes in estimates that adjust it under the GMM.',
      'An entity may disaggregate insurance finance income or expenses between profit or loss and OCI (the OCI option), using a systematic allocation. For groups where changes in financial assumptions do not substantially affect amounts paid to policyholders, that allocation uses the locked-in rates (IFRS 17.B131); other groups use the approaches in IFRS 17.B132–B134.',
    ],
    implement: [
      'Store curves as governed reference data with an effective date and a version. Each group needs a link to its locked-in curve (often a weighted average for groups issued over a year). The sandbox uses one flat rate as both current and locked-in to keep the example readable.',
    ],
    refs: ['IFRS 17.36', 'IFRS 17.B72–B85', 'IFRS 17.88', 'IFRS 17.B131–B134'],
    links: [
      { type: 'builds-on', to: 'fulfilment-cash-flows' },
      { type: 'posts-to', to: 'insurance-finance' },
    ],
    sandbox: 'overview',
  },
  {
    id: 'risk-adjustment',
    title: 'Risk adjustment for non-financial risk',
    track: 'B',
    module: 'B5',
    kind: 'measurement',
    summary:
      'The risk adjustment is the compensation the insurer requires for bearing uncertainty in the amount and timing of cash flows from non-financial risks. It is released to profit as that risk expires.',
    explain: [
      'If two outcomes average to the same cost but one is far more uncertain, an insurer would want to be paid more to take it on. The risk adjustment puts a number on that.',
    ],
    apply: [
      'IFRS 17 does not prescribe a technique. Common methods are confidence level (value at risk), cost of capital and conditional tail expectation. If another technique is used, the entity discloses the equivalent confidence level (IFRS 17.119).',
      'The change in the risk adjustment may be split between the insurance service result and insurance finance income or expenses, or presented entirely in the insurance service result (IFRS 17.81).',
      'Release of the risk adjustment for the risk expired in the period is a component of [[insurance-revenue|insurance revenue]].',
    ],
    implement: [
      'Risk adjustments are often calculated at a higher level (entity or portfolio) and allocated to groups. The allocation key needs to be documented and stable, because it moves profit between groups.',
      'In the sandbox, the risk adjustment is a fixed percentage of the present value of claims.',
    ],
    refs: ['IFRS 17.37', 'IFRS 17.81', 'IFRS 17.B86–B92', 'IFRS 17.119'],
    links: [
      { type: 'builds-on', to: 'fulfilment-cash-flows' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
    sandbox: 'rollforward',
  },
  {
    id: 'csm',
    title: 'Contractual service margin (CSM)',
    track: 'B',
    module: 'B5',
    kind: 'measurement',
    summary:
      'The CSM is the unearned profit in a group of insurance contracts. It is set up so that no gain appears on day one, then released to insurance revenue as the insurer provides cover.',
    explain: [
      'Suppose an insurer expects to collect 1,000 and pay out 800, after discounting and risk adjustment. It has an expected profit of 200. IFRS 17 does not let it book that 200 immediately. Instead it records a CSM of 200 as part of the liability, and releases it bit by bit over the coverage period.',
      'If the expected profit is negative, there is no CSM; the loss goes to profit or loss straight away (see [[onerous-contracts|onerous contracts]]).',
      '> The CSM is the main measure of future profit in an insurer’s balance sheet, which is why analysts watch it closely.',
    ],
    apply: [
      'At initial recognition (IFRS 17.38):',
      '$ CSM₀ = max(0, −(Fulfilment cash flows + Pre-recognition assets or liabilities derecognised + Cash flows arising at that date))',
      'For a group without direct participation features, the closing CSM each period is (IFRS 17.44):',
      '- opening CSM',
      '- plus new contracts added to the group',
      '- plus interest accreted at the locked-in rate',
      '- plus or minus changes in fulfilment cash flows relating to future service, unless they create or reverse a [[loss-component|loss component]]',
      '- plus or minus currency exchange differences',
      '- minus the amount released for services provided, based on [[coverage-units|coverage units]].',
      'The CSM can never be negative. When an adverse change exceeds it, the excess is a loss.',
    ],
    implement: [
      'The CSM roll-forward is the heart of any IFRS 17 engine and must follow the order of steps above, because the release is calculated on the balance after all other adjustments. Each step is stored as a separate movement so it can feed the [[disclosures|CSM reconciliation]] and the [[tagetik-journals|journals]] directly.',
      'See the [[tagetik-csm-build|CSM calculation build]] for a step-by-step design.',
    ],
    refs: ['IFRS 17.38', 'IFRS 17.43–46', 'IFRS 17.B96', 'IFRS 17.B119'],
    links: [
      { type: 'builds-on', to: 'gmm' },
      { type: 'measured-by', to: 'coverage-units' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'implemented-by', to: 'tagetik-csm-build' },
      { type: 'contrasts-with', to: 'loss-component' },
    ],
    sandbox: 'rollforward',
    lenses: {
      auditor: 'Recompute the roll-forward for a sample of groups; check the order of steps and the coverage unit basis.',
      actuary: 'Changes in estimates relating to future service must be measured at locked-in rates for the CSM adjustment.',
      developer: 'Persist each movement separately; never net them before the disclosure layer.',
    },
  },
  {
    id: 'coverage-units',
    title: 'Coverage units and CSM release',
    track: 'B',
    module: 'B6',
    kind: 'measurement',
    summary:
      'Coverage units measure how much insurance service a group provides in each period. The CSM is released in proportion to the units provided in the period against those provided now and expected in the future.',
    explain: [
      'If a group provides the same cover each year for five years, roughly a fifth of the original CSM is released each year: a fifth of the balance in year one, a quarter of what remains in year two, and so on. If cover shrinks over time, for example a reducing-balance loan protection, more is released early.',
      '$ Release = CSM before release × (units this period ÷ units this period and all future periods)',
    ],
    apply: [
      'Coverage units reflect the quantity of benefits and the expected coverage period of the contracts in the group (B119). Judgement is needed for contracts with several services, such as insurance and investment-return services. The Transition Resource Group discussed this in 2018, and the IFRS Interpretations Committee issued an agenda decision on coverage units for annuities in 2022.',
      'IFRS 17 neither requires nor prohibits discounting coverage units (TRG, February 2018). The approach is a judgement that should be applied consistently and explained in the disclosures.',
    ],
    implement: [
      'Coverage units are an actuarial input per group and period. Store the full projected vector each period, since the release ratio uses future units. Changes in the vector are a frequent cause of unexplained CSM movements.',
    ],
    refs: ['IFRS 17.44(e)', 'IFRS 17.B119', 'IFRS 17.117(c)(v)'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'requires-data', to: 'tagetik-data-model' },
    ],
    sandbox: 'rollforward',
  },
  {
    id: 'lrc',
    title: 'Liability for remaining coverage (LRC)',
    track: 'B',
    module: 'B6',
    kind: 'measurement',
    summary:
      'The LRC is the obligation to provide insurance cover in the future. It contains the fulfilment cash flows for future service and the CSM, and it shrinks as revenue is recognised.',
    explain: [
      'When a premium is received, it increases the LRC. As cover is provided, the LRC is reduced and [[insurance-revenue|insurance revenue]] is recognised. Claims that happen move into the [[lic|LIC]].',
    ],
    apply: [
      'The LRC is disclosed in two parts: the LRC excluding the [[loss-component|loss component]], and the loss component itself (IFRS 17.100(a)–(b)).',
      'Under the [[paa|PAA]] the LRC is simplified to premiums received, less acquisition cash flows paid plus their amortisation, less amounts recognised as revenue (IFRS 17.55(a)).',
    ],
    implement: [
      'Model the LRC as a set of movement types (premiums, acquisition cash flows, revenue, finance, losses) so the balance and the disclosure come from the same records.',
    ],
    refs: ['IFRS 17.40(a)', 'IFRS 17.100', 'IFRS 17.103'],
    links: [
      { type: 'builds-on', to: 'gmm' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'contrasts-with', to: 'lic' },
    ],
    sandbox: 'disclosures',
  },
  {
    id: 'lic',
    title: 'Liability for incurred claims (LIC)',
    track: 'B',
    module: 'B6',
    kind: 'measurement',
    summary:
      'The LIC is the obligation to pay claims for events that have already happened, including claims not yet reported. It is measured at fulfilment cash flows with no CSM, because the service has already been provided.',
    explain: [
      'A car accident on 30 December creates a claim that may be paid months later. Between the accident and payment, the insurer owes the money and records it in the LIC.',
    ],
    apply: [
      'The LIC includes the discounted estimate of claims and claims handling costs plus a risk adjustment. Changes in the LIC estimate relate to past service and do not adjust the CSM. They go to the insurance service result, except effects of the time value of money and financial risk, which are insurance finance income or expenses.',
      'Under the PAA, the LIC need not be discounted if claims are expected to be paid within one year (IFRS 17.59(b)).',
    ],
    implement: [
      'LIC cash flows usually come from reserving models (chain ladder, Bornhuetter–Ferguson). Interfaces must carry the underwriting (issue) year to map claims to the right group cohort, and the accident year for the claims development disclosure (IFRS 17.130).',
    ],
    refs: ['IFRS 17.40(b)', 'IFRS 17.B97', 'IFRS 17.59(b)'],
    links: [
      { type: 'builds-on', to: 'gmm' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'contrasts-with', to: 'lrc' },
    ],
    sandbox: 'disclosures',
  },
  {
    id: 'onerous-contracts',
    title: 'Onerous contracts',
    track: 'B',
    module: 'B7',
    kind: 'measurement',
    summary:
      'A group is onerous when expected outflows, including the risk adjustment, exceed expected inflows. The loss is recognised in profit or loss immediately, and a loss component is set up to track it.',
    explain: [
      'Profits are spread over time; losses are not. If an insurer expects a group to lose 50, it reports the 50 loss now.',
      'A group can also become onerous later, if expectations worsen by more than the remaining [[csm|CSM]].',
    ],
    apply: [
      'At initial recognition the net outflow is recognised as a loss in insurance service expenses (IFRS 17.47). Subsequently, unfavourable changes relating to future service in excess of the CSM are losses (IFRS 17.48). Favourable changes first reverse the loss component before rebuilding a CSM (IFRS 17.50(b)).',
    ],
    implement: [
      'The onerous test is a comparison per group per reporting date after all estimate updates, so it must run after the cash flow and risk adjustment loads are complete. Store the test result and the amount; both are audited.',
    ],
    refs: ['IFRS 17.47–52'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'measured-by', to: 'loss-component' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
    sandbox: 'overview',
  },
  {
    id: 'loss-component',
    title: 'The loss component',
    track: 'B',
    module: 'B7',
    kind: 'measurement',
    summary:
      'The loss component is a memo account inside the LRC that tracks losses recognised on an onerous group. It makes sure those losses are not counted again as revenue when the related claims and expenses are incurred.',
    explain: [
      'If a loss of 50 was booked on day one, the claims that cause it will still flow through later. Without a loss component, revenue would include 50 that was already expensed. The loss component removes it.',
    ],
    apply: [
      'Subsequent changes in fulfilment cash flows of the LRC (release of expected claims and expenses, risk adjustment release, finance effects) are allocated on a systematic basis between the loss component and the LRC excluding it (IFRS 17.50(a), 51). Amounts allocated to the loss component are excluded from insurance revenue. The claims, expenses and risk adjustment parts reduce insurance service expenses, and the finance part is presented within insurance finance income or expenses.',
      'By the end of the coverage period the loss component must be zero.',
    ],
    implement: [
      'Use a documented allocation ratio, typically the loss component over the present value of future outflows plus risk adjustment at the start of the period. The sandbox uses this ratio and clears any residual in the final year.',
    ],
    refs: ['IFRS 17.49–52', 'IFRS 17.100(b)'],
    links: [
      { type: 'builds-on', to: 'onerous-contracts' },
      { type: 'contrasts-with', to: 'csm' },
      { type: 'contrasts-with', to: 'reinsurance-held' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'implemented-by', to: 'tagetik-csm-build' },
    ],
    sandbox: 'disclosures',
  },
  {
    id: 'acquisition-cash-flows',
    title: 'Insurance acquisition cash flows',
    track: 'B',
    module: 'B6',
    kind: 'measurement',
    summary:
      'Acquisition cash flows, such as commissions to sell a policy, are included in the fulfilment cash flows and so reduce the CSM. In profit or loss they are spread over the coverage period.',
    explain: [
      'An insurer pays a broker 250 to sell a five-year policy. That cost is not expensed on day one. It lowers the expected profit (the CSM) and is recognised as an expense over the five years, matched by an equal amount within revenue.',
    ],
    apply: [
      'Insurance revenue includes an allocation of the portion of premiums that relates to recovering acquisition cash flows, and insurance service expenses include the same amount (IFRS 17.B125). An asset is recognised for acquisition cash flows paid before the related group is recognised (IFRS 17.28B).',
    ],
    implement: [
      'Acquisition costs often come from the general ledger rather than actuarial models, so the interface must allocate them to groups. The amortisation must be allocated systematically on the basis of the passage of time (IFRS 17.B125), which is not necessarily the same as the coverage unit pattern used for the CSM release.',
    ],
    refs: ['IFRS 17.28A–28F', 'IFRS 17.B125'],
    links: [
      { type: 'builds-on', to: 'fulfilment-cash-flows' },
      { type: 'posts-to', to: 'insurance-revenue' },
    ],
    sandbox: 'journals',
  },
  {
    id: 'insurance-revenue',
    title: 'Insurance revenue',
    track: 'B',
    module: 'B12',
    kind: 'presentation',
    summary:
      'Insurance revenue is the consideration the insurer is entitled to for services provided in the period. Under the GMM it is built from the expected claims and expenses for the period, the risk adjustment release, the CSM release and the recovery of acquisition cash flows.',
    explain: [
      'Revenue is not the premium written or received. It is the part of the premium earned by providing cover this period. Investment components, amounts repaid to policyholders regardless of an insured event, are excluded.',
    ],
    apply: [
      'Under the GMM, insurance revenue comprises (IFRS 17.B124–B125):',
      '- insurance service expenses expected for the period (claims and expenses), excluding amounts allocated to the loss component and investment components',
      '- the change in the risk adjustment for risk expired',
      '- the CSM recognised for services provided',
      '- other amounts, such as experience adjustments for premium receipts relating to current or past service',
      '- the allocation of premiums relating to the recovery of insurance acquisition cash flows.',
      'Entities disclose this analysis (IFRS 17.106).',
    ],
    implement: [
      'Because revenue is derived, not booked from cash, the engine must produce each component separately per group. The disclosure, the journal and the income statement line should all read from the same component records.',
    ],
    refs: ['IFRS 17.83', 'IFRS 17.85', 'IFRS 17.106', 'IFRS 17.B120–B125'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'builds-on', to: 'lrc' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'implemented-by', to: 'tagetik-journals' },
    ],
    sandbox: 'disclosures',
    lenses: {
      auditor: 'Reconcile revenue components to the LRC movement; investment components must be excluded.',
    },
  },
  {
    id: 'insurance-finance',
    title: 'Insurance finance income or expenses',
    track: 'B',
    module: 'B11',
    kind: 'presentation',
    summary:
      'Insurance finance income or expenses capture the effect of the time value of money and financial risk on insurance liabilities. They are shown separately from the insurance service result.',
    explain: [
      'Because liabilities are discounted, they grow over time as payment dates approach, like interest on a loan. That growth is an insurance finance expense. Changes in discount rates also land here.',
    ],
    apply: [
      'Includes interest accretion on fulfilment cash flows, accretion on the CSM at locked-in rates, and the effect of changes in discount rates and other financial assumptions (IFRS 17.87). An entity may disaggregate between profit or loss and OCI to reduce accounting mismatches with assets at fair value through OCI under IFRS 9 (IFRS 17.88–89).',
    ],
    implement: [
      'Isolating finance effects requires running cash flows at both current and locked-in rates. Store both results; the difference drives the OCI amount when the option is used.',
    ],
    refs: ['IFRS 17.87–92', 'IFRS 17.B128–B136'],
    links: [
      { type: 'builds-on', to: 'discounting' },
      { type: 'builds-on', to: 'key-standards' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
    sandbox: 'journals',
  },
  {
    id: 'paa',
    title: 'Premium Allocation Approach (PAA)',
    track: 'B',
    module: 'B8',
    kind: 'measurement',
    summary:
      'The PAA is an optional simplification for the LRC, close to unearned premium accounting. It is available when the coverage period is one year or less, or when it gives a result not materially different from the GMM.',
    explain: [
      'Most motor and home policies run for a year. For them, the PAA lets insurers recognise revenue over the cover period, usually evenly with the passage of time (or following the expected pattern of claims if risk is released unevenly), as unearned premium accounting did, without computing a CSM.',
    ],
    apply: [
      'Eligibility: coverage period of each contract in the group is one year or less, or the entity reasonably expects the PAA LRC not to differ materially from the GMM (IFRS 17.53).',
      'Acquisition cash flows can be expensed when incurred if coverage is one year or less (IFRS 17.59(a)). The LIC is still measured at fulfilment cash flows. If facts indicate a group is onerous, an onerous test under the GMM is required (IFRS 17.57).',
    ],
    implement: [
      'PAA is often implemented as a lighter path in the same engine, reusing LIC and disclosure logic. The [[measurement-sandbox|sandbox]] models the GMM, and the PAA lab measures one group both ways.',
    ],
    refs: ['IFRS 17.53–59', 'IFRS 17.B126'],
    links: [
      { type: 'contrasts-with', to: 'gmm' },
      { type: 'builds-on', to: 'lic' },
    ],
  },
  {
    id: 'vfa',
    title: 'Variable Fee Approach (VFA)',
    track: 'B',
    module: 'B9',
    kind: 'measurement',
    summary:
      'The VFA applies to contracts with direct participation features, where policyholders share in a clearly identified pool of underlying items. The insurer’s share of changes in those items adjusts the CSM rather than profit or loss.',
    explain: [
      'With-profits and unit-linked policies pay policyholders a return based on a fund. The insurer earns a variable fee: its share of the fund less the cost of the guarantees it provides. The VFA measures that fee.',
    ],
    apply: [
      'Eligibility is assessed at inception: the contract specifies participation in a clearly identified pool of underlying items, the entity expects to pay a substantial share of the fair value returns, and a substantial proportion of changes in amounts paid vary with the underlying items (B101).',
      'The CSM is adjusted for the change in the entity’s share of the fair value of underlying items (IFRS 17.45). A risk mitigation option allows some effects of hedging to go to profit or loss (B115–B118).',
    ],
    implement: [
      'VFA needs fair values of underlying items per group alongside cash flows. It is planned for the next release of the portal.',
    ],
    refs: ['IFRS 17.45', 'IFRS 17.B101–B118'],
    links: [
      { type: 'contrasts-with', to: 'gmm' },
      { type: 'builds-on', to: 'csm' },
    ],
  },
  {
    id: 'reinsurance-held',
    title: 'Reinsurance contracts held',
    track: 'B',
    module: 'B10',
    kind: 'measurement',
    summary:
      'A reinsurance contract held is measured as its own asset or liability, separately from the insurance contracts it protects. Any net cost or net gain on buying the cover is deferred in a CSM, except that a net cost relating to events before the purchase is expensed at once (IFRS 17.65A), and a loss-recovery component lets the insurer recognise recoveries of losses on onerous underlying contracts at the same time as those losses.',
    explain: [
      'An insurer that buys reinsurance passes part of its risk to a reinsurer in return for a premium. It is now the policyholder. IFRS 17 measures that contract using the same building blocks as insurance issued, but from the buyer’s side: expected recoveries in, reinsurance premiums out.',
      'The reinsurance is not netted against the underlying business. The insurer keeps its full liability to its own policyholders and recognises the reinsurance separately, usually as an asset.',
      'Buying reinsurance normally costs more than the expected recoveries, because the reinsurer wants a margin. That net cost is not an immediate loss. It is deferred in the reinsurance [[csm|CSM]] and recognised as the cover is received. A net gain is deferred the same way.',
      '> The awkward case: an underlying group is onerous, so its loss hits profit or loss on day one, but the reinsurance that protects it has only a deferred CSM. The loss-recovery component fixes that mismatch.',
    ],
    apply: [
      'Measurement modifications for reinsurance held (IFRS 17.60–70A):',
      '- Assumptions are consistent with those used for the underlying contracts, and the estimates include the effect of any risk of non-performance by the reinsurer, including collateral and losses from disputes (IFRS 17.63). This differs from insurance issued, where the entity’s own non-performance risk is excluded (IFRS 17.31).',
      '- The risk adjustment is the amount of risk transferred by the insurer to the reinsurer (IFRS 17.64).',
      '- At initial recognition the net cost or net gain is recognised as a CSM, which can be positive or negative (IFRS 17.65). A net cost that relates to insured events that occurred before the purchase is expensed immediately (IFRS 17.65A).',
      '- Changes in fulfilment cash flows from changes in the reinsurer’s non-performance risk do not relate to future service and go to profit or loss, not the CSM (IFRS 17.67).',
      'Loss-recovery component (IFRS 17.66A–66B, B119C–B119F). When the insurer recognises a loss on initial recognition of an onerous group of underlying contracts, or when onerous contracts are added to a group, it adjusts the reinsurance CSM and recognises income at the same time, provided the reinsurance contract was entered into before or at the same time as the onerous contracts were recognised:',
      '$ Loss recovery = Loss on underlying contracts × % of underlying claims expected to be recovered',
      'For example, a loss of 200 on an onerous underlying group covered by a 25% quota share gives income of 50. The insurer then tracks a loss-recovery component of the asset for remaining coverage, adjusted as the underlying loss component changes and never exceeding the portion of that loss component it expects to recover.',
      'Presentation: income or expenses from reinsurance held are presented separately from insurance contracts issued (IFRS 17.82). They may be shown as a single net amount, or as amounts recovered from the reinsurer and an allocation of the premiums paid. Ceding commissions not contingent on claims reduce the premiums paid, and the allocation of premiums paid is not presented as a reduction of insurance revenue (IFRS 17.86). On the balance sheet, portfolios of reinsurance held in an asset position are shown separately from those in a liability position (IFRS 17.78).',
      'The [[paa|PAA]] may be used if each contract in the group has a coverage period of one year or less, or if it is reasonably expected not to differ materially from the GMM (IFRS 17.69). The second test fails where significant variability in fulfilment cash flows is expected before claims are incurred (IFRS 17.70). This matters for risk-attaching treaties, whose coverage period can exceed a year because they cover claims on underlying policies written throughout the treaty year. Reinsurance held can never be measured under the [[vfa|VFA]] (IFRS 17.B109).',
    ],
    implement: [
      'Model reinsurance held as its own contract type in the data model, with its own groups, cash flows, CSM and movement types, and a mapping to the underlying groups it covers. The loss-recovery calculation needs that mapping and the recovery percentage per underlying group.',
      'Run order matters: the onerous test on the underlying groups must complete before the reinsurance calculation, because the loss-recovery component is driven by the underlying loss component. Persist the loss-recovery movements separately so they feed both the reconciliation and the journals.',
      'Treaty data often sits outside policy administration, in a reinsurance system or spreadsheets. Reconcile reinsurance cash flows to the reinsurer accounts, and keep the non-performance adjustment as a separately identifiable input so its changes can be routed to profit or loss.',
    ],
    refs: ['IFRS 17.60–70A', 'IFRS 17.66A–66B', 'IFRS 17.B119C–B119F', 'IFRS 17.78', 'IFRS 17.82', 'IFRS 17.86', 'IFRS 17.B109'],
    links: [
      { type: 'builds-on', to: 'gmm' },
      { type: 'builds-on', to: 'csm' },
      { type: 'builds-on', to: 'onerous-contracts' },
      { type: 'measured-by', to: 'fulfilment-cash-flows' },
      { type: 'contrasts-with', to: 'insurance-revenue' },
      { type: 'contrasts-with', to: 'paa' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'requires-data', to: 'tagetik-data-model' },
    ],
    lenses: {
      auditor: 'For loss-recovery income, test that the reinsurance was in place when the onerous contracts were recognised and that the recovery percentage reflects the treaty terms. Check that non-performance changes did not adjust the CSM.',
      actuary: 'Use assumptions consistent with the underlying business. The boundary of a reinsurance contract held can include cash flows from underlying contracts not yet issued, so projections may need expected future new business.',
      developer: 'Keep a governed link from each reinsurance group to its underlying groups; the loss-recovery component cannot be calculated without it.',
    },
  },
  {
    id: 'disclosures',
    title: 'IFRS 17 disclosures',
    track: 'B',
    module: 'B13',
    kind: 'disclosure',
    summary:
      'IFRS 17 requires reconciliations that explain every movement in insurance liabilities, an analysis of revenue, and information on judgements and risks. Good data design makes these a by-product of the calculation.',
    explain: [
      'Investors want to see how the liability moved from the start to the end of the year and why. The notes walk through it line by line.',
    ],
    apply: [
      'Core quantitative disclosures:',
      '- Reconciliation of the LRC excluding the loss component, the loss component and the LIC (IFRS 17.100, 103).',
      '- Reconciliation of the present value of future cash flows, risk adjustment and CSM (IFRS 17.101, 104).',
      '- Analysis of insurance revenue (IFRS 17.106).',
      '- Effect of contracts initially recognised in the period (IFRS 17.107).',
      '- When the remaining CSM is expected to be recognised in profit or loss (IFRS 17.109).',
      'Qualitative and risk disclosures cover significant judgements (117), sensitivities (128) and claims development (130).',
    ],
    implement: [
      'Disclosures should read movement records, never recompute balances. If the CSM roll-forward stores each step, the reconciliation is a query. See [[tagetik-disclosures|disclosure reporting]].',
      '> Generate them live from the [[measurement-sandbox|sandbox]] Disclosures tab.',
    ],
    refs: ['IFRS 17.93–132'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'builds-on', to: 'lrc' },
      { type: 'builds-on', to: 'lic' },
      { type: 'implemented-by', to: 'tagetik-disclosures' },
    ],
    sandbox: 'disclosures',
  },
  {
    id: 'transition',
    title: 'Transition approaches',
    track: 'B',
    module: 'B14',
    kind: 'measurement',
    summary:
      'On first applying IFRS 17, insurers had to work out the CSM for business already in force. The standard allows a full retrospective approach, or where impracticable a modified retrospective or fair value approach.',
    explain: [
      'To know today’s unearned profit on a policy sold in 2005, you would need to know what the insurer expected in 2005. Often that data does not exist, so the standard offers practical alternatives.',
    ],
    apply: [
      '- Full retrospective approach: apply IFRS 17 as if it had always applied (C3–C4). Where this is impracticable for a group, an alternative approach is chosen (C5).',
      '- Modified retrospective approach: specified modifications to get as close as possible using reasonable and supportable information (C6–C19A).',
      '- Fair value approach: CSM equals fair value of the group (IFRS 13) less its fulfilment cash flows at transition (C20–C24).',
      '- Comparative information and financial assets: at least one comparative period is restated (C25–C28). Entities first applying IFRS 17 and IFRS 9 together may use the classification overlay to present comparative financial assets as if IFRS 9 classification had applied, optionally without the IFRS 9 impairment requirements (C28A–C28E). Eligible financial assets may be redesignated at the date of initial application (C29–C33).',
      'The transition CSM by approach is disclosed and continues to matter as long as transition groups are in force.',
    ],
    implement: [
      'Transition balances are loaded as opening positions per group with an approach flag, so that later disclosures can show revenue and CSM by transition approach (IFRS 17.114).',
    ],
    refs: ['IFRS 17.C1–C33', 'IFRS 17.C28A–C28E', 'IFRS 17.114'],
    links: [
      { type: 'builds-on', to: 'csm' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
  },
  {
    id: 'operating-ifrs17',
    title: 'Operating IFRS 17: data, handshake and close',
    track: 'B',
    module: 'B15',
    kind: 'measurement',
    summary:
      'Running IFRS 17 every quarter is a joint production process between actuarial, finance and IT teams. Its quality depends on data at group level, agreed hand-offs, a close calendar that leaves room for review, and controls that leave evidence an auditor can follow.',
    explain: [
      'IFRS 17 numbers are estimates built from many inputs: policy data, actuarial cash flow projections, discount curves, the risk adjustment, coverage units and actual cash from the ledger. No single team owns all of them.',
      'The actuarial-finance handshake is the agreement about who delivers what, when, at which grain and with which sign convention. When it is weak, the close becomes a reconciliation exercise; when it is strong, the close is a sequence of checked hand-offs.',
      '> Most unexplained CSM movements in practice are not accounting errors. They are data or assumption changes that reached the engine without being flagged.',
    ],
    apply: [
      'Data needed per group and period:',
      '- Projected cash flows by type, from actuarial models, at current and locked-in rates.',
      '- Actual premiums, claims, expenses and acquisition cash flows, from policy administration, claims systems and the ledger, to measure [[experience-adjustment|experience adjustments]].',
      '- Discount curves, risk adjustment and coverage units, each versioned.',
      '- Group attributes: portfolio, profitability bucket, cohort, measurement model and transition approach.',
      'Granularity: the CSM and loss component must be tracked per [[level-of-aggregation|group]], but fulfilment cash flows may be estimated at a higher level and allocated to groups, provided the appropriate cash flows end up in each group (IFRS 17.24). The allocation method is a judgement to document and apply consistently.',
      'Interim reporting: an entity chooses as an accounting policy whether to change the treatment of accounting estimates made in previous interim financial statements, and applies that choice to all groups it issues and reinsurance groups it holds (IFRS 17.B137). The choice affects how quarterly closes build up to the annual result.',
      'Significant judgements, including methods, inputs and the processes for estimating them, are disclosed (IFRS 17.117). The operating model must be able to evidence what was disclosed.',
    ],
    implement: [
      'A typical quarterly close calendar runs: data cut-off and validation, actuarial runs and assumption sign-off, load into the subledger with completeness checks, calculation and onerous testing, review of the analysis of change, journals to the ledger, then disclosures and sign-off. Many insurers run actuarial projections on data taken before period end and roll them forward; the roll-forward method and any true-up should be documented.',
      'Controls auditors commonly expect:',
      '- Completeness and accuracy reconciliations: policy data to actuarial model inputs, actuarial outputs to engine inputs, engine results to the general ledger.',
      '- Assumption governance: approval of each assumption set, version control and a log of changes.',
      '- Analytical review of the CSM, risk adjustment and loss component movements, with thresholds and documented explanations.',
      '- Change control over models, calculation rules and mappings, with segregation between those who build and those who approve.',
      'Audit evidence: auditors apply ISA 540 (Revised) to accounting estimates, testing methods, significant assumptions and data. Keep run identifiers, input versions and approvals linked to each result so any number can be traced back to its inputs. See [[tagetik-testing|testing and go-live]].',
    ],
    refs: ['IFRS 17.24', 'IFRS 17.33', 'IFRS 17.117', 'IFRS 17.B137'],
    links: [
      { type: 'builds-on', to: 'level-of-aggregation' },
      { type: 'builds-on', to: 'fulfilment-cash-flows' },
      { type: 'disclosed-in', to: 'disclosures' },
      { type: 'requires-data', to: 'tagetik-data-model' },
      { type: 'implemented-by', to: 'tagetik-testing' },
    ],
    lenses: {
      auditor: 'Walk one group from source data to the disclosure, checking each hand-off has a control and evidence that it operated.',
      actuary: 'Agree a data dictionary with finance before the first dry run: grain, sign convention, cut-off date and assumption version for every file.',
      developer: 'Reject loads with unknown group keys or missing versions rather than defaulting them; late failures cost more close days than early ones.',
    },
  },
]
