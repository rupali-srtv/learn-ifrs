import type { GmmInputs } from './gmm'

export interface Preset {
  id: string
  name: string
  summary: string
  inputs: GmmInputs
}

const level = (n: number, v: number) => Array.from({ length: n }, () => v)

export const PRESETS: Preset[] = [
  {
    id: 'profitable',
    name: 'Profitable 5-year protection',
    summary: 'Annual premiums exceed expected claims and expenses, so a CSM is set up and released as cover is provided.',
    inputs: {
      years: 5,
      premiumMode: 'annual',
      premium: 1000,
      claims: level(5, 700),
      expenses: level(5, 60),
      acquisition: 250,
      discountRate: 0.03,
      raPct: 0.08,
      settlementLag: 0,
      coverageUnits: level(5, 1),
      actualClaimsFactor: level(5, 1),
      assumptionChange: null,
    },
  },
  {
    id: 'onerous',
    name: 'Onerous at inception',
    summary: 'Expected outflows exceed premiums on day one. No CSM; a loss is recognised immediately and a loss component tracked.',
    inputs: {
      years: 3,
      premiumMode: 'annual',
      premium: 800,
      claims: level(3, 760),
      expenses: level(3, 50),
      acquisition: 60,
      discountRate: 0.03,
      raPct: 0.06,
      settlementLag: 0,
      coverageUnits: level(3, 1),
      actualClaimsFactor: level(3, 1),
      assumptionChange: null,
    },
  },
  {
    id: 'deterioration',
    name: 'Claims outlook worsens in year 2',
    summary: 'At the end of year 2 expected future claims rise 35%. The CSM absorbs the change until it is exhausted, then a loss appears.',
    inputs: {
      years: 5,
      premiumMode: 'annual',
      premium: 1000,
      claims: level(5, 720),
      expenses: level(5, 60),
      acquisition: 200,
      discountRate: 0.03,
      raPct: 0.08,
      settlementLag: 0,
      coverageUnits: level(5, 1),
      actualClaimsFactor: level(5, 1),
      assumptionChange: { year: 2, futureClaimsPct: 0.35 },
    },
  },
  {
    id: 'long-tail',
    name: 'Single premium with claims paid late',
    summary: 'One upfront premium; 40% of each year’s claims are paid the following year, so a liability for incurred claims builds up.',
    inputs: {
      years: 4,
      premiumMode: 'single',
      premium: 4000,
      claims: [800, 850, 900, 950],
      expenses: level(4, 40),
      acquisition: 300,
      discountRate: 0.04,
      raPct: 0.1,
      settlementLag: 0.4,
      coverageUnits: [4, 3, 2, 1],
      actualClaimsFactor: [1, 1.1, 0.95, 1],
      assumptionChange: null,
    },
  },
]
