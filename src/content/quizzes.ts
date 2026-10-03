import type { QuizQuestion } from './types'

/**
 * Knowledge checks keyed by concept id. Numbers in scenarios are illustrative and,
 * unless stated, ignore discounting and the risk adjustment to keep the arithmetic clear.
 */
export const QUIZZES: Record<string, QuizQuestion[]> = {
  'what-is-ifrs': [
    {
      q: 'A preparer finds that no IFRS Accounting Standard specifically applies to an unusual transaction. What does IAS 8 require?',
      options: [
        'Apply the treatment from any local GAAP the entity prefers, without further analysis',
        'Expense the transaction, because there is no Standard permitting recognition',
        'Develop a policy giving relevant and reliable information, considering first Standards dealing with similar issues and then the Conceptual Framework',
        'Defer accounting for it until the IASB issues guidance',
      ],
      answer: 2,
      why: 'IAS 8.10–8.11 set the hierarchy: judgement to give relevant and reliable information, referring to requirements in Standards dealing with similar and related issues, then to the definitions and concepts in the [[conceptual-framework|Conceptual Framework]].',
    },
    {
      q: 'Why might an EU-listed insurer group its contracts differently from a non-EU insurer applying the IASB version of IFRS 17?',
      options: [
        'The EU endorsed IFRS 17 with an optional exemption from the annual cohort requirement for certain contracts',
        'The EU wrote its own insurance standard that replaces IFRS 17',
        'The EU prohibits the contractual service margin',
        'The EU requires every insurer to use the PAA',
      ],
      answer: 0,
      why: 'Local endorsement can include carve-outs. The EU adopted IFRS 17 with an optional exemption from the annual cohort requirement in IFRS 17.22 for intergenerationally-mutualised and cash-flow-matched contracts. See [[level-of-aggregation]].',
    },
    {
      q: 'Who issues IFRS Accounting Standards, and through what kind of process?',
      options: [
        'National regulators, each publishing its own version',
        'The IASB, through a public due-process cycle of discussion papers, exposure drafts and final Standards',
        'The large audit firms, by agreeing common interpretations',
        'IOSCO, as part of securities regulation',
      ],
      answer: 1,
      why: 'IFRS Accounting Standards are issued by the International Accounting Standards Board after public due process, overseen by the IFRS Foundation. Jurisdictions then require or permit them. See [[iasb|IASB]].',
    },
  ],

  'double-entry': [
    {
      q: 'An insurer receives a premium of 1,000 in cash at the start of a one-year policy. Which entry records the receipt under IFRS 17?',
      options: [
        'Debit Cash 1,000, credit Insurance revenue 1,000',
        'Debit Insurance revenue 1,000, credit Cash 1,000',
        'Debit Cash 1,000, credit Insurance contract liability (LRC) 1,000',
        'Debit LRC 1,000, credit Cash 1,000',
      ],
      answer: 2,
      why: 'Premiums received increase the [[lrc|liability for remaining coverage]]. Revenue is recognised later as cover is provided, by debiting the LRC (IFRS 17.83, B120–B124).',
    },
    {
      q: 'A claim of 300 was expensed and recorded in the LIC last month. It is now paid. Which entry records the payment?',
      options: [
        'Debit Insurance service expenses 300, credit Cash 300',
        'Debit LIC 300, credit Cash 300',
        'Debit Cash 300, credit LIC 300',
        'Debit LIC 300, credit Insurance service expenses 300',
      ],
      answer: 1,
      why: 'The expense was recognised when the claim was incurred (debit insurance service expenses, credit LIC). Payment settles the liability: the LIC decreases with a debit and cash decreases with a credit. See [[lic]].',
    },
    {
      q: 'Which of these balances increases with a credit entry?',
      options: [
        'Insurance contract liabilities',
        'Cash at bank',
        'Claims expense',
        'Investments in bonds',
      ],
      answer: 0,
      why: 'Liabilities, equity and income increase with credits; assets and expenses increase with debits (Conceptual Framework 4.26 defines a liability). See [[debit-credit|debit and credit]].',
    },
  ],

  'ifrs17-why': [
    {
      q: 'What was the main problem IFRS 17 was designed to solve?',
      options: [
        'IFRS 4 let insurers continue diverse local practices, so similar contracts were reported differently and were hard to compare',
        'Insurers had no way to recognise investment income',
        'IFRS 4 required all contracts to be measured at fair value, causing volatility',
        'Insurers could not present a balance sheet under IFRS 4',
      ],
      answer: 0,
      why: 'IFRS 4 was an interim standard that largely grandfathered existing practices. IFRS 17 introduced one consistent measurement model (IFRS 17.1, IN4–IN8).',
    },
    {
      q: 'Which of these is a change IFRS 17 made compared with typical IFRS 4 practice?',
      options: [
        'Insurance revenue equals premiums written in the period',
        'Assumptions are locked at inception and never updated',
        'Expected profit is recognised in full when a contract is sold',
        'Investment components are excluded from insurance revenue and insurance service expenses',
      ],
      answer: 3,
      why: 'IFRS 17.85 excludes investment components from revenue and service expenses. Estimates are current (IFRS 17.33) and unearned profit is deferred in the [[csm|CSM]] (IFRS 17.38).',
    },
    {
      q: 'A newly recognised group of contracts is expected to make a loss. How does IFRS 17 treat that expected loss?',
      options: [
        'It is spread over the coverage period, like profit',
        'It is deferred until the related claims are paid',
        'It is recognised in profit or loss immediately',
        'It is recognised in other comprehensive income',
      ],
      answer: 2,
      why: 'Profits are deferred but losses are recognised immediately in insurance service expenses (IFRS 17.47). See [[onerous-contracts]].',
    },
  ],

  'insurance-contract': [
    {
      q: 'A savings policy pays the account balance on surrender or maturity. On death it pays the account balance plus a fixed 50, on balances of around 100,000. It has no other features. How is it most likely accounted for?',
      options: [
        'As an insurance contract under IFRS 17, because it pays on death',
        'As an investment contract under IFRS 9, because the additional death benefit is not significant insurance risk',
        'As an insurance contract, because it is legally called a policy',
        'Under IFRS 15, as a service contract',
      ],
      answer: 1,
      why: 'Insurance risk is significant only if an insured event could cause the issuer to pay significant additional amounts in a scenario with commercial substance (IFRS 17.B18). An extra 50 on 100,000 is not significant, and with no discretionary participation features the contract is in IFRS 9 scope.',
    },
    {
      q: 'An insurance contract contains an embedded derivative that is not closely related to the host and would not itself be an insurance contract. What does IFRS 17 require?',
      options: [
        'Separate it and account for it under IFRS 9',
        'Measure the whole contract under IFRS 17 without separation',
        'Account for the derivative under IFRS 15',
        'Ignore it, because derivatives are outside IFRS 17',
      ],
      answer: 0,
      why: 'IFRS 17.11(a) requires the entity to apply IFRS 9 to determine whether an embedded derivative must be separated and, if so, how to account for it.',
    },
    {
      q: 'Which of these is outside the scope of IFRS 17?',
      options: [
        'A term life policy issued by an insurer',
        'A reinsurance contract held by an insurer',
        'A one-year motor policy',
        'A product warranty issued by a manufacturer for goods it sells',
      ],
      answer: 3,
      why: 'IFRS 17.7(a) excludes warranties provided by a manufacturer, dealer or retailer in connection with the sale of its goods or services. [[reinsurance-held|Reinsurance contracts held]] are in scope (IFRS 17.3(b)).',
    },
  ],

  'level-of-aggregation': [
    {
      q: 'Two motor contracts in the same portfolio are issued 18 months apart. The entity does not apply the EU exemption. Can they be in the same group?',
      options: [
        'Yes, because they are in the same portfolio',
        'No, because a group may not include contracts issued more than one year apart',
        'Yes, provided both are profitable',
        'Only if the entity applies the PAA',
      ],
      answer: 1,
      why: 'IFRS 17.22 prohibits including contracts issued more than one year apart in the same group. See [[annual-cohort|annual cohort]].',
    },
    {
      q: 'At initial recognition a contract was placed in the group with no significant possibility of becoming onerous. Two years later expectations worsen. What happens to its group membership?',
      options: [
        'It moves to the onerous group',
        'The group is split into two new groups',
        'Nothing: groups are established at initial recognition and not reassessed',
        'It moves to the remaining group',
      ],
      answer: 2,
      why: 'IFRS 17.24 requires groups to be established at initial recognition and not reassessed subsequently. The deterioration is reflected in the measurement of the existing group, possibly creating a [[loss-component|loss component]].',
    },
    {
      q: 'Why does IFRS 17 require onerous contracts to be grouped separately from profitable ones?',
      options: [
        'To align the groups with tax returns',
        'To reduce the number of groups an insurer has to measure',
        'Because Solvency II requires the same split',
        'So that losses on onerous contracts are not offset by profits on other contracts',
      ],
      answer: 3,
      why: 'IFRS 17.16 requires portfolios to be divided by profitability at initial recognition so that losses are recognised promptly rather than absorbed by the CSM of profitable contracts.',
    },
  ],

  gmm: [
    {
      q: 'At initial recognition a group has PV of future inflows 1,000, PV of future outflows 850 and a risk adjustment of 50. There are no pre-recognition cash flows. What is the CSM?',
      options: ['150', '100', '50', '0'],
      answer: 1,
      why: 'Fulfilment cash flows = 850 − 1,000 + 50 = −100, a net inflow. The CSM is set equal and opposite, 100, so no gain arises on day one (IFRS 17.38).',
    },
    {
      q: 'At initial recognition a group has PV of future inflows 1,000, PV of future outflows 980 and a risk adjustment of 40. What is recognised?',
      options: [
        'A CSM of 20',
        'A CSM of −20',
        'A loss of 60',
        'A loss of 20 in profit or loss, with a CSM of zero',
      ],
      answer: 3,
      why: 'Fulfilment cash flows = 980 − 1,000 + 40 = 20, a net outflow, so the group is onerous. The 20 is a loss in profit or loss and the CSM is zero; the CSM cannot be negative (IFRS 17.47).',
    },
    {
      q: 'A unit-linked contract meets the criteria for direct participation features at inception. Which measurement model applies?',
      options: [
        'The Variable Fee Approach, which is mandatory for such contracts',
        'The unmodified General Measurement Model',
        'The PAA, which is mandatory for savings products',
        'IFRS 9, because the contract is unit-linked',
      ],
      answer: 0,
      why: 'Contracts meeting IFRS 17.B101 are direct participating contracts measured using the modified GMM known as the [[vfa|VFA]] (IFRS 17.45). It is not a choice.',
    },
  ],

  'fulfilment-cash-flows': [
    {
      q: 'Claims for a group are expected to be 100 with probability 70% and 400 with probability 30%. Ignoring discounting and the risk adjustment, what estimate enters the fulfilment cash flows?',
      options: ['100', '250', '400', '190'],
      answer: 3,
      why: 'Fulfilment cash flows use the probability-weighted mean: 0.7 × 100 + 0.3 × 400 = 190, not the most likely outcome (IFRS 17.33(a), B37–B38).',
    },
    {
      q: 'Under the GMM, assumptions about future claims on a group improve. The change relates to future service and the group is not onerous. Where does the effect go?',
      options: [
        'Profit or loss immediately',
        'It adjusts the CSM',
        'Other comprehensive income',
        'The liability for incurred claims',
      ],
      answer: 1,
      why: 'Changes in fulfilment cash flows relating to future service adjust the [[csm|CSM]] (IFRS 17.44(c), B96).',
    },
    {
      q: 'Which of these cash flows is excluded from the fulfilment cash flows?',
      options: [
        'Claims handling costs',
        'Premiums within the contract boundary',
        'Income tax the insurer pays on its own profits',
        'Insurance acquisition cash flows attributable to the portfolio',
      ],
      answer: 2,
      why: 'IFRS 17.B65 lists cash flows within the boundary, including claims handling and acquisition costs. Income tax payments the entity does not make in a fiduciary capacity are excluded (IFRS 17.B66(f)).',
    },
  ],

  discounting: [
    {
      q: 'A claim of 1,100 is expected to be paid in exactly one year. The discount rate is 10%. What is its present value?',
      options: ['1,100', '1,000', '990', '1,210'],
      answer: 1,
      why: 'PV = 1,100 ÷ 1.10 = 1,000 (IFRS 17.36). See [[present-value|present value]].',
    },
    {
      q: 'For a GMM group, which rate is used to accrete interest on the CSM?',
      options: [
        'The current discount rate at the reporting date',
        'The yield on the assets the insurer holds',
        'The discount rate determined at initial recognition of the group (locked-in rate)',
        'The insurer’s cost of capital',
      ],
      answer: 2,
      why: 'Interest on the CSM is accreted using the discount rates determined at initial recognition (IFRS 17.44(b), B72(b)). See [[locked-in-rate|locked-in rate]].',
    },
    {
      q: 'Under the top-down approach to discount rates, what is the starting point?',
      options: [
        'A liquid risk-free yield curve, to which an illiquidity premium is added',
        'The insurer’s own borrowing rate',
        'A rate fixed by the insurance regulator',
        'The yield on a reference portfolio of assets, adjusted to remove factors not relevant to the insurance contracts such as credit risk',
      ],
      answer: 3,
      why: 'IFRS 17.B81 describes the top-down approach based on a reference portfolio yield, with adjustments such as expected and unexpected credit losses. The first option describes the bottom-up approach (IFRS 17.B80).',
    },
  ],

  'risk-adjustment': [
    {
      q: 'What does the risk adjustment compensate the insurer for?',
      options: [
        'Uncertainty in the amount and timing of cash flows from non-financial risk',
        'Interest rate and other financial risk',
        'General operational risk not arising from the contracts',
        'The profit margin the insurer targets on the contracts',
      ],
      answer: 0,
      why: 'IFRS 17.37 and B86–B89: the risk adjustment reflects non-financial risk, such as insurance, lapse and expense risk. It excludes financial risk and risks not arising from the contracts, such as general operational risk (B89).',
    },
    {
      q: 'An insurer measures its risk adjustment using a cost-of-capital technique. What must it disclose?',
      options: [
        'Nothing beyond the technique’s name',
        'Its Solvency II capital requirement',
        'The confidence level that corresponds to the result of the technique',
        'A reconciliation to the CSM',
      ],
      answer: 2,
      why: 'If a technique other than confidence level is used, the entity discloses the technique and the confidence level corresponding to its results (IFRS 17.119).',
    },
    {
      q: 'All else being equal, which group should carry the higher risk adjustment relative to its expected claims?',
      options: [
        'A group of high-frequency, low-severity claims',
        'A group of low-frequency, high-severity catastrophe exposures',
        'A group with a shorter duration',
        'A group where emerging experience has reduced uncertainty',
      ],
      answer: 1,
      why: 'IFRS 17.B91 lists characteristics: low-frequency, high-severity risks, longer duration, wider distributions and less known about the estimate all lead to a higher risk adjustment.',
    },
  ],

  csm: [
    {
      q: 'A GMM group has an opening CSM of 500. Interest at the locked-in rate of 5% is 25. A favourable change relating to future service adds 45. Coverage units are 1 this period and 4 in total for this and future periods. What CSM is released this period?',
      options: ['125', '131.25', '142.5', '150'],
      answer: 2,
      why: 'The release is applied to the CSM after all other adjustments: (500 + 25 + 45) × 1 ÷ 4 = 142.5 (IFRS 17.44, B119). Releasing before the adjustments gives the wrong answers 125 or 131.25.',
    },
    {
      q: 'A group has a CSM of 200. An unfavourable change in estimates relating to future service of 300 occurs. What is the result?',
      options: [
        'CSM falls to zero and a loss of 100 is recognised, creating a loss component',
        'CSM becomes −100',
        'CSM falls to zero and a loss of 300 is recognised',
        'CSM is unchanged and 300 goes to OCI',
      ],
      answer: 0,
      why: 'The CSM absorbs unfavourable changes until it reaches zero; the excess of 100 is a loss in profit or loss and a [[loss-component|loss component]] is established (IFRS 17.44(c), 48).',
    },
    {
      q: 'Actual claims incurred in the current period exceed expected claims by 30. Under the GMM, how is the difference treated?',
      options: [
        'It adjusts the CSM',
        'It is recognised in the insurance service result in profit or loss',
        'It is recognised in OCI',
        'It is spread over the remaining coverage period',
      ],
      answer: 1,
      why: 'Differences between expected and actual claims for the current period are [[experience-adjustment|experience adjustments]] relating to current service. They do not adjust the CSM (IFRS 17.B96–B97).',
    },
  ],

  'coverage-units': [
    {
      q: 'A group’s CSM before release is 400. Coverage units are 50 this period and 30 and 20 in the two future periods. What is the release this period?',
      options: ['133.33', '400', '80', '200'],
      answer: 3,
      why: 'Release = 400 × 50 ÷ (50 + 30 + 20) = 200. The CSM is allocated equally to each coverage unit provided now and expected in future (IFRS 17.B119(b)).',
    },
    {
      q: 'What determines the number of coverage units in a group?',
      options: [
        'The quantity of benefits provided and the expected coverage period of the contracts',
        'The premiums received in each period',
        'The claims paid in each period',
        'The acquisition cash flows paid',
      ],
      answer: 0,
      why: 'IFRS 17.B119(a): coverage units reflect the quantity of benefits provided under a contract and its expected coverage period.',
    },
    {
      q: 'Lapses are higher than expected, so expected future coverage units fall while current-period units are unchanged. All else equal, what happens to the proportion of the CSM released this period?',
      options: [
        'It falls',
        'It is unchanged',
        'It rises',
        'The CSM is reversed in full',
      ],
      answer: 2,
      why: 'The release ratio is current units ÷ (current + future units). Fewer future units means a larger share of the remaining CSM is released now (IFRS 17.B119).',
    },
  ],

  lrc: [
    {
      q: 'Under the GMM, what does the liability for remaining coverage comprise?',
      options: [
        'Only the unearned premium',
        'The fulfilment cash flows relating to future service plus the CSM',
        'Claims incurred but not reported',
        'Only the CSM',
      ],
      answer: 1,
      why: 'IFRS 17.40(a): the LRC comprises the fulfilment cash flows related to future service and the CSM at that date.',
    },
    {
      q: 'Under the PAA, a premium of 1,200 is received at the start of 12 months’ cover. Acquisition costs are expensed as incurred and cover is provided evenly. Ignoring discounting, what is the LRC after three months?',
      options: ['1,200', '300', '900', '0'],
      answer: 2,
      why: 'The PAA LRC is premiums received less amounts recognised as revenue: 1,200 − 3/12 × 1,200 = 900 (IFRS 17.55, B126). See [[paa]].',
    },
    {
      q: 'An insured event occurs on a GMM contract. To which balance does the obligation to pay that claim belong?',
      options: [
        'The liability for remaining coverage',
        'The CSM',
        'The loss component',
        'The liability for incurred claims',
      ],
      answer: 3,
      why: 'The obligation to pay for insured events that have already occurred is the [[lic|LIC]] (IFRS 17.40(b)).',
    },
  ],

  lic: [
    {
      q: 'Which of these is included in the liability for incurred claims?',
      options: [
        'The CSM for remaining cover',
        'Claims incurred but not yet reported',
        'Premiums expected in future periods',
        'Unearned premium',
      ],
      answer: 1,
      why: 'The LIC covers the obligation for insured events that have already occurred, including claims not yet reported (IFRS 17 Appendix A, IFRS 17.40(b)).',
    },
    {
      q: 'The estimate of claims incurred in prior years increases by 80. Under the GMM, where is this recognised?',
      options: [
        'In insurance service expenses in profit or loss',
        'As an adjustment to the CSM',
        'In other comprehensive income',
        'Nowhere until the claims are paid',
      ],
      answer: 0,
      why: 'Changes in estimates of fulfilment cash flows in the LIC relate to past service and do not adjust the CSM (IFRS 17.B97). They are part of insurance service expenses.',
    },
    {
      q: 'Under the PAA, when may an insurer choose not to discount the LIC?',
      options: [
        'Never; the LIC must always be discounted',
        'When the coverage period is one year or less',
        'When claims are expected to be paid within one year of being incurred',
        'When interest rates are below 1%',
      ],
      answer: 2,
      why: 'IFRS 17.59(b) allows the LIC not to be adjusted for the time value of money if the cash flows are expected to be paid or received within one year of the claims being incurred.',
    },
  ],

  'onerous-contracts': [
    {
      q: 'At initial recognition a group has PV of future inflows 900, PV of future outflows 920 and a risk adjustment of 30. What is recognised?',
      options: [
        'A loss of 20, because the risk adjustment is ignored for the onerous test',
        'A CSM of 50',
        'A loss of 50 and a CSM of zero',
        'Nothing until claims are incurred',
      ],
      answer: 2,
      why: 'Fulfilment cash flows include the risk adjustment: 920 − 900 + 30 = 50 net outflow, recognised as a loss immediately (IFRS 17.47).',
    },
    {
      q: 'A group has a loss component of 40 and no CSM. A favourable change relating to future service of 60 occurs. What is the result?',
      options: [
        'A CSM of 60 is established',
        'The loss component is reversed by 40 through profit or loss and a CSM of 20 is established',
        'The loss component is reversed by 40 and 20 is recognised as further income',
        'No change until the coverage period ends',
      ],
      answer: 1,
      why: 'Favourable changes are allocated first to the loss component, reversing it through profit or loss, and only the excess rebuilds the CSM (IFRS 17.50(b)).',
    },
    {
      q: 'Where is the loss on initial recognition of an onerous group presented?',
      options: [
        'As a reduction of insurance revenue',
        'In insurance finance income or expenses',
        'In other comprehensive income',
        'In insurance service expenses',
      ],
      answer: 3,
      why: 'IFRS 17.47 requires the loss to be recognised in profit or loss, and IFRS 17.84 and 103(b) include losses on onerous groups and their reversals in insurance service expenses.',
    },
  ],

  'loss-component': [
    {
      q: 'Why does IFRS 17 require a loss component to be tracked?',
      options: [
        'So that losses already recognised are not counted again in revenue and expenses when the related claims occur',
        'To defer the loss over the coverage period',
        'To calculate the risk adjustment',
        'Because the loss component is paid to policyholders',
      ],
      answer: 0,
      why: 'Amounts allocated to the loss component are excluded from insurance revenue and reduce service expenses, so the day-one loss is not recognised twice (IFRS 17.49–51).',
    },
    {
      q: 'A loss component of 30 sits within an LRC whose PV of future outflows plus risk adjustment is 300 at the start of the period. The entity allocates using this ratio. Expected claims of 100 are released in the period. How much of that release is included in insurance revenue?',
      options: ['100', '70', '10', '90'],
      answer: 3,
      why: 'The ratio is 30 ÷ 300 = 10%. 10 of the release is allocated to the loss component and excluded from revenue; 90 is included (IFRS 17.50(a), 51, B124(a)).',
    },
    {
      q: 'What must the loss component balance be at the end of a group’s coverage period?',
      options: [
        'Equal to the original day-one loss',
        'Zero',
        'Equal to the remaining LIC',
        'Transferred to the CSM',
      ],
      answer: 1,
      why: 'The systematic allocation must result in the total amounts allocated to the loss component being zero by the end of the coverage period (IFRS 17.52).',
    },
  ],

  'insurance-revenue': [
    {
      q: 'For a GMM group in a period: expected claims and expenses 600, risk adjustment released for risk expired 40, CSM released 150, allocation of premiums for acquisition cash flow recovery 50. There are no investment components, experience adjustments or loss components. What is insurance revenue?',
      options: ['840', '790', '750', '600'],
      answer: 0,
      why: 'Revenue = 600 + 40 + 150 + 50 = 840 (IFRS 17.B124–B125). Leaving out the acquisition cash flow allocation gives 790.',
    },
    {
      q: 'A contract’s premiums include 400 that will be repaid to the policyholder in all circumstances. How is the 400 treated?',
      options: [
        'Included in revenue when received and in claims when repaid',
        'Excluded from both insurance revenue and insurance service expenses',
        'Included in revenue only',
        'Recognised in OCI',
      ],
      answer: 1,
      why: 'Amounts repaid in all circumstances are an [[investment-component|investment component]], excluded from insurance revenue and insurance service expenses (IFRS 17.85).',
    },
    {
      q: 'Which of these is not a component of insurance revenue under the GMM?',
      options: [
        'The CSM recognised for services provided',
        'The change in the risk adjustment for risk expired',
        'Expected insurance service expenses for the period',
        'Premiums received in the period',
      ],
      answer: 3,
      why: 'Revenue reflects services provided, built from changes in the LRC (IFRS 17.B124). Premiums received increase the LRC; they are not revenue in themselves.',
    },
  ],

  paa: [
    {
      q: 'An insurer issues contracts with a three-year coverage period. When may it apply the PAA?',
      options: [
        'Always, as the PAA is a free choice',
        'Never, as only one-year contracts are eligible',
        'Only if it reasonably expects the PAA LRC not to differ materially from the GMM',
        'Only for reinsurance contracts held',
      ],
      answer: 2,
      why: 'IFRS 17.53: the PAA is available if each contract has a coverage period of one year or less, or if the entity reasonably expects the PAA to give a measurement of the LRC not materially different from the GMM.',
    },
    {
      q: 'A PAA group contains 12-month policies. How may commissions paid to brokers be treated?',
      options: [
        'They may be recognised as an expense when incurred, as an accounting policy choice',
        'They must be capitalised and amortised over five years',
        'They must adjust the CSM',
        'They must be recognised in OCI',
      ],
      answer: 0,
      why: 'IFRS 17.59(a) allows insurance acquisition cash flows to be expensed when incurred if each contract’s coverage period is one year or less. There is no CSM under the PAA.',
    },
    {
      q: 'Under the PAA, facts and circumstances indicate that a group is onerous. What must the insurer do?',
      options: [
        'Nothing, as the PAA has no onerous test',
        'Switch the group to the GMM permanently',
        'Recognise the expected loss in OCI',
        'Compare the PAA LRC with the fulfilment cash flows for the remaining coverage and recognise any excess as a loss',
      ],
      answer: 3,
      why: 'IFRS 17.57–58: the entity assumes no contracts are onerous unless facts and circumstances indicate otherwise; if they do, the excess of the fulfilment cash flows over the PAA LRC is recognised as a loss. See [[onerous-contracts]].',
    },
  ],

  'reinsurance-held': [
    {
      q: 'An insurer buys a quota share treaty. At initial recognition the expected recoveries are worth less than the reinsurance premiums: a net cost of 30. The cost does not relate to events before the purchase. How is it recognised?',
      options: [
        'As an expense immediately',
        'As a reduction of insurance revenue',
        'As the CSM of the reinsurance group, recognised as cover is received',
        'As a reduction of the CSM of the underlying contracts',
      ],
      answer: 2,
      why: 'IFRS 17.65 requires the net cost or net gain of purchasing reinsurance to be recognised as a CSM. Only a net cost relating to events before the purchase is expensed immediately (IFRS 17.65A).',
    },
    {
      q: 'An insurer recognises a loss of 200 on initial recognition of an onerous group. A quota share entered into earlier covers 25% of the claims on that group. What loss-recovery income is recognised?',
      options: ['0', '50', '200', '150'],
      answer: 1,
      why: 'IFRS 17.66A–66B: income equals the loss on the underlying contracts multiplied by the percentage of claims expected to be recovered, 200 × 25% = 50, with a matching adjustment to the reinsurance CSM. See [[loss-recovery-component|loss-recovery component]].',
    },
    {
      q: 'How may an insurer present the effect of reinsurance held in profit or loss?',
      options: [
        'As a single net amount, or as amounts recovered and an allocation of premiums paid, separately from insurance contracts issued',
        'By deducting reinsurance premiums from insurance revenue',
        'Within insurance finance income or expenses only',
        'Netted against the underlying insurance service expenses',
      ],
      answer: 0,
      why: 'IFRS 17.82 requires separate presentation from contracts issued, and IFRS 17.86 permits a single net amount or separate amounts, but the allocation of premiums paid must not be presented as a reduction of insurance revenue.',
    },
  ],

  'tagetik-overview': [
    {
      q: 'Which sequence matches the end-to-end IFRS 17 chain in an implementation?',
      options: [
        'Reporting, then calculation, then data, then accounting',
        'Accounting, then data, then calculation, then reporting',
        'Calculation, then reporting, then data, then accounting',
        'Data, then calculation, then accounting, then reporting, with control throughout',
      ],
      answer: 3,
      why: 'Data is validated before measurement; measurement results become journals; reporting reads the stored results; workflow and audit trail span the chain. Disclosures depend on stored movements (IFRS 17.98).',
    },
    {
      q: 'Where should a portfolio’s measurement model (GMM, PAA or VFA) be held in a well-designed implementation?',
      options: [
        'Hard-coded in each calculation rule',
        'As governed master data that drives which calculation path a group follows',
        'In the chart of accounts',
        'In report layouts',
      ],
      answer: 1,
      why: 'The measurement model is a policy decision per portfolio (IFRS 17.29, 45, 53). Holding it as governed configuration keeps policy separate from logic. See [[insurance-contract]].',
    },
    {
      q: 'A finance team changes its coverage unit definition for one portfolio. In a well-designed implementation, what is the expected impact?',
      options: [
        'A new input or configuration for that portfolio, followed by rerunning the test suite',
        'A rebuild of the journal engine',
        'A redesign of the chart of accounts',
        'No change, because coverage units do not affect results',
      ],
      answer: 0,
      why: 'Coverage units drive the CSM release (IFRS 17.B119) and are an input per group. Changing them should be a configuration or data change, validated by the test suite. See [[tagetik-testing]].',
    },
  ],

  'tagetik-journals': [
    {
      q: 'The calculation reports a CSM release of 180 for a group. Which journal does the accounting engine generate?',
      options: [
        'Debit Insurance revenue 180, credit LRC 180',
        'Debit Cash 180, credit Insurance revenue 180',
        'Debit LRC 180, credit Insurance revenue 180',
        'Debit Insurance service expenses 180, credit LIC 180',
      ],
      answer: 2,
      why: 'Releasing the CSM reduces the liability (debit LRC) and recognises revenue for services provided (credit insurance revenue) (IFRS 17.44(e), B124(c)).',
    },
    {
      q: 'Interest is accreted on the LIC for the period. Which entry is generated?',
      options: [
        'Debit Insurance service expenses, credit LIC',
        'Debit Insurance finance expenses, credit LIC',
        'Debit LIC, credit Insurance finance income',
        'Debit Cash, credit LIC',
      ],
      answer: 1,
      why: 'The unwind of discount on insurance liabilities is an [[insurance-finance|insurance finance expense]] (IFRS 17.87), increasing the liability.',
    },
    {
      q: 'Why should every journal posted from the IFRS 17 subledger carry the calculation run identifier?',
      options: [
        'To enable drill-back from the ledger to the calculation that produced the entry',
        'Because the general ledger requires it to balance',
        'To determine the posting date',
        'It is not needed once journals balance',
      ],
      answer: 0,
      why: 'Traceability from reported numbers to calculations is the audit trail that supports the significant judgement disclosures and audit testing of estimates (IFRS 17.117). See [[operating-ifrs17]].',
    },
  ],
}
