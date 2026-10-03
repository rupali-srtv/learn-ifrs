import { describe, expect, it } from 'vitest'
import { runGmm, type GmmInputs } from './gmm'
import { MISSIONS } from './missions'
import { PRESETS } from './presets'

const start = (id: string) => structuredClone(PRESETS.find((p) => p.id === id)!.inputs)

// A known solution for every mission, proving each one can be completed and is not already complete at the start.
const SOLUTIONS: Record<string, (i: GmmInputs) => GmmInputs> = {
  'make-onerous': (i) => ({ ...i, premium: 700 }),
  'rate-effect': (i) => ({ ...i, discountRate: 0.06 }),
  experience: (i) => ({ ...i, actualClaimsFactor: [1, 1, 1.25, 1, 1] }),
  'exhaust-csm': (i) => ({ ...i, assumptionChange: { year: 2, futureClaimsPct: 0.6 } }),
  'reverse-loss': (i) => ({ ...i, assumptionChange: { year: 1, futureClaimsPct: -0.2 } }),
  'front-load': (i) => ({ ...i, coverageUnits: [10, 2, 1, 1, 1] }),
  'build-lic': (i) => ({ ...i, settlementLag: 0.5 }),
  'asset-position': (i) => i,
}

describe.each(MISSIONS.map((m) => [m.id, m] as const))('mission %s', (id, m) => {
  it('has a solution that passes', () => {
    const inp = SOLUTIONS[id](start(m.preset))
    expect(m.check(runGmm(inp), inp)).toBe(true)
  })
  it('is not already solved at the start, unless it is an exploration', () => {
    const inp = start(m.preset)
    if (id !== 'asset-position') expect(m.check(runGmm(inp), inp)).toBe(false)
  })
})
