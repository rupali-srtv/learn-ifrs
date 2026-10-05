import type { GmmInputs } from './gmm'

/**
 * TBIC, The Best Insurance Company: the fictional Indian insurance group used in every worked example and numeric question.
 * All amounts are in ₹ lakh. One flat discount rate stands in for the yield curve, as in the sandbox.
 */
export const TBIC = {
  name: 'TBIC',
  fullName: 'The Best Insurance Company',
  unit: '₹ lakh',
  profile:
    'TBIC (The Best Insurance Company) is a fictional Indian insurance group: a life insurer writes its term business, and a general insurer writes its health and home business, because Indian law does not let one insurer write both life and general business. Both report under Ind AS 117, India’s insurance contracts standard based on IFRS 17. Every amount in its examples is in ₹ lakh, and every number is calculated by the same engine that runs the sandbox.',
}

export type TbicGroupId = 'tbic-suraksha' | 'tbic-arogya' | 'tbic-griha'

export interface TbicGroup {
  id: TbicGroupId
  name: string
  product: string
  story: string
  inputs: GmmInputs
}

const level = (n: number, v: number) => Array.from({ length: n }, () => v)

export const TBIC_GROUPS: Record<TbicGroupId, TbicGroup> = {
  'tbic-suraksha': {
    id: 'tbic-suraksha',
    name: 'TBIC Suraksha Term',
    product: '5-year term life cover, annual premiums',
    story:
      'A group of 5-year term life policies issued on the first day of TBIC’s financial year. Premiums of ₹1,000 lakh are received at the start of each year. TBIC expects death claims of ₹700 lakh a year, paid at each year end, and maintenance expenses of ₹60 lakh at the start of each year. It paid commission of ₹250 lakh to agents when the policies were sold. The discount rate is 7% a year, the risk adjustment is 8% of the present value of claims, and the cover provided is the same in every year.',
    inputs: {
      years: 5,
      premiumMode: 'annual',
      premium: 1000,
      claims: level(5, 700),
      expenses: level(5, 60),
      acquisition: 250,
      discountRate: 0.07,
      raPct: 0.08,
      settlementLag: 0,
      coverageUnits: level(5, 1),
      actualClaimsFactor: level(5, 1),
      assumptionChange: null,
    },
  },
  'tbic-arogya': {
    id: 'tbic-arogya',
    name: 'TBIC Arogya Health',
    product: '3-year health cover, annual premiums',
    story:
      'A group of 3-year health policies priced aggressively to win market share. Premiums of ₹800 lakh are received at the start of each year. TBIC expects claims of ₹760 lakh a year, paid at each year end, and maintenance expenses of ₹50 lakh at the start of each year. Commission of ₹60 lakh was paid at issue. The discount rate is 7%, the risk adjustment is 6% of the present value of claims, and the cover provided is the same in every year.',
    inputs: {
      years: 3,
      premiumMode: 'annual',
      premium: 800,
      claims: level(3, 760),
      expenses: level(3, 50),
      acquisition: 60,
      discountRate: 0.07,
      raPct: 0.06,
      settlementLag: 0,
      coverageUnits: level(3, 1),
      actualClaimsFactor: level(3, 1),
      assumptionChange: null,
    },
  },
  'tbic-griha': {
    id: 'tbic-griha',
    name: 'TBIC Griha Raksha',
    product: '4-year home insurance, single premium',
    story:
      'A group of 4-year home insurance policies sold with one upfront premium of ₹4,400 lakh. TBIC expects claims of ₹800, ₹850, ₹900 and ₹950 lakh in years 1 to 4. Only 60% of each year’s claims are paid by the year end; the other 40% are settled one year later. Expenses are ₹40 lakh at the start of each year and commission of ₹300 lakh was paid at issue. The discount rate is 7%, the risk adjustment is 10% of the present value of claims, and the cover provided is the same in every year. In year 2, actual claims turn out 10% higher than expected.',
    inputs: {
      years: 4,
      premiumMode: 'single',
      premium: 4400,
      claims: [800, 850, 900, 950],
      expenses: level(4, 40),
      acquisition: 300,
      discountRate: 0.07,
      raPct: 0.1,
      settlementLag: 0.4,
      coverageUnits: level(4, 1),
      actualClaimsFactor: [1, 1.1, 1, 1],
      assumptionChange: null,
    },
  },
}

export const TBIC_GROUP_LIST: TbicGroup[] = Object.values(TBIC_GROUPS)
