/**
 * Clickable decision trees for the classification questions learners most often get wrong.
 * Wording paraphrases the standard and cites paragraphs; it never reproduces IFRS text.
 */
export interface DecisionOption {
  label: string
  next: string
  /** Shown in the trail when this answer is chosen. */
  note?: string
}

export interface DecisionQuestion {
  kind: 'question'
  text: string
  help?: string
  refs: string[]
  options: DecisionOption[]
}

export interface DecisionOutcome {
  kind: 'outcome'
  tone: 'in' | 'out' | 'choice'
  title: string
  text: string
  refs: string[]
  /** Another tree or page to continue with. */
  next?: { label: string; to: string }
}

export type DecisionNode = DecisionQuestion | DecisionOutcome

export interface DecisionTree {
  id: string
  title: string
  asks: string
  concept: string
  start: string
  nodes: Record<string, DecisionNode>
}

const yesNo = (yes: string, no: string, notes?: { yes?: string; no?: string }): DecisionOption[] => [
  { label: 'Yes', next: yes, note: notes?.yes },
  { label: 'No', next: no, note: notes?.no },
]

export const DECISION_TREES: DecisionTree[] = [
  {
    id: 'scope',
    title: 'Is it in the scope of IFRS 17?',
    asks: 'Whether a contract is accounted for under IFRS 17, under another Standard, or by choice.',
    concept: 'insurance-contract',
    start: 'risk',
    nodes: {
      risk: {
        kind: 'question',
        text: 'Does the issuer accept significant insurance risk from the other party, by agreeing to compensate them if a specified uncertain future event adversely affects them?',
        help: 'Insurance risk is risk, other than financial risk, transferred from the holder to the issuer. It is significant if, in at least one scenario with commercial substance, the insured event could make the issuer pay significant additional amounts and suffer a loss on a present value basis.',
        refs: ['IFRS 17 Appendix A', 'IFRS 17.B17–B23'],
        options: yesNo('holder', 'dpf'),
      },
      dpf: {
        kind: 'question',
        text: 'Is it an investment contract with discretionary participation features, issued by an entity that also issues insurance contracts?',
        refs: ['IFRS 17.3(c)', 'IFRS 17.71'],
        options: yesNo('in-dpf', 'out-not-insurance'),
      },
      holder: {
        kind: 'question',
        text: 'Is the entity the policyholder in this contract, rather than the issuer?',
        refs: ['IFRS 17.7(g)'],
        options: yesNo('reins', 'excluded'),
      },
      reins: {
        kind: 'question',
        text: 'Is it a reinsurance contract the entity holds?',
        refs: ['IFRS 17.3(b)', 'IFRS 17.7(g)'],
        options: yesNo('in-reins', 'out-policyholder'),
      },
      excluded: {
        kind: 'question',
        text: 'Is it one of the contracts IFRS 17.7 excludes?',
        help: 'The exclusions are: warranties given by a manufacturer, dealer or retailer with its goods or services; employee benefit plan assets and liabilities and defined benefit plan obligations; rights or obligations that depend on the future use of a non-financial item, such as royalties; residual value guarantees given by a manufacturer, dealer or retailer, and a lessee’s residual value guarantee embedded in a lease; contingent consideration in a business combination; and credit card and similar contracts whose price does not reflect an assessment of the insurance risk of the individual customer.',
        refs: ['IFRS 17.7'],
        options: yesNo('out-excluded', 'guarantee'),
      },
      guarantee: {
        kind: 'question',
        text: 'Is it a financial guarantee contract?',
        refs: ['IFRS 17.7(e)'],
        options: yesNo('asserted', 'fixed-fee'),
      },
      asserted: {
        kind: 'question',
        text: 'Has the issuer previously asserted explicitly that it regards such contracts as insurance contracts, and used the accounting that applies to insurance contracts?',
        refs: ['IFRS 17.7(e)'],
        options: yesNo('choice-guarantee', 'out-guarantee'),
      },
      'fixed-fee': {
        kind: 'question',
        text: 'Is it a fixed-fee service contract that meets all three conditions: the price does not reflect an assessment of the individual customer’s risk; it compensates the customer by providing services rather than cash; and the insurance risk arises mainly from the customer’s use of the services, not from uncertainty about their cost?',
        help: 'A roadside assistance plan sold for a fixed annual fee is an often-cited example.',
        refs: ['IFRS 17.8'],
        options: yesNo('choice-fixed-fee', 'waiver'),
      },
      waiver: {
        kind: 'question',
        text: 'Does the contract limit compensation for insured events to the amount needed to settle the policyholder’s own obligation under the contract, such as a loan that is waived if the borrower dies?',
        refs: ['IFRS 17.8A'],
        options: yesNo('choice-waiver', 'in-scope'),
      },
      'in-scope': {
        kind: 'outcome',
        tone: 'in',
        title: 'IFRS 17 applies',
        text: 'It is an insurance contract the entity issues and no exclusion or option takes it out. Next, check whether any components must be separated.',
        refs: ['IFRS 17.3(a)'],
        next: { label: 'Separate the components', to: '/decide/separation' },
      },
      'in-reins': {
        kind: 'outcome',
        tone: 'in',
        title: 'IFRS 17 applies, as reinsurance held',
        text: 'Reinsurance contracts held are in scope and are measured separately from the underlying contracts they cover.',
        refs: ['IFRS 17.3(b)', 'IFRS 17.60–70A'],
        next: { label: 'Reinsurance contracts held', to: '/concept/reinsurance-held' },
      },
      'in-dpf': {
        kind: 'outcome',
        tone: 'in',
        title: 'IFRS 17 applies, with modifications',
        text: 'Investment contracts with discretionary participation features are in scope when the entity also issues insurance contracts. IFRS 17.71 modifies how the general requirements apply to them, because they transfer no significant insurance risk.',
        refs: ['IFRS 17.3(c)', 'IFRS 17.71'],
      },
      'out-not-insurance': {
        kind: 'outcome',
        tone: 'out',
        title: 'Not an IFRS 17 contract',
        text: 'Without significant insurance risk it is not an insurance contract. Apply the Standard that fits it, for example IFRS 9 for an investment contract or IFRS 15 for a service contract.',
        refs: ['IFRS 17 Appendix A', 'IFRS 17.3'],
      },
      'out-policyholder': {
        kind: 'outcome',
        tone: 'out',
        title: 'Out of scope: the entity is the policyholder',
        text: 'IFRS 17 does not apply to insurance contracts in which the entity is the policyholder, other than reinsurance contracts held.',
        refs: ['IFRS 17.7(g)'],
      },
      'out-excluded': {
        kind: 'outcome',
        tone: 'out',
        title: 'Out of scope: excluded by IFRS 17.7',
        text: 'Apply the Standard that IFRS 17.7 points to for that type of contract, for example IFRS 15 for a manufacturer’s warranty, IAS 19 for employee benefits, IFRS 3 for contingent consideration, or IFRS 9 for credit card contracts.',
        refs: ['IFRS 17.7'],
      },
      'out-guarantee': {
        kind: 'outcome',
        tone: 'out',
        title: 'Out of scope: apply IFRS 9',
        text: 'A financial guarantee contract is accounted for under IFRS 9, IAS 32 and IFRS 7 unless the issuer has previously asserted explicitly that it treats such contracts as insurance.',
        refs: ['IFRS 17.7(e)'],
      },
      'choice-guarantee': {
        kind: 'outcome',
        tone: 'choice',
        title: 'A choice: IFRS 17 or IFRS 9',
        text: 'The issuer may apply either IFRS 9, IAS 32 and IFRS 7, or IFRS 17. The choice is made contract by contract and is irrevocable.',
        refs: ['IFRS 17.7(e)'],
      },
      'choice-fixed-fee': {
        kind: 'outcome',
        tone: 'choice',
        title: 'A choice: IFRS 15 or IFRS 17',
        text: 'The entity may choose to apply IFRS 15 instead of IFRS 17 to these fixed-fee service contracts.',
        refs: ['IFRS 17.8'],
      },
      'choice-waiver': {
        kind: 'outcome',
        tone: 'choice',
        title: 'A choice: IFRS 17 or IFRS 9',
        text: 'The entity chooses to apply IFRS 9 or IFRS 17 to these contracts. The choice is made for each portfolio and is irrevocable.',
        refs: ['IFRS 17.8A'],
      },
    },
  },
  {
    id: 'separation',
    title: 'Which components are separated?',
    asks: 'Which parts of an insurance contract are accounted for under other Standards.',
    concept: 'insurance-contract',
    start: 'derivative',
    nodes: {
      derivative: {
        kind: 'question',
        text: 'Does the contract contain an embedded derivative that IFRS 9 requires to be separated from its host?',
        refs: ['IFRS 17.11(a)'],
        options: yesNo('investment', 'investment', {
          yes: 'Separate the embedded derivative and account for it under IFRS 9.',
          no: 'Nothing to separate for derivatives.',
        }),
      },
      investment: {
        kind: 'question',
        text: 'Does the contract contain a distinct investment component?',
        help: 'An investment component is an amount the contract requires the insurer to repay to the policyholder in all circumstances, whether or not an insured event occurs. It is distinct only if it is not highly interrelated with the insurance component and a contract with equivalent terms is sold, or could be sold, separately in the same market or jurisdiction.',
        refs: ['IFRS 17.11(b)', 'IFRS 17.B31–B32', 'IFRS 17 Appendix A'],
        options: yesNo('services', 'services', {
          yes: 'Separate the distinct investment component and account for it under IFRS 9, unless it is an investment contract with discretionary participation features within IFRS 17’s scope.',
          no: 'Any investment component that is not distinct stays in the insurance contract, but is excluded from insurance revenue and insurance service expenses.',
        }),
      },
      services: {
        kind: 'question',
        text: 'Does the contract promise distinct goods or services other than insurance contract services?',
        help: 'A good or service is distinct if the policyholder can benefit from it on its own or with other readily available resources. Activities the insurer must carry out to fulfil the contract, such as administration, are not a separate service.',
        refs: ['IFRS 17.12', 'IFRS 17.B33–B35'],
        options: yesNo('remaining', 'remaining', {
          yes: 'Separate the distinct goods or services and account for them under IFRS 15.',
          no: 'Nothing to separate for goods or services.',
        }),
      },
      remaining: {
        kind: 'outcome',
        tone: 'in',
        title: 'Apply IFRS 17 to everything that remains',
        text: 'Once the separations above are made, IFRS 17 applies to all remaining components of the host insurance contract.',
        refs: ['IFRS 17.13', 'IFRS 17.85'],
        next: { label: 'Check the contract boundary', to: '/decide/boundary' },
      },
    },
  },
  {
    id: 'boundary',
    title: 'Is this future cash flow inside the contract boundary?',
    asks: 'Whether a future premium, and the cover it pays for, belongs to today’s contract.',
    concept: 'contract-boundary',
    start: 'substantive',
    nodes: {
      substantive: {
        kind: 'question',
        text: 'For the period the cash flow relates to, can the insurer compel the policyholder to pay premiums, or does the insurer have a substantive obligation to provide insurance contract services?',
        refs: ['IFRS 17.34'],
        options: yesNo('individual', 'outside'),
      },
      individual: {
        kind: 'question',
        text: 'By then, will the insurer have the practical ability to reassess the risks of this particular policyholder and set a price or level of benefits that fully reflects those risks?',
        refs: ['IFRS 17.34(a)'],
        options: yesNo('outside-after', 'portfolio'),
      },
      portfolio: {
        kind: 'question',
        text: 'Will the insurer have the practical ability to reassess the risks of the portfolio that contains the contract and set a price or level of benefits that fully reflects the risk of that portfolio?',
        refs: ['IFRS 17.34(b)(i)'],
        options: yesNo('pricing', 'inside'),
      },
      pricing: {
        kind: 'question',
        text: 'Does the pricing of the premiums up to the reassessment date leave out the risks that relate to periods after that date?',
        help: 'If today’s premiums are set to cover risks beyond the repricing date, for example level premiums for rising mortality, this condition is not met.',
        refs: ['IFRS 17.34(b)(ii)'],
        options: yesNo('outside-after', 'inside'),
      },
      inside: {
        kind: 'outcome',
        tone: 'in',
        title: 'Inside the boundary',
        text: 'The cash flow belongs to the existing contract and is included in its fulfilment cash flows.',
        refs: ['IFRS 17.33', 'IFRS 17.34'],
      },
      'outside-after': {
        kind: 'outcome',
        tone: 'out',
        title: 'Outside the boundary from the reassessment date',
        text: 'The substantive obligation ends when the insurer can reprice. Cash flows after that date relate to future contracts and are not recognised as part of this one.',
        refs: ['IFRS 17.34', 'IFRS 17.35'],
      },
      outside: {
        kind: 'outcome',
        tone: 'out',
        title: 'Outside the boundary',
        text: 'There is no substantive right or obligation for that period, so the expected premiums and claims are not recognised as a liability or an asset; they relate to future contracts.',
        refs: ['IFRS 17.34', 'IFRS 17.35'],
      },
    },
  },
  {
    id: 'paa',
    title: 'Can the Premium Allocation Approach be used?',
    asks: 'Whether a group of insurance contracts issued is eligible for the optional PAA.',
    concept: 'paa',
    start: 'one-year',
    nodes: {
      'one-year': {
        kind: 'question',
        text: 'At the inception of the group, is the coverage period of each contract one year or less, counting the cover from all premiums within the contract boundary?',
        refs: ['IFRS 17.53(b)'],
        options: yesNo('eligible', 'similar'),
      },
      similar: {
        kind: 'question',
        text: 'At inception, does the insurer reasonably expect the PAA to measure the liability for remaining coverage in a way that would not differ materially from the General Measurement Model?',
        help: 'The Premium Allocation Lab compares the two for the same group.',
        refs: ['IFRS 17.53(a)'],
        options: yesNo('variability', 'not-eligible'),
      },
      variability: {
        kind: 'question',
        text: 'At inception, does the insurer expect significant variability in the fulfilment cash flows that would affect the liability for remaining coverage before a claim is incurred?',
        help: 'Variability tends to increase with the extent of cash flows from embedded derivatives and with the length of the coverage period.',
        refs: ['IFRS 17.54'],
        options: yesNo('not-eligible', 'eligible'),
      },
      eligible: {
        kind: 'outcome',
        tone: 'choice',
        title: 'Eligible for the PAA',
        text: 'The insurer may use the PAA for this group; it is an option, not a requirement. For reinsurance contracts held, the similar conditions in IFRS 17.69 apply instead.',
        refs: ['IFRS 17.53', 'IFRS 17.69'],
        next: { label: 'Try the PAA lab', to: '/lab/paa' },
      },
      'not-eligible': {
        kind: 'outcome',
        tone: 'out',
        title: 'Not eligible: use the General Measurement Model',
        text: 'The group is measured under the General Measurement Model, or under the Variable Fee Approach if the contracts have direct participation features.',
        refs: ['IFRS 17.53', 'IFRS 17.54'],
        next: { label: 'Test for direct participation features', to: '/decide/vfa' },
      },
    },
  },
  {
    id: 'vfa',
    title: 'Does the Variable Fee Approach apply?',
    asks: 'Whether contracts have direct participation features and must be measured with the VFA.',
    concept: 'vfa',
    start: 'reinsurance',
    nodes: {
      reinsurance: {
        kind: 'question',
        text: 'Is it a reinsurance contract, issued or held?',
        refs: ['IFRS 17.B109'],
        options: yesNo('no-reins', 'pool'),
      },
      pool: {
        kind: 'question',
        text: 'Do the contractual terms specify that the policyholder participates in a share of a clearly identified pool of underlying items?',
        help: 'The assessment is made at inception of the contract and is not repeated later unless the contract is modified.',
        refs: ['IFRS 17.B101(a)', 'IFRS 17.B102'],
        options: yesNo('share', 'no-vfa'),
      },
      share: {
        kind: 'question',
        text: 'Does the insurer expect to pay the policyholder an amount equal to a substantial share of the fair value returns on the underlying items?',
        refs: ['IFRS 17.B101(b)'],
        options: yesNo('vary', 'no-vfa'),
      },
      vary: {
        kind: 'question',
        text: 'Does the insurer expect a substantial proportion of any change in the amounts paid to the policyholder to vary with the change in fair value of the underlying items?',
        refs: ['IFRS 17.B101(c)'],
        options: yesNo('vfa', 'no-vfa'),
      },
      vfa: {
        kind: 'outcome',
        tone: 'in',
        title: 'Direct participation features: use the VFA',
        text: 'All three conditions are met, so these are insurance contracts with direct participation features. The VFA is required for them, not optional: the insurer’s share of changes in the underlying items adjusts the CSM.',
        refs: ['IFRS 17.45', 'IFRS 17.B101–B118'],
        next: { label: 'Variable Fee Approach', to: '/concept/vfa' },
      },
      'no-vfa': {
        kind: 'outcome',
        tone: 'out',
        title: 'No direct participation features',
        text: 'Measure the group under the General Measurement Model, or the PAA if it is eligible. Contracts that share in returns without meeting all three conditions, often called indirect participating contracts, are measured under the General Measurement Model.',
        refs: ['IFRS 17.B101'],
        next: { label: 'Check PAA eligibility', to: '/decide/paa' },
      },
      'no-reins': {
        kind: 'outcome',
        tone: 'out',
        title: 'The VFA is not available for reinsurance',
        text: 'Reinsurance contracts issued and reinsurance contracts held cannot be insurance contracts with direct participation features.',
        refs: ['IFRS 17.B109'],
      },
    },
  },
  {
    id: 'grouping',
    title: 'Which profitability group does a contract join?',
    asks: 'How contracts issued are split into groups by expected profitability at initial recognition.',
    concept: 'level-of-aggregation',
    start: 'model',
    nodes: {
      model: {
        kind: 'question',
        text: 'Is the group measured using the Premium Allocation Approach?',
        refs: ['IFRS 17.18', 'IFRS 17.19'],
        options: yesNo('paa-facts', 'gmm-onerous'),
      },
      'paa-facts': {
        kind: 'question',
        text: 'Do facts and circumstances indicate that the contracts are onerous at initial recognition?',
        help: 'Under the PAA the insurer assumes no contracts in the portfolio are onerous unless facts and circumstances indicate otherwise.',
        refs: ['IFRS 17.18'],
        options: yesNo('onerous', 'paa-change'),
      },
      'paa-change': {
        kind: 'question',
        text: 'Judging the likelihood of changes in applicable facts and circumstances, is there no significant possibility that the contracts become onerous later?',
        refs: ['IFRS 17.18'],
        options: yesNo('low-risk', 'remaining'),
      },
      'gmm-onerous': {
        kind: 'question',
        text: 'At initial recognition, do the fulfilment cash flows, any previously recognised acquisition cash flows and any cash flows arising at that date add up to a net outflow?',
        refs: ['IFRS 17.47'],
        options: yesNo('onerous', 'gmm-change'),
      },
      'gmm-change': {
        kind: 'question',
        text: 'Based on the likelihood of changes in assumptions that would make them onerous, and using the estimates in the insurer’s internal reporting, is there no significant possibility that the contracts become onerous later?',
        help: 'The insurer must not ignore what its internal reporting shows, but does not have to gather extra information beyond it.',
        refs: ['IFRS 17.19'],
        options: yesNo('low-risk', 'remaining'),
      },
      onerous: {
        kind: 'outcome',
        tone: 'out',
        title: 'Group of onerous contracts',
        text: 'The contracts go into a group of contracts that are onerous at initial recognition. The loss is recognised in profit or loss immediately and a loss component is set up.',
        refs: ['IFRS 17.16(a)', 'IFRS 17.47', 'IFRS 17.57–58'],
        next: { label: 'Onerous contracts', to: '/concept/onerous-contracts' },
      },
      'low-risk': {
        kind: 'outcome',
        tone: 'in',
        title: 'Group with no significant possibility of becoming onerous',
        text: 'The contracts go into the group of contracts that have no significant possibility of becoming onerous. Groups also cannot include contracts issued more than one year apart.',
        refs: ['IFRS 17.16(b)', 'IFRS 17.22'],
      },
      remaining: {
        kind: 'outcome',
        tone: 'choice',
        title: 'Group of the remaining contracts',
        text: 'The contracts go into the group of remaining contracts in the portfolio. Groups also cannot include contracts issued more than one year apart.',
        refs: ['IFRS 17.16(c)', 'IFRS 17.22'],
      },
    },
  },
]

export const TREE_BY_ID: Record<string, DecisionTree> = Object.fromEntries(DECISION_TREES.map((t) => [t.id, t]))
export const TREES_BY_CONCEPT: Record<string, DecisionTree[]> = {}
for (const t of DECISION_TREES) (TREES_BY_CONCEPT[t.concept] ??= []).push(t)
