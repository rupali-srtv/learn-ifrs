import { describe, expect, it } from 'vitest'
import { RETIRED, addDays, dueItems, recordReviewAnswer, recordStudyAnswer, upcomingItems, type ReviewState } from './review'
import { masteryOf } from './mastery'

describe('spaced review', () => {
  const day = '2026-10-05'
  it('adds dates across month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
  it('a new right answer is due in 3 days, a wrong one tomorrow', () => {
    let s: ReviewState = {}
    s = recordStudyAnswer(s, 'a', true, day)
    s = recordStudyAnswer(s, 'b', false, day)
    expect(s.a).toEqual({ box: 1, due: '2026-10-08' })
    expect(s.b).toEqual({ box: 0, due: '2026-10-06' })
  })
  it('studying never promotes, but a wrong answer resets', () => {
    let s: ReviewState = { a: { box: 3, due: '2026-10-20' } }
    expect(recordStudyAnswer(s, 'a', true, day)).toBe(s)
    s = recordStudyAnswer(s, 'a', false, day)
    expect(s.a).toEqual({ box: 0, due: '2026-10-06' })
  })
  it('reviews promote through every box and then retire', () => {
    let s: ReviewState = { a: { box: 0, due: day } }
    const dues: string[] = []
    for (let i = 0; i < RETIRED; i++) {
      s = recordReviewAnswer(s, 'a', true, day)
      dues.push(s.a.due)
    }
    expect(dues).toEqual(['2026-10-08', '2026-10-12', '2026-10-21', '2026-11-09', ''])
    expect(s.a.box).toBe(RETIRED)
    expect(dueItems(s, '2030-01-01')).toEqual([])
  })
  it('a wrong review answer goes back to box 0', () => {
    const s = recordReviewAnswer({ a: { box: 4, due: day } }, 'a', false, day)
    expect(s.a).toEqual({ box: 0, due: '2026-10-06' })
  })
  it('lists due and upcoming cards in order', () => {
    const s: ReviewState = {
      a: { box: 2, due: '2026-10-04' },
      b: { box: 0, due: '2026-10-05' },
      c: { box: 1, due: '2026-10-04' },
      d: { box: 1, due: '2026-10-09' },
      e: { box: 3, due: '2026-10-07' },
    }
    expect(dueItems(s, day)).toEqual(['c', 'a', 'b'])
    expect(upcomingItems(s, day)).toEqual(['e', 'd'])
  })
})

describe('mastery', () => {
  const checks = { hasQuiz: true, numericIds: ['n1', 'n2'] }
  const base = { visited: [] as string[], quizScores: {}, numericSolved: {} }
  it('moves from new to read to practised to mastered', () => {
    expect(masteryOf('x', checks, base)).toBe('new')
    expect(masteryOf('x', checks, { ...base, visited: ['x'] })).toBe('read')
    expect(masteryOf('x', checks, { ...base, visited: ['x'], numericSolved: { n1: false } })).toBe('practised')
    expect(masteryOf('x', checks, { ...base, quizScores: { x: { score: 3, total: 3 } }, numericSolved: { n1: true } })).toBe('practised')
    expect(masteryOf('x', checks, { ...base, quizScores: { x: { score: 2, total: 3 } }, numericSolved: { n1: true, n2: true } })).toBe('practised')
    expect(masteryOf('x', checks, { ...base, quizScores: { x: { score: 3, total: 3 } }, numericSolved: { n1: true, n2: true } })).toBe('mastered')
  })
  it('a page with only a quiz is mastered on full marks', () => {
    expect(masteryOf('x', { hasQuiz: true, numericIds: [] }, { ...base, quizScores: { x: { score: 4, total: 4 } } })).toBe('mastered')
  })
  it('a page with no checks can only be read', () => {
    expect(masteryOf('x', { hasQuiz: false, numericIds: [] }, { ...base, visited: ['x'] })).toBe('read')
  })
})
