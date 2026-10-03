import { describe, expect, it } from 'vitest'
import { CONCEPTS, CONCEPT_BY_ID, GLOSSARY, GLOSSARY_BY_ID, QUIZ_BY_ID, TRACKS } from './index'

const SPECIAL = new Set(['measurement-sandbox', 'concept-map', 'glossary'])

describe('content integrity', () => {
  it('concept ids are unique', () => {
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length)
  })
  it('every link points at an existing concept', () => {
    for (const c of CONCEPTS) for (const l of c.links) expect(CONCEPT_BY_ID[l.to], `${c.id} -> ${l.to}`).toBeTruthy()
  })
  it('every inline reference resolves', () => {
    for (const c of CONCEPTS) {
      const text = [...c.explain, ...c.apply, ...c.implement].join(' ')
      for (const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
        const id = m[1]
        expect(CONCEPT_BY_ID[id] || GLOSSARY_BY_ID[id] || SPECIAL.has(id), `${c.id}: ${id}`).toBeTruthy()
      }
    }
  })
  it('track modules reference existing concepts, and every concept sits in a module', () => {
    const placed = new Set<string>()
    for (const t of TRACKS) for (const m of t.modules) for (const id of m.concepts) {
      expect(CONCEPT_BY_ID[id], id).toBeTruthy()
      placed.add(id)
    }
    for (const c of CONCEPTS) expect(placed.has(c.id), c.id).toBe(true)
  })
  it('glossary terms link to existing concepts', () => {
    for (const g of GLOSSARY) if (g.concept) expect(CONCEPT_BY_ID[g.concept], g.id).toBeTruthy()
  })
  it('every concept cites at least one paragraph', () => {
    for (const c of CONCEPTS) expect(c.refs.length, c.id).toBeGreaterThan(0)
  })
  it('glossary ids are unique and do not collide with concept ids', () => {
    expect(new Set(GLOSSARY.map((g) => g.id)).size).toBe(GLOSSARY.length)
    for (const g of GLOSSARY) expect(CONCEPT_BY_ID[g.id], g.id).toBeFalsy()
  })
  it('no module has an empty concepts list', () => {
    for (const t of TRACKS) for (const m of t.modules) expect(m.concepts.length, m.code).toBeGreaterThan(0)
  })
})

describe('quizzes', () => {
  const REF = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  it('are keyed by existing concepts', () => {
    for (const id of Object.keys(QUIZ_BY_ID)) expect(CONCEPT_BY_ID[id], id).toBeTruthy()
  })
  it('have well-formed questions with a valid answer index', () => {
    for (const [id, qs] of Object.entries(QUIZ_BY_ID)) {
      expect(qs.length, id).toBeGreaterThan(0)
      for (const q of qs) {
        expect(q.options.length, q.q).toBeGreaterThanOrEqual(3)
        expect(q.options.length, q.q).toBeLessThanOrEqual(4)
        expect(Number.isInteger(q.answer), q.q).toBe(true)
        expect(q.answer, q.q).toBeGreaterThanOrEqual(0)
        expect(q.answer, q.q).toBeLessThan(q.options.length)
        expect(new Set(q.options).size, q.q).toBe(q.options.length)
        expect(q.why.trim().length, q.q).toBeGreaterThan(0)
      }
    }
  })
  it('every reference in a quiz explanation resolves', () => {
    for (const [id, qs] of Object.entries(QUIZ_BY_ID)) {
      for (const q of qs) {
        for (const m of q.why.matchAll(REF)) {
          const ref = m[1]
          expect(CONCEPT_BY_ID[ref] || GLOSSARY_BY_ID[ref] || SPECIAL.has(ref), `${id}: ${ref}`).toBeTruthy()
        }
      }
    }
  })
})
