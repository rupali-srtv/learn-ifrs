import { describe, expect, it } from 'vitest'
import { runGmm } from './gmm'
import { PRESETS } from './presets'
import { controlTotals, groupOf, reconcile, sourceRows, validate, type ErrorKind } from './pipeline'

const ALL: ErrorKind[] = ['missing-key', 'duplicate', 'cohort', 'sign', 'currency']

describe('implementation pipeline', () => {
  for (const p of PRESETS) {
    const r = runGmm(p.inputs)
    r.years.forEach((_, i) => {
      it(`${p.id} year ${i + 1}: clean data validates and every tie-out holds`, () => {
        const rows = sourceRows(r, i)
        expect(validate(rows, groupOf(r), controlTotals(r, i)).every((v) => v.failing.length === 0)).toBe(true)
        for (const t of reconcile(r, i, rows)) expect(t.ok, `${t.id} ${t.left.value} vs ${t.right.value}`).toBe(true)
      })
    })
  }
  it('each injected error is caught by at least one rule', () => {
    const r = runGmm(PRESETS[0].inputs)
    for (const e of ALL) {
      const v = validate(sourceRows(r, 0, [e]), groupOf(r), controlTotals(r, 0))
      expect(v.some((x) => x.failing.length > 0), e).toBe(true)
    }
  })
})
