import { runGmm } from '../engine/gmm'
import { TBIC_GROUPS, type TbicGroupId } from '../engine/tbic'
import { TBIC_RESULTS, df, f4, n1, rs } from './tbic-figures'

/**
 * Numeric questions. The learner types a number; the answer and every figure in the prompt and the solution come
 * from the engine, so text and arithmetic cannot drift apart. Each common mistake is a wrong answer we can recognise,
 * with an explanation of what went wrong.
 */
export interface NumericMistake {
  value: number
  message: string
}

export interface NumericQuestion {
  id: string
  concept: string
  group: TbicGroupId
  prompt: string
  answer: number
  solution: string[]
  mistakes: NumericMistake[]
  refs: string[]
}

const { suraksha: S, arogya: A, griha: G } = TBIC_RESULTS
const sIn = TBIC_GROUPS['tbic-suraksha'].inputs
const gIn = TBIC_GROUPS['tbic-griha'].inputs
const r = sIn.discountRate
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

// Suraksha building blocks
const dueFactors = [0, 1, 2, 3, 4].map((t) => df(r, t))
const endFactors = [1, 2, 3, 4, 5].map((t) => df(r, t))
const pvPremiums = S.initial.pvInflows
const pvClaims = sIn.claims[0] * sum(endFactors)
const pvExpenses = sIn.expenses[0] * sum(dueFactors)
const pvOutflows = S.initial.pvOutflows
const ra0 = S.initial.riskAdjustment
const csm0 = S.initial.csm
const y1 = S.years[0]
const csmBeforeRelease = csm0 + y1.csmAccretion
const raEndY1 = y1.close.ra
const pvClaimsEndY1 = raEndY1 / sIn.raPct
/** The part of the day-one risk adjustment that relates to year 1's claims. */
const raExpiryY1 = sIn.raPct * sIn.claims[0] * df(r, 1)

// Suraksha with coverage units that fall as policies lapse
const declining = runGmm({ ...sIn, coverageUnits: [5, 4, 3, 2, 1] })

// Griha Raksha
const g1 = G.years[0]
const g2 = G.years[1]
const gOutstanding1 = gIn.settlementLag * gIn.claims[0]
const gActual2 = g2.actualClaims

// Arogya
const a1 = A.years[0]
const aBase = A.initial.pvOutflows - TBIC_GROUPS['tbic-arogya'].inputs.acquisition + A.initial.riskAdjustment
const aRatio = A.initial.lossComponent / aBase
const aRelease1 = a1.expectedClaimsReleased + a1.expensesPaid + a1.raReleased

