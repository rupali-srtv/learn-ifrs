import type { Concept } from './types'

export const FOUNDATIONS: Concept[] = [
  {
    id: 'what-is-ifrs',
    title: 'What IFRS is and why it exists',
    track: 'A',
    module: 'A1',
    kind: 'foundation',
    summary:
      'IFRS Accounting Standards are a single set of rules for how companies measure and report their financial performance. They let an investor in Frankfurt compare a company in Singapore with one in São Paulo on the same basis.',
    explain: [
      'Every company keeps score in money. Without shared rules, two companies with identical businesses could report very different profits simply because they count things differently. Accounting standards are those shared rules.',
      'IFRS Accounting Standards are written by the International Accounting Standards Board (IASB), an independent body overseen by the IFRS Foundation. More than 140 jurisdictions require or permit them for listed companies, which is why global firms, auditors and regulators work in IFRS every day.',
      'Each standard covers a topic: revenue, leases, financial instruments, and, for insurers, [[insurance-contract|insurance contracts]] under IFRS 17. Older standards are named IAS (International Accounting Standards); newer ones are named IFRS.',
      '> You do not need to memorise standards. You need to understand what question each one answers and how it changes the numbers. That is how this portal is organised.',
    ],
    apply: [
      'Standards sit under the Conceptual Framework, which defines the building blocks of financial statements: assets, liabilities, equity, income and expenses. When a standard is silent, preparers fall back on the Framework and on IAS 8.',
      'Standards evolve through a due-process cycle: research, discussion paper, exposure draft, final standard, and post-implementation review. The IFRS Interpretations Committee answers narrower application questions through agenda decisions, which practitioners treat as highly persuasive.',
      'Local endorsement matters. The EU, for example, endorses each standard and may adopt carve-outs, such as the optional exemption from annual cohorts in IFRS 17.',
    ],
    implement: [
      'In a consolidation and reporting platform such as CCH Tagetik, accounting standards show up as configuration: the chart of accounts, the reporting scenarios (for example, a statutory IFRS ledger alongside a local GAAP or Solvency II view), and the rules that turn source data into reported numbers.',
      'A good implementation keeps a clear line from each reported number back to the standard requirement it satisfies. The [[tagetik-overview|Tagetik track]] shows how.',
    ],
    refs: ['Conceptual Framework 1.1–1.2', 'IAS 8.10–8.12'],
    links: [
      { type: 'builds-on', to: 'financial-statements' },
      { type: 'contrasts-with', to: 'ifrs17-why' },
    ],
  },
  {
    id: 'double-entry',
    title: 'Double entry and the journal',
    track: 'A',
    module: 'A5',
    kind: 'foundation',
    summary:
      'Every accounting event is recorded twice, as a debit to one account and an equal credit to another. That rule keeps the books balanced and is how every IFRS 17 number reaches the financial statements.',
    explain: [
      'Think of each account as a bucket with two sides. A debit is an entry on the left side, a credit an entry on the right. For each transaction the total of debits equals the total of credits.',
      'Which side increases a bucket depends on its type:',
      '- Assets (cash, investments) and expenses increase with a debit.',
      '- Liabilities (amounts owed to policyholders), equity and income increase with a credit.',
      'When an insurer receives a premium of 1,000, cash (an asset) rises and so does its obligation to the policyholder (a liability): debit Cash 1,000, credit Insurance contract liability 1,000.',
      '> In the [[measurement-sandbox|sandbox]], open the Journals tab to see every entry a year produces, coloured by the statement line it hits.',
    ],
    apply: [
      'Under IFRS 17 the main liability accounts are the [[lrc|liability for remaining coverage]] (LRC) and the [[lic|liability for incurred claims]] (LIC). Income statement accounts are [[insurance-revenue|insurance revenue]], insurance service expenses and [[insurance-finance|insurance finance income or expenses]].',
      'Premiums do not go to revenue when received. They are credited to the LRC, and revenue is recognised later as the insurer provides cover. This is the single biggest mindset change from cash-based or written-premium reporting.',
    ],
    implement: [
      'In an IFRS 17 subledger the journal is generated, not keyed. Measurement results per group of contracts are mapped to a posting scheme (movement type to debit and credit account), aggregated, and sent to the general ledger. See [[tagetik-journals|accounting engine and journals]].',
    ],
    refs: ['Conceptual Framework 4.3, 4.26, 4.68–4.69'],
    links: [
      { type: 'builds-on', to: 'financial-statements' },
      { type: 'posts-to', to: 'insurance-revenue' },
      { type: 'implemented-by', to: 'tagetik-journals' },
    ],
    sandbox: 'journals',
  },
  {
    id: 'financial-statements',
    title: 'Reading the financial statements',
    track: 'A',
    module: 'A3',
    kind: 'foundation',
    summary:
      'Financial statements answer three questions: what does the company own and owe, how did it perform, and where did the cash go. From 2027, IFRS 18 sets new, more structured rules for presenting performance.',
    explain: [
      'The statement of financial position (balance sheet) lists assets, liabilities and equity at a date. For an insurer the largest liability is usually insurance contract liabilities.',
      'The statement of profit or loss shows performance over a period. For insurers under IFRS 17 it separates the insurance service result (are we good at insuring?) from the investment and finance result (are we good at managing money?).',
      'The statement of cash flows explains movements in cash, and the notes explain judgements and break numbers down. Under IFRS 17 the notes include detailed reconciliations of insurance liabilities.',
    ],
    apply: [
      'IFRS 18 Presentation and Disclosure in Financial Statements is effective for annual periods beginning on or after 1 January 2027 and replaces IAS 1. It introduces defined subtotals (operating profit, profit before financing and income taxes), categories of income and expense, and disclosure of management-defined performance measures.',
      'For insurers, insurance service result and insurance finance income or expenses keep their IFRS 17 line items; IFRS 18 changes how they are grouped within the new categories. Check IFRS 18 requirements for entities whose main business activity is investing or providing financing.',
    ],
    implement: [
      'Reporting platforms hold statement layouts as report definitions over the chart of accounts. When presentation changes (IAS 1 to IFRS 18), the layouts and mapping change while the measurement engine does not. Keeping those layers separate is a core design principle in [[tagetik-data-model|the Tagetik data model]].',
    ],
    refs: ['IFRS 18.IN1', 'IFRS 18.C1', 'IFRS 17.80'],
    links: [
      { type: 'builds-on', to: 'what-is-ifrs' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
  },
]
