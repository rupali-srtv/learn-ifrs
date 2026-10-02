import { describe, expect, it } from 'vitest'
import { CONCEPTS, CONCEPT_BY_ID, GLOSSARY, GLOSSARY_BY_ID, TRACKS } from './index'

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
})
