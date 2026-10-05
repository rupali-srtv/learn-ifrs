import type { Journal, YearResult } from '../engine/gmm'
import { TBIC_GROUPS, type TbicGroupId } from '../engine/tbic'
import { TBIC_RESULTS, df, f4, n1, rs } from './tbic-figures'

/**
 * Worked examples: one per measurement concept, each following a TBIC group from inputs to journal entry.
 * Every figure is read from the engine and formatted here, so the text cannot disagree with the sandbox.
 */
export interface WorkedRow {
  label: string
  value: number
  /** Marks a subtotal or result row. */
  total?: boolean
}

export interface WorkedStep {
  title: string
  text: string
  rows?: WorkedRow[]
  formula?: string
}

export interface WorkedJournal {
  title: string
  lines: { account: string; debit: number; credit: number }[]
}

export interface WorkedExample {
  concept: string
  group: TbicGroupId
  title: string
  steps: WorkedStep[]
  journals: WorkedJournal[]
  takeaway: string
  refs: string[]
}

const { suraksha: S, arogya: A, griha: G } = TBIC_RESULTS
const sIn = TBIC_GROUPS['tbic-suraksha'].inputs
const aIn = TBIC_GROUPS['tbic-arogya'].inputs
const gIn = TBIC_GROUPS['tbic-griha'].inputs
const r = sIn.discountRate
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const dueFactors = [0, 1, 2, 3, 4].map((t) => df(r, t))
const endFactors = [1, 2, 3, 4, 5].map((t) => df(r, t))
const pvClaims = sIn.claims[0] * sum(endFactors)
const pvExpenses = sIn.expenses[0] * sum(dueFactors)
const s1 = S.years[0]
const g1 = G.years[0]
const g2 = G.years[1]
const a1 = A.years[0]

function journal(y: YearResult, id: string, title?: string): WorkedJournal {
  const j: Journal | undefined = y.journals.find((x) => x.id === id)
  if (!j) throw new Error(`No journal ${id} in year ${y.year}`)
  return { title: title ?? j.description, lines: j.lines.map((l) => ({ ...l })) }
}

