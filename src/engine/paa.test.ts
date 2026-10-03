import { describe, expect, it } from 'vitest'
import { runPaa } from './paa'
import { runGmm } from './gmm'
import { PRESETS } from './presets'

describe.each(PRESETS.map((p) => [p.name, p.inputs] as const))('PAA: %s', (_n, inputs) => {
  for (const expenseAcquisition of [false, true]) {
    const r = runPaa(inputs, { expenseAcquisition })
    it(`lifetime profit equals net cash (expense acquisition: ${expenseAcquisition})`, () => {
      expect(r.totals.profit).toBeCloseTo(r.totals.netCash, 6)
    })
    it(`LRC and LIC run off to zero (expense acquisition: ${expenseAcquisition})`, () => {
      const last = r.years[r.years.length - 1]
      expect(last.lrcClose).toBeCloseTo(0, 6)
      expect(last.licClose).toBeCloseTo(0, 6)
    })
  }
  it('lifetime profit matches the GMM, only its timing differs', () => {
    expect(runPaa(inputs, { expenseAcquisition: false }).totals.profit).toBeCloseTo(runGmm(inputs).totals.profit, 6)
  })
})

it('one-year PAA earns the premium evenly and defers acquisition costs', () => {
  const r = runPaa({ ...PRESETS[0].inputs, years: 1, claims: [700], expenses: [0], coverageUnits: [1], actualClaimsFactor: [1], discountRate: 0, raPct: 0 }, { expenseAcquisition: false })
  expect(r.years[0].insuranceRevenue).toBeCloseTo(1000)
  expect(r.years[0].acquisitionAmortisation).toBeCloseTo(250)
})
