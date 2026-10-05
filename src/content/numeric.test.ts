import { describe, expect, it } from 'vitest'
import { CONCEPT_BY_ID } from './index'
import { NUMERIC_BY_ID, NUMERIC_QUESTIONS, checkNumeric, parseAmount, tolerance } from './numeric'

const v = 1 / 1.07
const annuityDue5 = 1 + v + v ** 2 + v ** 3 + v ** 4
const annuityEnd5 = v + v ** 2 + v ** 3 + v ** 4 + v ** 5

describe('numeric questions', () => {
  it('have unique ids and point at existing concepts', () => {
    expect(new Set(NUMERIC_QUESTIONS.map((q) => q.id)).size).toBe(NUMERIC_QUESTIONS.length)
    for (const q of NUMERIC_QUESTIONS) expect(CONCEPT_BY_ID[q.concept], q.id).toBeTruthy()
  })

  it('cover every concept in modules B5 to B7', () => {
    const covered = new Set(NUMERIC_QUESTIONS.map((q) => q.concept))
    for (const id of ['gmm', 'fulfilment-cash-flows', 'discounting', 'risk-adjustment', 'csm', 'lrc', 'lic', 'coverage-units', 'acquisition-cash-flows', 'onerous-contracts', 'loss-component']) {
      expect(covered.has(id), id).toBe(true)
    }
  })

  it('every common mistake is clearly distinct from the answer and from the other mistakes', () => {
    for (const q of NUMERIC_QUESTIONS) {
      const all = [q.answer, ...q.mistakes.map((m) => m.value)]
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          expect(Math.abs(all[i] - all[j]), `${q.id}: ${all[i]} vs ${all[j]}`).toBeGreaterThan(tolerance(all[i]) + tolerance(all[j]))
        }
      }
    }
  })

  it('answers agree with independent hand calculations', () => {
    const near = (id: string, hand: number) => expect(NUMERIC_BY_ID[id].answer, id).toBeCloseTo(hand, 6)
    near('pv-premiums', 1000 * annuityDue5)
    near('pv-claims', 700 * annuityEnd5)
    near('pv-outflows', 700 * annuityEnd5 + 60 * annuityDue5 + 250)
    near('ra-day-one', 0.08 * 700 * annuityEnd5)
    const csm0 = 1000 * annuityDue5 - (700 * annuityEnd5 + 60 * annuityDue5 + 250) - 0.08 * 700 * annuityEnd5
    near('csm-day-one', csm0)
    near('csm-release-y1', (csm0 * 1.07) / 5)
    near('csm-close-y1', csm0 * 1.07 * 0.8)
    near('cu-declining', (csm0 * 1.07 * 5) / 15)
    const annuityEnd4 = v + v ** 2 + v ** 3 + v ** 4
    near('ra-release-y1', 0.08 * 700 * annuityEnd5 - 0.08 * 700 * annuityEnd4)
    near('acq-y1', 50)
    near('lic-griha-y1', 320 * v * 1.1)
    near('paid-griha-y2', 320 + 0.6 * 935)
    near('lifetime-profit', 5000 - 3500 - 300 - 250)
    // Arogya: annual premiums 800, claims 760 at year end, expenses 50 at year start, commission 60, RA 6% of PV claims.
    const ad3 = 1 + v + v ** 2
    const ae3 = v + v ** 2 + v ** 3
    const loss = 760 * ae3 + 50 * ad3 + 60 + 0.06 * 760 * ae3 - 800 * ad3
    near('arogya-loss', loss)
  })

  it('the Arogya group is onerous and Suraksha and Griha Raksha are profitable over their lives', () => {
    expect(NUMERIC_BY_ID['arogya-loss'].answer).toBeGreaterThan(0)
    expect(NUMERIC_BY_ID['csm-day-one'].answer).toBeGreaterThan(0)
    expect(NUMERIC_BY_ID['lifetime-profit'].answer).toBeGreaterThan(0)
  })

  it('reads typed answers in the forms learners use', () => {
    expect(parseAmount('4,387.2')).toBe(4387.2)
    expect(parseAmount('₹ 774.2 lakh')).toBe(774.2)
    expect(parseAmount('Rs. 50')).toBe(50)
    expect(parseAmount('(51.5)')).toBe(-51.5)
    expect(parseAmount('-51.5')).toBe(-51.5)
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('')).toBeNull()
  })

  it('accepts answers within tolerance and recognises common mistakes', () => {
    const q = NUMERIC_BY_ID['csm-release-y1']
    expect(checkNumeric(q, (Math.round(q.answer * 10) / 10).toString()).kind).toBe('correct')
    expect(checkNumeric(q, String(Math.round(q.answer))).kind).toBe('correct')
    expect(checkNumeric(q, String(NUMERIC_BY_ID['csm-day-one'].answer / 5)).kind).toBe('mistake')
    expect(checkNumeric(q, '1').kind).toBe('wrong')
    expect(checkNumeric(q, 'lots').kind).toBe('invalid')
  })

  it('every solution and prompt is free of unformatted numbers from floating-point noise', () => {
    for (const q of NUMERIC_QUESTIONS) {
      for (const t of [q.prompt, ...q.solution]) expect(t, q.id).not.toMatch(/\d\.\d{5,}/)
    }
  })
})