export const WORKED_EXAMPLES: WorkedExample[] = [
  {
    concept: 'gmm',
    group: 'tbic-suraksha',
    title: 'TBIC Suraksha Term on day one: the four building blocks',
    steps: [
      {
        title: 'Estimate the cash flows',
        text: 'TBIC expects premiums of ₹1,000 lakh at the start of each of 5 years, claims of ₹700 lakh at each year end, maintenance expenses of ₹60 lakh at the start of each year, and it paid ₹250 lakh of commission on day one.',
      },
      {
        title: 'Discount them at 7%',
        text: 'Blocks 1 and 2 together: the present value of expected future cash flows.',
        rows: [
          { label: 'Present value of premiums (inflows)', value: S.initial.pvInflows },
          { label: 'Present value of claims, expenses and commission (outflows)', value: -S.initial.pvOutflows },
          { label: 'Net inflow', value: -S.initial.fulfilmentCashFlows, total: true },
        ],
      },
      {
        title: 'Add the risk adjustment',
        text: `Block 3: TBIC requires compensation for the uncertainty in its claims, 8% of their present value: ${rs(S.initial.riskAdjustment)}.`,
      },
      {
        title: 'Set the CSM so there is no day-one gain',
        text: 'Block 4: whatever net inflow remains after the risk adjustment is unearned profit, held back as the contractual service margin.',
        rows: [
          { label: 'Net inflow', value: -S.initial.fulfilmentCashFlows },
          { label: 'Less risk adjustment', value: -S.initial.riskAdjustment },
          { label: 'Contractual service margin', value: S.initial.csm, total: true },
        ],
      },
      {
        title: 'Check: the liability on day one is nil',
        text: `Fulfilment cash flows of ${rs(S.initial.fulfilmentCashFlows + S.initial.riskAdjustment)} (a net inflow, so negative) plus the CSM of ${rs(S.initial.csm)} gives a liability of nil before any cash moves. No profit and no loss is recognised at initial recognition.`,
      },
    ],
    journals: [journal(s1, 'premium', 'Year 1 premium received'), journal(s1, 'acq-paid', 'Commission paid on day one')],
    takeaway: `Over its 5 years this group makes a profit of ${rs(S.totals.profit)} before investment income, exactly its undiscounted net cash flow. The model decides when that profit appears, not how much it is.`,
    refs: ['IFRS 17.32', 'IFRS 17.38'],
  },
  {
    concept: 'fulfilment-cash-flows',
    group: 'tbic-suraksha',
    title: 'Building TBIC Suraksha Term’s fulfilment cash flows',
    steps: [
      {
        title: 'Collect every cash flow within the contract boundary',
        text: 'Premiums, death claims, policy maintenance costs and the commission paid to sell the policies all belong to these contracts. TBIC’s own income tax and general overheads that cannot be attributed to the portfolio do not.',
      },
      {
        title: 'Discount each stream from when it is paid',
        text: 'Premiums and expenses are paid at the start of each year, claims at the end, commission on day one.',
        rows: [
          { label: 'Claims: ₹700 lakh × ' + f4(sum(endFactors)), value: pvClaims },
          { label: 'Maintenance expenses: ₹60 lakh × ' + f4(sum(dueFactors)), value: pvExpenses },
          { label: 'Commission, paid on day one', value: sIn.acquisition },
          { label: 'Present value of outflows', value: S.initial.pvOutflows, total: true },
          { label: 'Present value of premiums: ₹1,000 lakh × ' + f4(sum(dueFactors)), value: -S.initial.pvInflows },
          { label: 'Risk adjustment, 8% of the claims', value: S.initial.riskAdjustment },
          { label: 'Fulfilment cash flows (negative = net inflow)', value: S.initial.fulfilmentCashFlows + S.initial.riskAdjustment, total: true },
        ],
      },
      {
        title: 'Remeasure at every reporting date',
        text: `A year later the same calculation is repeated for the cash flows still to come, using current estimates. At the end of year 1 the present value of future cash flows is ${rs(s1.close.fcf)} and the risk adjustment ${rs(s1.close.ra)}.`,
      },
    ],
    journals: [],
    takeaway: 'Fulfilment cash flows are a current estimate, not a locked-in one. Their changes are what flow through the CSM, revenue and finance expenses.',
    refs: ['IFRS 17.32–35', 'IFRS 17.B65–B66'],
  },
  {
    concept: 'discounting',
    group: 'tbic-suraksha',
    title: 'Discounting TBIC Suraksha Term, and the interest that unwinds',
    steps: [
      {
        title: 'Discount factors at 7%',
        text: 'A factor of 1 ÷ 1.07 per year. Premiums use the start-of-year factors, claims the end-of-year ones.',
        rows: [0, 1, 2, 3, 4].map((t) => ({ label: `Start of year ${t + 1} (also end of year ${t})`, value: dueFactors[t] * 1000 })),
        formula: 'Factor = 1 ÷ 1.07^t, shown here × 1,000 to read as ₹ per ₹1,000 lakh',
      },
      {
        title: 'Present values at initial recognition',
        text: 'The same 7% applies to every stream because TBIC uses one flat rate in this example.',
        rows: [
          { label: 'Premiums, ₹1,000 lakh × ' + f4(sum(dueFactors)), value: S.initial.pvInflows },
          { label: 'Claims, ₹700 lakh × ' + f4(sum(endFactors)), value: pvClaims },
        ],
      },
      {
        title: 'Interest unwinds during year 1',
        text: `As time passes, discounted amounts move closer to payment and grow. In year 1 the CSM accretes interest at the locked-in 7% (${rs(s1.csmAccretion)}), while interest on the fulfilment cash flows, which are a net inflow, is ${rs(s1.interestOnFcf)}. Both are insurance finance expenses, kept out of the insurance service result.`,
        rows: [
          { label: 'Interest accreted on the CSM', value: s1.csmAccretion },
          { label: 'Interest on the fulfilment cash flows', value: s1.interestOnFcf },
          { label: 'Insurance finance expense, year 1', value: s1.insuranceFinanceExpense, total: true },
        ],
      },
    ],
    journals: [journal(s1, 'ifie-lrc', 'Year 1 insurance finance expense')],
    takeaway: 'Discounting decides how large each liability is today; unwinding moves the effect of time into insurance finance income or expenses, separate from the insurance service result.',
    refs: ['IFRS 17.36', 'IFRS 17.B72', 'IFRS 17.87'],
  },
  {
    concept: 'risk-adjustment',
    group: 'tbic-suraksha',
    title: 'TBIC Suraksha Term’s risk adjustment, set up and released',
    steps: [
      {
        title: 'Day one',
        text: `TBIC’s technique: 8% of the present value of expected claims. ${rs(pvClaims)} × 8% = ${rs(S.initial.riskAdjustment)}.`,
      },
      {
        title: 'Each year end',
        text: 'The risk adjustment is remeasured for the cover still to come. The fall in the balance is recognised in insurance revenue. It combines the release for risk that has expired and the effect of the remaining risk adjustment moving a year closer.',
        rows: S.years.filter((y) => y.inCoverage).map((y) => ({ label: `Year ${y.year}: released ${n1(y.raReleased)}, closing balance`, value: y.close.ra })),
      },
      {
        title: 'In total',
        text: `The releases add up to ${rs(sum(S.years.map((y) => y.raReleased)))}, the full day-one risk adjustment. TBIC does not split the change in the risk adjustment between the insurance service result and insurance finance income or expenses, so the whole change, including the effect of the time value of money, sits in the insurance service result (IFRS 17.81).`,
      },
    ],
    journals: [journal(s1, 'revenue', 'Year 1 insurance revenue (includes the risk adjustment release)')],
    takeaway: 'The risk adjustment is profit TBIC earns for bearing uncertainty. It reaches profit or loss as the risk expires, not on day one.',
    refs: ['IFRS 17.37', 'IFRS 17.81', 'IFRS 17.B124(b)', 'IFRS 17.119'],
  },
  {
    concept: 'csm',
    group: 'tbic-suraksha',
    title: 'Rolling TBIC Suraksha Term’s CSM forward',
    steps: [
      {
        title: 'Year 1 roll-forward',
        text: 'Interest is accreted first, then the release is calculated on the adjusted balance. There are no changes in estimates in year 1.',
        rows: [
          { label: 'Opening CSM (initial recognition)', value: S.initial.csm },
          { label: 'Interest accreted at the locked-in 7%', value: s1.csmAccretion },
          { label: 'CSM before release', value: S.initial.csm + s1.csmAccretion, total: true },
          { label: 'Released for cover provided (1 of 5 equal units)', value: -s1.csmRelease },
          { label: 'Closing CSM', value: s1.close.csm, total: true },
        ],
      },
      {
        title: 'All five years',
        text: 'Each year releases the CSM before release × units this year ÷ units this year and later. The release grows each year because interest keeps being added.',
        rows: S.years.filter((y) => y.inCoverage).map((y) => ({ label: `Year ${y.year} release`, value: y.csmRelease })),
      },
    ],
    journals: [journal(s1, 'revenue', 'Year 1 insurance revenue (includes the CSM release)')],
    takeaway: `Releases total ${rs(sum(S.years.map((y) => y.csmRelease)))}: the day-one CSM of ${rs(S.initial.csm)} plus ${rs(sum(S.years.map((y) => y.csmAccretion)))} of interest accreted over the 5 years.`,
    refs: ['IFRS 17.38', 'IFRS 17.44', 'IFRS 17.B119'],
  },
  {
    concept: 'coverage-units',
    group: 'tbic-suraksha',
    title: 'How coverage units shape TBIC Suraksha Term’s profit',
    steps: [
      {
        title: 'Equal cover each year',
        text: 'Each year provides one unit of cover. Year 1 releases 1 of the 5 units still to come, year 2 releases 1 of 4, and so on, until year 5 releases everything left.',
        rows: S.years.filter((y) => y.inCoverage).map((y) => ({ label: `Year ${y.year}: 1 ÷ ${6 - y.year} of the CSM before release`, value: y.csmRelease })),
      },
      {
        title: 'The formula',
        text: 'Coverage units reflect the quantity of benefits and the expected coverage period. If TBIC expected policies to lapse so that cover fell to 5, 4, 3, 2 and 1 units, year 1 would release 5 ÷ 15 of the CSM before release instead of 1 ÷ 5, bringing profit forward.',
        formula: 'Release = CSM before release × (units this period ÷ units this period and all future periods)',
      },
    ],
    journals: [],
    takeaway: 'Coverage units do not change the total profit, only its timing. They are a judgement TBIC must apply consistently and explain.',
    refs: ['IFRS 17.44(e)', 'IFRS 17.B119'],
  },
  {
    concept: 'lrc',
    group: 'tbic-griha',
    title: 'TBIC Griha Raksha’s liability for remaining coverage after year 1',
    steps: [
      {
        title: 'Day one',
        text: `TBIC receives the single premium of ₹4,400 lakh and pays ₹300 lakh of commission. The LRC holds the fulfilment cash flows and a CSM of ${rs(G.initial.csm)}.`,
      },
      {
        title: 'End of year 1',
        text: 'Three years of cover remain. No more premiums are due, so the fulfilment cash flows are the present value of the remaining claims and expenses, plus the risk adjustment for them.',
        rows: [
          { label: 'Present value of future outflows for remaining cover', value: g1.close.fcf },
          { label: 'Risk adjustment for remaining cover', value: g1.close.ra },
          { label: 'CSM', value: g1.close.csm },
          { label: 'Liability for remaining coverage', value: g1.close.lrc, total: true },
        ],
      },
      {
        title: 'What moved out of the LRC',
        text: `Year 1 insurance revenue of ${rs(g1.insuranceRevenue)} was recognised by reducing the LRC. Claims already incurred are no longer part of the LRC: the unpaid ones sit in the liability for incurred claims (${rs(g1.close.lic)}).`,
      },
    ],
    journals: [journal(g1, 'revenue', 'Year 1 insurance revenue')],
    takeaway: 'The LRC is the obligation for cover not yet given. Revenue is how it runs down.',
    refs: ['IFRS 17.40(a)', 'IFRS 17.41'],
  },
  {
    concept: 'lic',
    group: 'tbic-griha',
    title: 'TBIC Griha Raksha’s liability for incurred claims',
    steps: [
      {
        title: 'Year 1 claims',
        text: `Claims of ₹800 lakh are incurred. TBIC pays 60% (${rs(0.6 * gIn.claims[0])}) by the year end and owes the other 40% (${rs(0.4 * gIn.claims[0])}) a year later.`,
      },
      {
        title: 'Measure what is owed',
        text: 'The LIC is measured at fulfilment cash flows: discounted, with a risk adjustment, and with no CSM because the cover has already been given.',
        rows: [
          { label: `Unpaid ₹320.0 lakh × ${f4(df(r, 1))}`, value: g1.close.licPv },
          { label: 'Risk adjustment, 10%', value: g1.close.licRa },
          { label: 'LIC at the end of year 1', value: g1.close.lic, total: true },
        ],
      },
      {
        title: 'Year 2: interest, payment and a worse year',
        text: `During year 2 the discount unwinds (${rs(g2.interestOnLic)}, an insurance finance expense) and the ₹320.0 lakh is paid. The risk adjustment on it is released (${rs(g2.licRaReleased)}). Year 2 claims come in 10% above expectation at ₹${n1(g2.actualClaims)} lakh; 40% of them is unpaid at the year end, so the LIC closes at ${rs(g2.close.lic)}.`,
        rows: [
          { label: 'Opening LIC', value: g2.open.lic },
          { label: 'Interest unwinding', value: g2.interestOnLic },
          { label: 'Year 1 claims paid', value: -0.4 * gIn.claims[0] },
          { label: 'Risk adjustment released on year 1 claims', value: -g2.licRaReleased },
          { label: 'Year 2 claims unpaid, discounted, plus risk adjustment', value: g2.close.lic },
          { label: 'Closing LIC', value: g2.close.lic, total: true },
        ],
      },
    ],
    journals: [journal(g1, 'claims-incurred', 'Year 1 claims and expenses incurred'), journal(g1, 'paid', 'Year 1 claims and expenses paid')],
    takeaway: 'The extra year 2 claims hit the insurance service result in year 2. They are an experience adjustment relating to current service, so they do not adjust the CSM (IFRS 17.B96–B97).',
    refs: ['IFRS 17.40(b)', 'IFRS 17.42', 'IFRS 17.B96–B97'],
  },
  {
    concept: 'acquisition-cash-flows',
    group: 'tbic-suraksha',
    title: 'TBIC Suraksha Term’s ₹250 lakh commission',
    steps: [
      {
        title: 'Day one: it reduces the CSM',
        text: 'The commission is part of the fulfilment cash flows, so it lowers the unearned profit rather than being expensed immediately.',
        rows: [
          { label: 'CSM if there were no commission', value: S.initial.csm + sIn.acquisition },
          { label: 'Commission paid on day one', value: -sIn.acquisition },
          { label: 'CSM', value: S.initial.csm, total: true },
        ],
      },
      {
        title: 'Each year: recovered in revenue, expensed in equal measure',
        text: `IFRS 17.B125 requires the recovery to be allocated on the basis of the passage of time: ₹250 lakh ÷ 5 years = ${rs(s1.acquisitionAmortisation)} a year. That amount is part of insurance revenue and is also recognised as an insurance service expense.`,
      },
    ],
    journals: [journal(s1, 'acq-paid', 'Commission paid on day one'), journal(s1, 'acq-amort', 'Year 1 amortisation of acquisition cash flows')],
    takeaway: 'The commission reduces profit by ₹250 lakh in total, spread across the coverage period, and both revenue and expenses show it gross.',
    refs: ['IFRS 17.B65(e)', 'IFRS 17.38(c)', 'IFRS 17.B125'],
  },
  {
    concept: 'onerous-contracts',
    group: 'tbic-arogya',
    title: 'TBIC Arogya Health: a group that is onerous from day one',
    steps: [
      {
        title: 'Test at initial recognition',
        text: 'Premiums of ₹800 lakh a year cover claims of ₹760 lakh, expenses of ₹50 lakh and commission of ₹60 lakh in present value terms, but not once the risk adjustment is added.',
        rows: [
          { label: 'Present value of premiums', value: A.initial.pvInflows },
          { label: 'Present value of claims, expenses and commission', value: -A.initial.pvOutflows },
          { label: 'Risk adjustment, 6% of the claims', value: -A.initial.riskAdjustment },
          { label: 'Net outflow: the group is onerous', value: -A.initial.lossComponent, total: true },
        ],
      },
      {
        title: 'Recognise the loss now',
        text: `There is no CSM. The ${rs(A.initial.lossComponent)} is recognised in profit or loss immediately, and a loss component of the same amount is tracked within the LRC.`,
      },
    ],
    journals: [journal(a1, 'initial-loss', 'Loss recognised at initial recognition')],
    takeaway: 'IFRS 17 lets profits wait but never losses. TBIC’s pricing decision shows up in year 1 profit or loss, not spread over three years.',
    refs: ['IFRS 17.16(a)', 'IFRS 17.47'],
  },
  {
    concept: 'loss-component',
    group: 'tbic-arogya',
    title: 'Running down TBIC Arogya Health’s loss component',
    steps: [
      {
        title: 'Choose a systematic basis',
        text: `TBIC allocates the release of expected claims, expenses and risk adjustment using the ratio of the loss component to the present value of future claims and expenses plus the risk adjustment. Day one: ${rs(A.initial.lossComponent)} ÷ ${rs(A.initial.pvOutflows - aIn.acquisition + A.initial.riskAdjustment)} = ${f4(A.initial.lossComponent / (A.initial.pvOutflows - aIn.acquisition + A.initial.riskAdjustment))}. Like the sandbox, TBIC’s basis leaves out insurance finance income or expenses, which IFRS 17.51(c) also includes in the allocation; any residual is cleared in the final year.`,
      },
      {
        title: 'Allocate each year',
        text: 'Each year’s allocation is excluded from insurance revenue and reduces insurance service expenses by the same amount, so the day-one loss is not recognised a second time when claims are incurred. In the last year whatever remains is allocated.',
        rows: A.years.filter((y) => y.inCoverage).map((y) => ({ label: `Year ${y.year} allocation, closing loss component ${n1(y.close.lossComponent)}`, value: y.lossComponentAllocation })),
      },
      {
        title: 'Check',
        text: `The allocations add up to ${rs(sum(A.years.map((y) => y.lossComponentAllocation)))}, the full loss component, and the balance reaches nil when cover ends.`,
      },
    ],
    journals: [journal(a1, 'lc-alloc', 'Year 1 allocation to the loss component')],
    takeaway: `Over the group’s life TBIC loses ${rs(-A.totals.profit)} before investment income. The loss component makes sure the day-one loss and the later claims together add up to that, with nothing counted twice.`,
    refs: ['IFRS 17.49–52'],
  },
]

export const WORKED_BY_CONCEPT: Record<string, WorkedExample> = Object.fromEntries(WORKED_EXAMPLES.map((w) => [w.concept, w]))