export const NUMERIC_QUESTIONS: NumericQuestion[] = [
  {
    id: 'pv-premiums',
    concept: 'discounting',
    group: 'tbic-suraksha',
    prompt: `TBIC Suraksha Term receives premiums of ₹1,000 lakh at the start of each of its 5 years. Discounting at 7% a year, what is the present value of those premiums at initial recognition, the start of year 1? Answer in ₹ lakh.`,
    answer: pvPremiums,
    solution: [
      `Premiums arrive at the start of each year, so the first is not discounted and the last is discounted for 4 years.`,
      `Discount factors at 7%: ${dueFactors.map(f4).join(', ')}. Their sum is ${f4(sum(dueFactors))}.`,
      `Present value = ₹1,000 lakh × ${f4(sum(dueFactors))} = ${rs(pvPremiums)}.`,
    ],
    mistakes: [
      { value: 5000, message: 'That is the undiscounted total. IFRS 17 measures cash flows at their present value, so each premium is discounted for the time until it is received.' },
      { value: 1000 * sum(endFactors), message: 'You discounted each premium for one year too many. The premiums arrive at the start of each year, so the first one is received on day one and is not discounted at all.' },
    ],
    refs: ['IFRS 17.32(a)(ii)', 'IFRS 17.36'],
  },
  {
    id: 'pv-claims',
    concept: 'discounting',
    group: 'tbic-suraksha',
    prompt: `TBIC Suraksha Term expects death claims of ₹700 lakh a year for 5 years, paid at the end of each year. Discounting at 7%, what is the present value of the expected claims at initial recognition? Answer in ₹ lakh.`,
    answer: pvClaims,
    solution: [
      `Claims are paid at the end of each year, so the first is discounted for 1 year and the last for 5 years.`,
      `Discount factors at 7%: ${endFactors.map(f4).join(', ')}. Their sum is ${f4(sum(endFactors))}.`,
      `Present value = ₹700 lakh × ${f4(sum(endFactors))} = ${rs(pvClaims)}.`,
    ],
    mistakes: [
      { value: 3500, message: 'That is the undiscounted total of the claims. Each claim must be discounted from the year end when it is paid back to day one.' },
      { value: 700 * sum(dueFactors), message: 'You discounted the claims as if they were paid at the start of each year. They are paid at the end, so each one is discounted for one more year.' },
    ],
    refs: ['IFRS 17.33', 'IFRS 17.36'],
  },
  {
    id: 'pv-outflows',
    concept: 'fulfilment-cash-flows',
    group: 'tbic-suraksha',
    prompt: `For TBIC Suraksha Term, what is the present value at initial recognition of all expected cash outflows within the contract boundary: the claims, the ₹60 lakh of maintenance expenses at the start of each year, and the ₹250 lakh commission paid on day one? Use 7%. Answer in ₹ lakh.`,
    answer: pvOutflows,
    solution: [
      `Claims: ₹700 lakh × ${f4(sum(endFactors))} = ${rs(pvClaims)}.`,
      `Maintenance expenses, paid at the start of each year: ₹60 lakh × ${f4(sum(dueFactors))} = ${rs(pvExpenses)}.`,
      `Commission is paid on day one, so it is not discounted: ₹250.0 lakh.`,
      `Total present value of outflows = ${rs(pvOutflows)}.`,
    ],
    mistakes: [
      { value: pvOutflows - 250, message: 'You left out the commission. Insurance acquisition cash flows directly attributable to the portfolio are part of the fulfilment cash flows (IFRS 17.B65(e)).' },
      { value: pvOutflows - pvExpenses, message: 'You left out the maintenance expenses. Policy administration and maintenance costs are cash flows within the contract boundary (IFRS 17.B65(h)).' },
      { value: 3500 + 300 + 250, message: 'That is the undiscounted total. Claims and expenses are paid in future years, so they must be discounted at 7%.' },
    ],
    refs: ['IFRS 17.33', 'IFRS 17.B65'],
  },
  {
    id: 'ra-day-one',
    concept: 'risk-adjustment',
    group: 'tbic-suraksha',
    prompt: `TBIC sets the risk adjustment for non-financial risk at 8% of the present value of expected claims. For TBIC Suraksha Term, what is the risk adjustment at initial recognition? Answer in ₹ lakh.`,
    answer: ra0,
    solution: [
      `Present value of expected claims at 7%: ${rs(pvClaims)}.`,
      `Risk adjustment = 8% × ${rs(pvClaims)} = ${rs(ra0)}.`,
      `The percentage is TBIC's own technique. IFRS 17 does not prescribe a method, but requires the entity to disclose the confidence level the result corresponds to (IFRS 17.119).`,
    ],
    mistakes: [
      { value: 0.08 * 3500, message: 'You applied 8% to undiscounted claims. TBIC applies it to the present value of the claims.' },
      { value: 0.08 * pvOutflows, message: 'You applied 8% to all outflows, including expenses and commission. TBIC applies it to the present value of the claims only.' },
    ],
    refs: ['IFRS 17.37', 'IFRS 17.B86–B92', 'IFRS 17.119'],
  },
  {
    id: 'ra-release-y1',
    concept: 'risk-adjustment',
    group: 'tbic-suraksha',
    prompt: `Continuing TBIC Suraksha Term: at the end of year 1, four years of cover remain. TBIC does not split the change in the risk adjustment (IFRS 17.81). By how much does the risk adjustment fall in year 1, the amount recognised in insurance revenue? Answer in ₹ lakh.`,
    answer: y1.raReleased,
    solution: [
      `At the end of year 1 the remaining claims are ₹700 lakh at the end of each of the next 4 years. Their present value is ${rs(pvClaimsEndY1)}.`,
      `Risk adjustment at the end of year 1 = 8% × ${rs(pvClaimsEndY1)} = ${rs(raEndY1)}.`,
      `Released in year 1 = ${rs(ra0)} − ${rs(raEndY1)} = ${rs(y1.raReleased)}. This amount is part of year 1 insurance revenue.`,
      `The fall nets the release for year 1's risk, ${rs(raExpiryY1)}, against ${rs(raEndY1 - (ra0 - raExpiryY1))} of unwinding on the risk adjustment still held.`,
    ],
    mistakes: [
      { value: ra0 / 5, message: 'A straight-line release is not what TBIC does. The risk adjustment is remeasured at each reporting date, and the amount in revenue is the fall in the balance.' },
      { value: raExpiryY1, message: 'That is the release for year 1’s risk on its own. Because TBIC does not split out the finance effect, the amount in revenue is the net fall in the balance, which also includes the unwinding of the risk adjustment still held.' },
      { value: raEndY1, message: 'That is the risk adjustment still held at the end of year 1, not the amount released during the year.' },
    ],
    refs: ['IFRS 17.37', 'IFRS 17.B124(b)'],
  },
  {
    id: 'csm-day-one',
    concept: 'csm',
    group: 'tbic-suraksha',
    prompt: `Using your answers so far for TBIC Suraksha Term (present value of premiums, present value of outflows and the risk adjustment), what is the contractual service margin at initial recognition? Answer in ₹ lakh.`,
    answer: csm0,
    solution: [
      `Present value of premiums: ${rs(pvPremiums)}.`,
      `Less present value of outflows: ${rs(pvOutflows)}. Less risk adjustment: ${rs(ra0)}.`,
      `CSM = ${rs(pvPremiums)} − ${rs(pvOutflows)} − ${rs(ra0)} = ${rs(csm0)}. It is set so that no gain appears on day one.`,
    ],
    mistakes: [
      { value: pvPremiums - pvOutflows, message: 'You forgot the risk adjustment. The CSM is what is left after the fulfilment cash flows, and those include the risk adjustment (IFRS 17.32, 38).' },
      { value: csm0 + 250, message: 'You left out the commission. Acquisition cash flows are part of the fulfilment cash flows, so they reduce the CSM.' },
      { value: -csm0, message: 'Right size, wrong sign. The CSM is a positive amount of unearned profit held in the liability.' },
    ],
    refs: ['IFRS 17.32', 'IFRS 17.38'],
  },
  {
    id: 'csm-release-y1',
    concept: 'csm',
    group: 'tbic-suraksha',
    prompt: `TBIC Suraksha Term provides the same cover in each of its 5 years, so each year has one coverage unit. The CSM accretes interest at the locked-in rate of 7%. How much CSM is released to insurance revenue in year 1? Answer in ₹ lakh.`,
    answer: y1.csmRelease,
    solution: [
      `Interest accreted in year 1 = 7% × ${rs(csm0)} = ${rs(y1.csmAccretion)}.`,
      `CSM before release = ${rs(csm0)} + ${rs(y1.csmAccretion)} = ${rs(csmBeforeRelease)}.`,
      `Year 1 provides 1 of the 5 coverage units still to be provided, so the release is ${rs(csmBeforeRelease)} × 1/5 = ${rs(y1.csmRelease)}.`,
    ],
    mistakes: [
      { value: csm0 / 5, message: 'You released one fifth of the opening CSM. Interest is accreted first (IFRS 17.44(b)), and the release is calculated on the CSM after that adjustment (IFRS 17.44(e), B119).' },
      { value: y1.csmAccretion, message: 'That is the interest accreted on the CSM, which is an insurance finance expense, not the release to revenue.' },
    ],
    refs: ['IFRS 17.44', 'IFRS 17.B119', 'IFRS 17.B72(b)'],
  },
  {
    id: 'csm-close-y1',
    concept: 'csm',
    group: 'tbic-suraksha',
    prompt: `What is the CSM of TBIC Suraksha Term at the end of year 1? There are no changes in estimates in year 1. Answer in ₹ lakh.`,
    answer: y1.close.csm,
    solution: [
      `Opening CSM ${rs(csm0)}, plus interest accreted ${rs(y1.csmAccretion)}, less release ${rs(y1.csmRelease)}.`,
      `Closing CSM = ${rs(y1.close.csm)}.`,
    ],
    mistakes: [
      { value: csm0 - csm0 / 5, message: 'You skipped the interest accretion. The CSM grows by interest at the locked-in rate before the release is calculated.' },
      { value: csm0 - y1.csmRelease, message: 'You deducted the right release but left out the interest accreted during the year, which also adds to the balance.' },
      { value: csmBeforeRelease, message: 'You accreted interest but did not deduct the CSM released to revenue for the cover provided in year 1.' },
    ],
    refs: ['IFRS 17.44'],
  },
  {
    id: 'cu-declining',
    concept: 'coverage-units',
    group: 'tbic-suraksha',
    prompt: `Suppose TBIC expects Suraksha Term policies to lapse over time, so the cover provided falls each year. Its coverage units are 5, 4, 3, 2 and 1 in years 1 to 5. Everything else is unchanged. How much CSM is released in year 1? Answer in ₹ lakh.`,
    answer: declining.years[0].csmRelease,
    solution: [
      `The opening CSM and interest are unchanged: CSM before release is ${rs(csmBeforeRelease)}.`,
      `Units provided in year 1: 5. Units provided in year 1 plus those expected later: 5 + 4 + 3 + 2 + 1 = 15.`,
      `Release = ${rs(csmBeforeRelease)} × 5/15 = ${rs(declining.years[0].csmRelease)}. More profit is recognised early because more cover is provided early.`,
    ],
    mistakes: [
      { value: y1.csmRelease, message: 'That is the release with equal units, one fifth of the CSM. The release follows coverage units, which now fall each year: year 1 carries 5 of the 15 units.' },
      { value: csm0 * (5 / 15), message: 'Right proportion, but you applied it before accreting interest. The release uses the CSM after interest for the year.' },
    ],
    refs: ['IFRS 17.44(e)', 'IFRS 17.B119'],
  },
  {
    id: 'acq-y1',
    concept: 'acquisition-cash-flows',
    group: 'tbic-suraksha',
    prompt: `TBIC paid ₹250 lakh of commission when it sold the Suraksha Term policies, which cover 5 years. IFRS 17.B125 requires the recovery of acquisition cash flows to be allocated on the basis of the passage of time. How much is included in insurance revenue in year 1 for the recovery of acquisition cash flows? Answer in ₹ lakh.`,
    answer: y1.acquisitionAmortisation,
    solution: [
      `IFRS 17.B125 allocates the portion of premiums that recovers acquisition cash flows to each period on the basis of the passage of time.`,
      `₹250 lakh over 5 equal years = ${rs(y1.acquisitionAmortisation)} a year.`,
      `The same amount is recognised as an insurance service expense in year 1, so the two lines offset in the insurance service result.`,
    ],
    mistakes: [
      { value: 250, message: 'The commission is not recognised in full in year 1. It is included in the fulfilment cash flows on day one and recovered over the coverage period.' },
      { value: 0, message: 'Acquisition cash flows do appear in revenue: the recovery is one of the components of insurance revenue (IFRS 17.B125).' },
    ],
    refs: ['IFRS 17.B125'],
  },
  {
    id: 'lrc-griha-y1',
    concept: 'lrc',
    group: 'tbic-griha',
    prompt: `TBIC Griha Raksha received its single premium of ₹4,400 lakh on day one. At the end of year 1, the present value of future outflows for the 3 remaining years of cover is ${rs(g1.close.fcf)}, the risk adjustment for that cover is ${rs(g1.close.ra)} (together, the fulfilment cash flows) and the CSM is ${rs(g1.close.csm)}. What is the liability for remaining coverage? Answer in ₹ lakh.`,
    answer: g1.close.lrc,
    solution: [
      `The LRC is the fulfilment cash flows for future service plus the CSM (IFRS 17.40(a)).`,
      `LRC = ${rs(g1.close.fcf)} + ${rs(g1.close.ra)} + ${rs(g1.close.csm)} = ${rs(g1.close.lrc)}.`,
      `No future premiums are expected, so the fulfilment cash flows are all outflows. Claims already incurred in year 1 sit in the LIC, not here.`,
    ],
    mistakes: [
      { value: g1.close.fcf + g1.close.ra, message: 'You left out the CSM. The unearned profit for future cover is part of the liability for remaining coverage.' },
      { value: g1.close.fcf + g1.close.csm, message: 'You left out the risk adjustment for the remaining cover. It is part of the fulfilment cash flows.' },
      { value: g1.close.lrc + g1.close.lic, message: 'That adds the LIC as well. The LIC covers claims already incurred and is a separate component of the insurance contract liability.' },
    ],
    refs: ['IFRS 17.40(a)'],
  },
  {
    id: 'lic-griha-y1',
    concept: 'lic',
    group: 'tbic-griha',
    prompt: `In year 1 TBIC Griha Raksha incurs claims of ₹800 lakh. It pays 60% by the year end and the other 40% one year later. Discounting at 7% and with a risk adjustment of 10% of the present value of the unpaid claims, what is the liability for incurred claims at the end of year 1? Answer in ₹ lakh.`,
    answer: g1.close.lic,
    solution: [
      `Unpaid at the year end: 40% × ₹800 lakh = ${rs(gOutstanding1)}, payable in one year.`,
      `Present value: ${rs(gOutstanding1)} × ${f4(df(r, 1))} = ${rs(g1.close.licPv)}.`,
      `Risk adjustment: 10% × ${rs(g1.close.licPv)} = ${rs(g1.close.licRa)}.`,
      `LIC = ${rs(g1.close.licPv)} + ${rs(g1.close.licRa)} = ${rs(g1.close.lic)}. There is no CSM in the LIC because the service has already been provided.`,
    ],
    mistakes: [
      { value: gOutstanding1, message: 'That is the undiscounted unpaid amount without a risk adjustment. The LIC is measured at fulfilment cash flows: discounted, plus a risk adjustment.' },
      { value: g1.close.licPv, message: 'You discounted correctly but left out the risk adjustment for the unpaid claims.' },
      { value: gOutstanding1 * 1.1, message: 'You added the risk adjustment but did not discount. The claims are paid one year after the measurement date.' },
    ],
    refs: ['IFRS 17.40(b)', 'IFRS 17.33', 'IFRS 17.37'],
  },
  {
    id: 'paid-griha-y2',
    concept: 'lic',
    group: 'tbic-griha',
    prompt: `In year 2 TBIC Griha Raksha's actual claims are 10% above the ₹850 lakh expected, so ₹${n1(gActual2)} lakh. It pays 60% of them in year 2. It also settles the year 1 claims it still owed. How much does it pay in claims in year 2? Answer in ₹ lakh.`,
    answer: g2.claimsPaid,
    solution: [
      `Year 1 claims still owed: ${rs(gOutstanding1)}, all paid in year 2.`,
      `60% of year 2 claims: 60% × ₹${n1(gActual2)} lakh = ${rs(0.6 * gActual2)}.`,
      `Claims paid in year 2 = ${rs(gOutstanding1)} + ${rs(0.6 * gActual2)} = ${rs(g2.claimsPaid)}.`,
    ],
    mistakes: [
      { value: 0.6 * gActual2, message: 'You left out the year 1 claims settled in year 2. They were held in the LIC and are paid now.' },
      { value: 0.6 * 850 + gOutstanding1, message: 'You used expected claims for year 2. Payments are based on the claims that actually happened, ₹935.0 lakh.' },
      { value: gActual2, message: 'Only 60% of year 2 claims are paid in year 2. The rest moves into the LIC.' },
    ],
    refs: ['IFRS 17.40(b)', 'IFRS 17.105(a)'],
  },
  {
    id: 'arogya-loss',
    concept: 'onerous-contracts',
    group: 'tbic-arogya',
    prompt: `TBIC Arogya Health: the present value of premiums is ${rs(A.initial.pvInflows)}, the present value of claims, expenses and commission is ${rs(A.initial.pvOutflows)}, and the risk adjustment is ${rs(A.initial.riskAdjustment)}. What loss, if any, does TBIC recognise in profit or loss at initial recognition? Answer in ₹ lakh (0 if none).`,
    answer: A.initial.lossComponent,
    solution: [
      `Fulfilment cash flows = outflows ${rs(A.initial.pvOutflows)} + risk adjustment ${rs(A.initial.riskAdjustment)} − inflows ${rs(A.initial.pvInflows)}.`,
      `That is a net outflow of ${rs(A.initial.lossComponent)}, so the group is onerous at initial recognition (IFRS 17.47).`,
      `The loss of ${rs(A.initial.lossComponent)} is recognised immediately in profit or loss, there is no CSM, and a loss component of the same amount is set up.`,
    ],
    mistakes: [
      { value: 0, message: 'The group is onerous. Premiums cover the cash outflows but not the risk adjustment, which is part of the fulfilment cash flows (IFRS 17.32, 47).' },
      { value: A.initial.pvInflows - A.initial.pvOutflows, message: 'That is the margin before the risk adjustment, which would suggest a profit. Include the risk adjustment and the group becomes a net outflow.' },
    ],
    refs: ['IFRS 17.47', 'IFRS 17.49'],
  },
  {
    id: 'arogya-alloc-y1',
    concept: 'loss-component',
    group: 'tbic-arogya',
    prompt: `TBIC Arogya Health has a loss component of ${rs(A.initial.lossComponent)}. TBIC allocates the release of expected claims, expenses and risk adjustment between the loss component and the rest of the LRC using the ratio of the loss component to the present value of future claims and expenses plus the risk adjustment (${rs(aBase)} at the start of year 1). In year 1 the release is ${rs(aRelease1)}. How much is allocated to the loss component? Answer in ₹ lakh.`,
    answer: a1.lossComponentAllocation,
    solution: [
      `Ratio = ${rs(A.initial.lossComponent)} ÷ ${rs(aBase)} = ${f4(aRatio)}.`,
      `Allocation = ${rs(aRelease1)} × ${f4(aRatio)} = ${rs(a1.lossComponentAllocation)}.`,
      `This amount is excluded from insurance revenue and reduces insurance service expenses, so the loss recognised on day one is not counted twice (IFRS 17.49–52).`,
    ],
    mistakes: [
      { value: A.initial.lossComponent / 3, message: 'An equal split over the years is not the method TBIC uses. The allocation follows the ratio of the loss component to expected outflows plus the risk adjustment.' },
      { value: A.initial.lossComponent, message: 'The loss component is not reversed all at once. It is allocated systematically as the related claims, expenses and risk are released over the coverage period.' },
    ],
    refs: ['IFRS 17.49–52'],
  },
  {
    id: 'lifetime-profit',
    concept: 'gmm',
    group: 'tbic-suraksha',
    prompt: `Ignoring any investment income on the assets TBIC holds, what is the total profit from TBIC Suraksha Term over its whole 5-year life, assuming everything happens as expected? Answer in ₹ lakh.`,
    answer: S.totals.profit,
    solution: [
      `Over a group's whole life, profit before investment income equals the undiscounted net cash flows: premiums less claims, expenses and commission.`,
      `₹5,000.0 lakh − ₹3,500.0 lakh − ₹300.0 lakh − ₹250.0 lakh = ${rs(S.totals.profit)}.`,
      `The insurance service result adds up to more than this, ${rs(S.totals.revenue - S.totals.serviceExpense)}, and insurance finance expenses of ${rs(S.totals.financeExpense)} bring it back to the cash result. In practice, investment income on the assets backing the liability offsets those finance expenses.`,
    ],
    mistakes: [
      { value: csm0, message: 'That is the day-one CSM, a present value. Over the life, the CSM also accretes interest, and the risk adjustment and finance effects run through profit too.' },
      { value: pvPremiums - pvOutflows, message: 'That is the day-one present value margin. Total profit over the life, before investment income, is the undiscounted net cash flow.' },
    ],
    refs: ['IFRS 17.38', 'IFRS 17.41', 'IFRS 17.87'],
  },
]

