import { describe, expect, it } from 'vitest'
import { CONCEPTS, CONCEPT_BY_ID } from '.'
import { GOALS } from './objectives'
import { DECISION_TREES } from './decisions'
import { WORKED_EXAMPLES } from './worked'
import { PRESETS } from '../engine/presets'
import { TBIC_GROUP_LIST } from '../engine/tbic'
import { runGmm } from '../engine/gmm'

describe('objectives and prerequisites', () => {
  it('every concept has objectives, and only concepts have goals', () => {
    for (const c of CONCEPTS) expect(GOALS[c.id]?.objectives.length, c.id).toBeGreaterThanOrEqual(2)
    for (const id of Object.keys(GOALS)) expect(CONCEPT_BY_ID[id], id).toBeDefined()
  })
  it('prerequisites exist and contain no cycles', () => {
    for (const [id, g] of Object.entries(GOALS)) {
      for (const p of g.prerequisites) {
        expect(CONCEPT_BY_ID[p], `${id} -> ${p}`).toBeDefined()
        expect(p).not.toBe(id)
      }
    }
    const state: Record<string, 'visiting' | 'done'> = {}
    const visit = (id: string, path: string[]) => {
      if (state[id] === 'done') return
      if (state[id] === 'visiting') throw new Error(`Cycle: ${[...path, id].join(' -> ')}`)
      state[id] = 'visiting'
      for (const p of GOALS[id].prerequisites) visit(p, [...path, id])
      state[id] = 'done'
    }
    for (const id of Object.keys(GOALS)) expect(() => visit(id, [])).not.toThrow()
  })
})

describe('decision trees', () => {
  const routes = new Set(['/lab/paa', '/sandbox', ...DECISION_TREES.map((t) => `/decide/${t.id}`), ...CONCEPTS.map((c) => `/concept/${c.id}`)])
  for (const t of DECISION_TREES) {
    it(`${t.id}: every path ends in an outcome and every node is reachable`, () => {
      expect(CONCEPT_BY_ID[t.concept]).toBeDefined()
      const seen = new Set<string>()
      const walk = (id: string, depth: number) => {
        const n = t.nodes[id]
        expect(n, `${t.id}: missing node ${id}`).toBeDefined()
        expect(depth).toBeLessThan(20)
        seen.add(id)
        expect(n.refs.length, `${t.id}.${id} has no refs`).toBeGreaterThan(0)
        if (n.kind === 'question') {
          expect(n.options.length).toBeGreaterThanOrEqual(2)
          for (const o of n.options) walk(o.next, depth + 1)
        } else if (n.next) {
          expect(routes.has(n.next.to), `${t.id}.${id} links to ${n.next.to}`).toBe(true)
        }
      }
      walk(t.start, 0)
      expect([...seen].sort()).toEqual(Object.keys(t.nodes).sort())
    })
  }
})

describe('worked examples', () => {
  it('each example belongs to a real concept and appears once', () => {
    const ids = WORKED_EXAMPLES.map((w) => w.concept)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(CONCEPT_BY_ID[id], id).toBeDefined()
  })
  it('totals tie to the rows above them where a block is additive', () => {
    for (const w of WORKED_EXAMPLES) {
      for (const s of w.steps) {
        const rows = s.rows ?? []
        let start = 0
        rows.forEach((r, i) => {
          if (!r.total) return
          const parts = rows.slice(start, i).filter((x) => !x.total)
          const sum = parts.reduce((a, x) => a + x.value, 0)
          // A block that starts with a carried subtotal is checked from that subtotal.
          const carried = start > 0 ? rows[start - 1].value : 0
          const ok = Math.abs(sum - r.value) < 0.05 || Math.abs(carried + sum - r.value) < 0.05
          expect(ok, `${w.concept}: "${s.title}" / ${r.label}`).toBe(true)
          start = i + 1
        })
      }
    }
  })
  it('every journal balances', () => {
    for (const w of WORKED_EXAMPLES) {
      for (const j of w.journals) {
        const dr = j.lines.reduce((a, l) => a + l.debit, 0)
        const cr = j.lines.reduce((a, l) => a + l.credit, 0)
        expect(Math.abs(dr - cr), `${w.concept}: ${j.title}`).toBeLessThan(1e-6)
      }
    }
  })
})

describe('TBIC groups', () => {
  it('are available as sandbox presets with the same inputs', () => {
    for (const g of TBIC_GROUP_LIST) expect(PRESETS.find((p) => p.id === g.id)?.inputs).toEqual(g.inputs)
  })
  it('lifetime profit equals undiscounted net cash flow', () => {
    for (const g of TBIC_GROUP_LIST) {
      const r = runGmm(g.inputs)
      const i = g.inputs
      const prem = i.premiumMode === 'single' ? i.premium : i.premium * i.years
      const out = i.claims.reduce((a, c, k) => a + c * i.actualClaimsFactor[k], 0) + i.expenses.reduce((a, b) => a + b, 0) + i.acquisition
      expect(r.totals.profit, g.id).toBeCloseTo(prem - out, 6)
    }
  })
})
