import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CONCEPTS, CONCEPT_BY_ID, EDGE_LABEL } from '../content'
import type { NodeKind } from '../content/types'
import { Inline } from '../components/RichText'

const COLUMNS: { kinds: NodeKind[]; title: string }[] = [
  { kinds: ['foundation'], title: 'Foundations' },
  { kinds: ['scope'], title: 'Scope and grouping' },
  { kinds: ['measurement'], title: 'Measurement' },
  { kinds: ['presentation', 'disclosure'], title: 'Presentation, disclosure' },
  { kinds: ['tagetik'], title: 'Tagetik implementation' },
]

const NODE_W = 176
const NODE_H = 30
const ROW = 40
const COL_GAP = 52
const TOP = 48

function shortTitle(t: string): string {
  let s = t.replace(/\s*\(.*?\)\s*/g, ' ').replace(/^IFRS 17 in CCH Tagetik: /, '').trim()
  s = s.charAt(0).toUpperCase() + s.slice(1)
  return s.length > 26 ? s.slice(0, 25).trimEnd() + '…' : s
}

export function ConceptMap() {
  const [params, setParams] = useSearchParams()
  const focus = params.get('focus')
  const navigate = useNavigate()

  const layout = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {}
    COLUMNS.forEach((col, ci) => {
      const nodes = CONCEPTS.filter((c) => col.kinds.includes(c.kind))
      nodes.forEach((n, ri) => {
        pos[n.id] = { x: 20 + ci * (NODE_W + COL_GAP), y: TOP + ri * ROW }
      })
    })
    const height = Math.max(...Object.values(pos).map((p) => p.y)) + NODE_H + 24
    const width = 20 + COLUMNS.length * (NODE_W + COL_GAP) - COL_GAP + 20
    const edges = CONCEPTS.flatMap((c) => c.links.filter((l) => pos[l.to]).map((l) => ({ from: c.id, to: l.to, type: l.type })))
    return { pos, height, width, edges }
  }, [])

  const neighbours = useMemo(() => {
    if (!focus) return null
    const s = new Set([focus])
    for (const e of layout.edges) {
      if (e.from === focus) s.add(e.to)
      if (e.to === focus) s.add(e.from)
    }
    return s
  }, [focus, layout.edges])

  const path = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ay = a.y + NODE_H / 2
    const by = b.y + NODE_H / 2
    if (Math.abs(a.x - b.x) < 1) {
      // same column: loop out to the right
      const x = a.x + NODE_W
      return `M${x} ${ay} C${x + 30} ${ay}, ${x + 30} ${by}, ${x} ${by}`
    }
    const [l, r] = a.x < b.x ? [a, b] : [b, a]
    const ly = l === a ? ay : by
    const ry = r === a ? ay : by
    const x1 = l.x + NODE_W
    const x2 = r.x
    const mx = (x1 + x2) / 2
    return `M${x1} ${ly} C${mx} ${ly}, ${mx} ${ry}, ${x2} ${ry}`
  }

  const f = focus ? CONCEPT_BY_ID[focus] : null
  const focusEdges = f ? layout.edges.filter((e) => e.from === f.id || e.to === f.id) : []

  return (
    <>
      <div className="eyebrow">Explore</div>
      <h1 style={{ marginTop: 8 }}>Concept map</h1>
      <p className="hero-lede">
        Every page is a node, and every link has a meaning: builds on, measured by, posts to, disclosed in, implemented by.
        Select a concept to light up its connections; open it to read.
      </p>

      {f && (
        <div className="panel" style={{ padding: 16, marginTop: 20, display: 'grid', gap: 8 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{f.title}</strong>
            <div className="row">
              <Link className="btn btn-primary" to={`/concept/${f.id}`}>Open page</Link>
              <button className="btn btn-ghost" onClick={() => setParams({})}>Clear selection</button>
            </div>
          </div>
          <p className="muted"><Inline text={f.summary} /></p>
          <div className="row" style={{ fontSize: 'var(--step--1)' }}>
            {focusEdges.map((e, i) => {
              const other = e.from === f.id ? e.to : e.from
              return (
                <span key={i} className="tag">
                  {e.from === f.id ? EDGE_LABEL[e.type] : `${EDGE_LABEL[e.type]} (from)`}: {CONCEPT_BY_ID[other].title}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="map-wrap">
        <svg className="map-svg" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="Concept map of IFRS, IFRS 17 and Tagetik implementation">
          {COLUMNS.map((c, ci) => (
            <text key={c.title} className="map-col-title" x={20 + ci * (NODE_W + COL_GAP)} y={26}>{c.title}</text>
          ))}
          {layout.edges.map((e, i) => {
            const hot = focus && (e.from === focus || e.to === focus)
            // Links inside one column only show for the selected concept, to keep the map readable.
            if (!hot && Math.abs(layout.pos[e.from].x - layout.pos[e.to].x) < 1) return null
            return <path key={i} d={path(layout.pos[e.from], layout.pos[e.to])} className={`map-edge${hot ? ' hot' : ''}${focus && !hot ? ' dim' : ''}`} />
          })}
          {CONCEPTS.map((c) => {
            const p = layout.pos[c.id]
            const cls = focus === c.id ? 'focus' : neighbours && !neighbours.has(c.id) ? 'dim' : ''
            return (
              <g
                key={c.id}
                className={`map-node ${cls}`}
                transform={`translate(${p.x},${p.y})`}
                tabIndex={0}
                role="button"
                aria-label={`${c.title}. Press Enter to select, double-click to open.`}
                onClick={() => setParams({ focus: c.id })}
                onDoubleClick={() => navigate(`/concept/${c.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setParams({ focus: c.id })
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect width={NODE_W} height={NODE_H} rx={5} />
                <text x={10} y={19}>{shortTitle(c.title)}</text>
                <title>{c.title}</title>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="muted" style={{ marginTop: 10, fontSize: 'var(--step--1)' }}>
        Prefer a list? Every page also shows its connections in the “Connect the dots” panel, and the <Link to="/learn">learning tracks</Link> list all pages in order.
      </p>
    </>
  )
}