export const NUMERIC_BY_CONCEPT: Record<string, NumericQuestion[]> = {}
for (const q of NUMERIC_QUESTIONS) (NUMERIC_BY_CONCEPT[q.concept] ??= []).push(q)
export const NUMERIC_BY_ID: Record<string, NumericQuestion> = Object.fromEntries(NUMERIC_QUESTIONS.map((q) => [q.id, q]))

/** Accepted margin: half a lakh, or 0.2% of the answer for larger amounts, so rounded intermediate steps still pass. */
export function tolerance(answer: number): number {
  return Math.max(0.5, Math.abs(answer) * 0.002)
}

/** Reads what a learner typed: commas, ₹, "lakh" and spaces are ignored; brackets or a leading minus mean negative. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/₹|rs\.?|inr|lakhs?|lacs?|,|\s/g, '')
  let neg = false
  if (/^\(.*\)$/.test(s)) {
    neg = true
    s = s.slice(1, -1)
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  const v = Number(s)
  return neg ? -v : v
}

export type NumericVerdict =
  | { kind: 'correct' }
  | { kind: 'mistake'; message: string }
  | { kind: 'wrong' }
  | { kind: 'invalid' }

export function checkNumeric(q: NumericQuestion, raw: string): NumericVerdict {
  const v = parseAmount(raw)
  if (v === null) return { kind: 'invalid' }
  const tol = tolerance(q.answer)
  if (Math.abs(v - q.answer) <= tol) return { kind: 'correct' }
  const m = q.mistakes.find((x) => Math.abs(v - x.value) <= tolerance(x.value))
  return m ? { kind: 'mistake', message: m.message } : { kind: 'wrong' }
}
