import { runGmm, type GmmInputs, type GmmResult } from './gmm'
import { PRESETS } from './presets'

export interface Mission {
  id: string
  title: string
  level: 'Starter' | 'Intermediate' | 'Advanced'
  preset: string
  goal: string
  hint: string
  /** What the learner should take away once the goal is met. */
  lesson: string
  concept: string
  check: (r: GmmResult, inp: GmmInputs) => boolean
}

const baseline = (id: string) => runGmm(PRESETS.find((p) => p.id === id)!.inputs)

export const MISSIONS: Mission[] = [
  {
    id: 'make-onerous',
    title: 'Tip a group into loss',
    level: 'Starter',
    preset: 'profitable',
    goal: 'Change only the premium so the group is onerous on day one.',
    hint: 'Day one is onerous when the present value of premiums is below outflows plus the risk adjustment. Lower the premium step by step.',
    lesson:
      'Once expected outflows plus the risk adjustment exceed the present value of expected premiums, there is no CSM. The whole shortfall is a loss in profit or loss immediately, and a loss component starts tracking it.',
    concept: 'onerous-contracts',
    check: (r, inp) => r.initial.lossComponent > 0 && inp.premium !== PRESETS[0].inputs.premium,
  },
  {
    id: 'rate-effect',
    title: 'Higher rates, bigger CSM?',
    level: 'Starter',
    preset: 'profitable',
    goal: 'Change only the discount rate so the day-one CSM is larger than it is now.',
    hint: 'Premiums arrive before most claims are paid. Which side of the balance does a higher rate shrink more?',
    lesson:
      'Discounting reduces amounts paid later more than amounts received sooner. Here claims are paid after premiums arrive, so a higher rate lowers the present value of outflows more than inflows, and the CSM grows.',
    concept: 'discounting',
    check: (r, inp) => r.initial.csm > baseline('profitable').initial.csm + 0.5 && inp.discountRate !== PRESETS[0].inputs.discountRate,
  },
  {
    id: 'experience',
    title: 'Spot an experience adjustment',
    level: 'Starter',
    preset: 'profitable',
    goal: 'Make actual claims in year 3 at least 20% above expected, without moving the CSM.',
    hint: 'Use the "Actual ÷ expected" column for year 3.',
    lesson:
      'The difference between actual and expected claims for the current period is an experience adjustment. It hits the insurance service result in that year, while the CSM, which only reflects future service, stays exactly where it was.',
    concept: 'csm',
    check: (r, inp) => (inp.actualClaimsFactor[2] ?? 1) >= 1.2 && Math.abs(r.years[2].close.csm - baseline('profitable').years[2].close.csm) < 0.5,
  },
  {
    id: 'exhaust-csm',
    title: 'Exhaust the CSM',
    level: 'Intermediate',
    preset: 'profitable',
    goal: 'Use a change in the claims outlook so the CSM is used up and a loss is recognised later in the life of the group.',
    hint: 'Pick a year in "Change in the claims outlook" and raise future claims until the CSM cannot absorb the change.',
    lesson:
      'Adverse changes for future service are absorbed by the CSM first. Only the part that exceeds the CSM is a loss, and from then on the group carries a loss component instead of a CSM.',
    concept: 'loss-component',
    check: (r) => r.initial.lossComponent === 0 && r.years.some((y) => y.changeLoss > 0.5),
  },
  {
    id: 'reverse-loss',
    title: 'Reverse an onerous loss',
    level: 'Intermediate',
    preset: 'onerous',
    goal: 'Start from the onerous group and improve the claims outlook enough to reverse part of the loss component.',
    hint: 'Set a change at the end of year 1 with a negative percentage.',
    lesson:
      'Favourable changes first reverse the loss component, which is credited to insurance service expenses. Only what is left after the loss component reaches zero rebuilds a CSM.',
    concept: 'onerous-contracts',
    check: (r) => r.years.some((y) => y.lossReversal > 0.5),
  },
  {
    id: 'front-load',
    title: 'Front-load the profit',
    level: 'Intermediate',
    preset: 'profitable',
    goal: 'Change coverage units so that year 1 releases more than 40% of the day-one CSM.',
    hint: 'Coverage units measure how much service each year provides. Make year 1 provide much more than later years.',
    lesson:
      'The CSM is released in proportion to coverage units. A product that provides most of its cover early, such as a reducing-balance protection policy, earns most of its profit early.',
    concept: 'coverage-units',
    check: (r) => r.initial.csm > 0 && r.years[0].csmRelease > 0.4 * r.initial.csm,
  },
  {
    id: 'build-lic',
    title: 'Build a liability for incurred claims',
    level: 'Advanced',
    preset: 'profitable',
    goal: 'Make the group carry an LIC of more than 200 at the end of year 2.',
    hint: 'Claims that are incurred but paid next year sit in the LIC. Increase "Claims paid next year".',
    lesson:
      'The LIC holds claims for events that already happened but are not yet paid, discounted and with a risk adjustment. It earns interest (a finance expense) and its risk adjustment is released as the claims settle.',
    concept: 'lic',
    check: (r) => (r.years[1]?.close.lic ?? 0) > 200,
  },
  {
    id: 'asset-position',
    title: 'Turn the liability into an asset',
    level: 'Advanced',
    preset: 'profitable',
    goal: 'Find inputs where the LRC is below zero at the end of year 1, then explain why.',
    hint: 'Annual premiums still to come count as inflows in the fulfilment cash flows. What if they are large compared with the cover left?',
    lesson:
      'When premiums still to be received are worth more than the cover still to be provided plus the CSM, the liability for remaining coverage becomes an asset. IFRS 17 presents portfolios whose net position is an asset separately from those in a liability position (IFRS 17.78).',
    concept: 'lrc',
    check: (r) => (r.years[0]?.close.lrc ?? 0) < -0.5,
  },
]

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))
