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
      'Standards sit under the [[conceptual-framework|Conceptual Framework]], which defines the building blocks of financial statements: assets, liabilities, equity, income and expenses. When a standard is silent, preparers fall back on the Framework and on IAS 8.',
      'Standards evolve through a due-process cycle: research, discussion paper, exposure draft, final standard, and post-implementation review. The IFRS Interpretations Committee answers narrower application questions through agenda decisions, which practitioners treat as highly persuasive.',
      'Local endorsement matters. The EU, for example, endorses each standard and may adopt carve-outs, such as the optional exemption from the IFRS 17 annual cohort requirement for intergenerationally-mutualised and cash flow matched contracts.',
      'India takes a different route. It does not adopt IFRS as issued; instead the Ministry of Corporate Affairs notifies Indian Accounting Standards (Ind AS) under the Companies Act, 2013. Ind AS are converged with IFRS but keep some India-specific differences, also called carve-outs. Ind AS based on an IAS keep its number (Ind AS 12 corresponds to IAS 12); those based on an IFRS add 100 to its number (Ind AS 109 corresponds to IFRS 9, and Ind AS 117 to IFRS 17). See [[ifrs17-why|why IFRS 17 exists]] for how Ind AS 117 reaches Indian insurers.',
    ],
    implement: [
      'In a consolidation and reporting platform such as CCH Tagetik, accounting standards show up as configuration: the chart of accounts, the reporting scenarios (for example, a statutory IFRS ledger alongside a local GAAP or Solvency II view), and the rules that turn source data into reported numbers.',
      'A good implementation keeps a clear line from each reported number back to the standard requirement it satisfies. The [[tagetik-overview|Tagetik track]] shows how.',
    ],
    refs: ['Conceptual Framework SP1.1–SP1.2', 'IAS 8.10–8.12'],
    links: [
      { type: 'builds-on', to: 'financial-statements' },
      { type: 'contrasts-with', to: 'ifrs17-why' },
    ],
  },
  {
    id: 'conceptual-framework',
    title: 'The Conceptual Framework',
    track: 'A',
    module: 'A2',
    kind: 'foundation',
    summary:
      'The Conceptual Framework defines the building blocks of financial statements (assets, liabilities, equity, income and expenses) and the concepts for recognising and measuring them. It is not itself a Standard, but the IASB uses it to write Standards and preparers use it when no Standard applies.',
    explain: [
      'Before you can count something, you need to agree what it is. The Framework gives the definitions every Standard relies on:',
      '- An asset is a present economic resource controlled by the entity as a result of past events. An economic resource is a right that has the potential to produce economic benefits.',
      '- A liability is a present obligation of the entity to transfer an economic resource as a result of past events.',
      '- Equity is what is left: assets minus liabilities.',
      '- Income is an increase in assets or decrease in liabilities that increases equity, other than contributions from owners. Expenses are the mirror image.',
      'For an insurer, the promise to provide cover and pay future claims is a present obligation arising from the contract. That is why insurance contracts sit on the balance sheet as liabilities long before any claim happens.',
      '> Income and expenses are defined through changes in assets and liabilities. Get the liability right and profit follows. IFRS 17 is built exactly this way: revenue and expenses come out of movements in the [[lrc|LRC]] and [[lic|LIC]].',
    ],
    apply: [
      'Useful information must be relevant and faithfully represent what it claims to represent. These are the two fundamental qualitative characteristics; comparability, verifiability, timeliness and understandability enhance them.',
      'Recognition: an item that meets the definition of an element is recognised if doing so gives relevant information and a faithful representation. The 2018 Framework dropped a fixed probability threshold; low probability or high measurement uncertainty are factors in that judgement, not automatic bars.',
      'Measurement bases fall into two families:',
      '- Historical cost, based on the price of the transaction that created the item.',
      '- Current value: fair value, value in use (assets), fulfilment value (liabilities) and current cost.',
      'IFRS 17 is a current value model. The [[fulfilment-cash-flows|fulfilment cash flows]] are a current, entity-specific estimate of the cost of fulfilling the obligation, close in spirit to the Framework’s fulfilment value. The [[csm|CSM]] then adds an element that is not a current value: unearned profit carried from initial recognition.',
      'Unit of account: the Framework says the unit of account is chosen per Standard, balancing relevance and faithful representation against cost. IFRS 17 chooses the [[level-of-aggregation|group of contracts]], and presents portfolios in an asset position separately from those in a liability position (IFRS 17.78).',
      'Prudence in the Framework means caution when making judgements under uncertainty. It does not permit deliberately overstating liabilities. The IFRS 17 [[risk-adjustment|risk adjustment]] is an explicit, disclosed measure of compensation for uncertainty, not a hidden margin.',
    ],
    implement: [
      'The Framework rarely appears in system configuration directly, but its definitions drive the chart of accounts: every account is classified as an asset, liability, equity, income or expense, and the classification determines sign conventions and how balances roll into the statements.',
      'When a policy question has no direct answer in IFRS 17, for example how to treat an unusual cash flow in a new product, the accounting policy paper should show the reasoning: which Standards deal with similar issues, then the Framework (IAS 8.11). Keep that paper with the configuration it justifies.',
    ],
    refs: [
      'Conceptual Framework 2.5–2.16',
      'Conceptual Framework 4.3–4.4',
      'Conceptual Framework 4.26',
      'Conceptual Framework 4.48–4.55',
      'Conceptual Framework 5.7',
      'Conceptual Framework Chapter 6',
      'IAS 8.11',
      'IFRS 17.78',
    ],
    links: [
      { type: 'builds-on', to: 'what-is-ifrs' },
      { type: 'measured-by', to: 'fulfilment-cash-flows' },
    ],
    lenses: {
      auditor: 'When challenging a novel policy choice, test the reasoning chain: analogous Standards first, then the Framework. The Framework never overrides a Standard.',
    },
  },
  {
    id: 'key-standards',
    title: 'Standards every insurance learner meets',
    track: 'A',
    module: 'A4',
    kind: 'foundation',
    summary:
      'IFRS 17 never works alone. An insurer’s accounts also depend on IFRS 9 for its investments, IFRS 13 for fair values, IAS 21 for foreign currency, IAS 12 for tax and several others, and the choices made under each interact.',
    explain: [
      'An insurer is two businesses in one: it takes on risk (insurance contracts, IFRS 17) and it invests the premiums until claims are paid (financial instruments, IFRS 9). Most of the other Standards below explain how the rest of the balance sheet is measured and how it fits with the insurance liabilities.',
      'The most important pairing is IFRS 9 with IFRS 17. If assets and liabilities are measured on different bases, or their changes land in different places, profit can swing for purely accounting reasons. This is called an accounting mismatch.',
      '> Read the policy choices under IFRS 9 and IFRS 17 together. Insurers generally made them as one decision on transition.',
    ],
    apply: [
      'The Standards in brief, with the insurer angle:',
      '- IFRS 9 Financial Instruments: classifies financial assets at amortised cost, fair value through OCI or fair value through profit or loss, based on the business model and the contractual cash flow characteristics, and sets the expected credit loss model. Insurers align it with the IFRS 17 [[insurance-finance|OCI option]]: assets at fair value through OCI pair naturally with disaggregating insurance finance income or expenses (IFRS 17.88). Assets may be designated at fair value through profit or loss where that eliminates or significantly reduces an accounting mismatch (IFRS 9.4.1.5). Investment contracts without discretionary participation features are financial liabilities under IFRS 9, not IFRS 17.',
      '- IFRS 13 Fair Value Measurement: defines fair value as an exit price between market participants. Insurers use it for investments, for the underlying items of [[vfa|VFA]] contracts, and for the fair value approach on [[transition|transition]].',
      '- IFRS 15 Revenue from Contracts with Customers: the five-step model for revenue. [[insurance-revenue|Insurance revenue]] follows the same idea (revenue as service is provided) but is derived from changes in the LRC and excludes investment components. Distinct goods and non-insurance services separated from an insurance contract are accounted for under IFRS 15 (IFRS 17.12), and some fixed-fee service contracts may be accounted for under IFRS 15 by choice (IFRS 17.8).',
      '- IFRS 16 Leases: right-of-use assets and lease liabilities for offices and branches. Not insurance-specific, but overheads such as rent and building depreciation that are directly attributable to fulfilling contracts are allocated into fulfilment cash flows (IFRS 17.B65(l)).',
      '- IAS 12 Income Taxes: deferred tax arises where IFRS 17 carrying amounts differ from tax bases, which is common where tax follows a local or statutory basis. Income tax the insurer pays on its own account is excluded from fulfilment cash flows (IFRS 17.B66(f)).',
      '- IAS 21 Foreign Currency: a group of insurance contracts with foreign currency cash flows, including its CSM, is treated as a monetary item (IFRS 17.30), so it is retranslated at the closing rate.',
      '- IAS 37 Provisions: covers provisions such as litigation and restructuring, and has its own onerous contract test. That test does not apply to insurance contracts in IFRS 17’s scope, which use the group-level [[onerous-contracts|onerous]] assessment instead.',
      'IFRS 18 Presentation and Disclosure in Financial Statements replaces IAS 1 for annual periods beginning on or after 1 January 2027. It changes how the income statement is structured around new categories and subtotals; it does not change IFRS 17 measurement. See [[financial-statements|reading the financial statements]].',
    ],
    implement: [
      'In a finance architecture these Standards usually live in different systems: an investment accounting system for IFRS 9, the IFRS 17 subledger for insurance contracts, a tax engine or spreadsheet for IAS 12, and the consolidation platform for currency translation and presentation. The consolidation layer is where they meet.',
      'Design checks that matter for insurers:',
      '- The OCI amounts from assets (IFRS 9) and liabilities (IFRS 17) should be reportable side by side, so the mismatch the policy choice was meant to reduce can be monitored.',
      '- Currency translation of insurance balances should follow the monetary-item treatment, which affects the CSM roll-forward as well as the balance sheet.',
      '- Deferred tax on IFRS 17 balances needs the IFRS 17 carrying amounts at the same grain as the tax bases.',
    ],
    refs: ['IFRS 17.7–8A', 'IFRS 17.12', 'IFRS 17.30', 'IFRS 17.88', 'IFRS 17.B65–B66', 'IFRS 9.4.1.5', 'IFRS 13.9', 'IFRS 18.IN1'],
    links: [
      { type: 'builds-on', to: 'conceptual-framework' },
      { type: 'builds-on', to: 'financial-statements' },
      { type: 'contrasts-with', to: 'insurance-revenue' },
      { type: 'contrasts-with', to: 'onerous-contracts' },
    ],
    lenses: {
      auditor: 'Check that IFRS 9 classification and the IFRS 17 OCI option were considered together and that the rationale for any fair value designation is documented.',
      actuary: 'Discount rate choices under IFRS 17 and asset valuations under IFRS 9 and IFRS 13 should be consistent with observable market prices for financial variables (IFRS 17.33(b) and 17.36).',
    },
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
      { type: 'builds-on', to: 'conceptual-framework' },
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
      { type: 'builds-on', to: 'conceptual-framework' },
      { type: 'disclosed-in', to: 'disclosures' },
    ],
  },
]
