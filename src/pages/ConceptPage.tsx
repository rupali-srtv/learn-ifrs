import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CONCEPT_BY_ID, CONTENT_STATUS, CONTENT_VERSION, EDGE_LABEL, TRACK_BY_ID, relatedOf, type Depth,
} from '../content'
import type { EdgeType } from '../content/types'
import { RichText, Inline } from '../components/RichText'
import { usePrefs } from '../prefs'
import { NotFound } from './NotFound'
import { Icon } from '../components/Icon'

const DEPTHS: { id: Depth; label: string; sub: string }[] = [
  { id: 'explain', label: 'Explain', sub: 'Plain language' },
  { id: 'apply', label: 'Apply', sub: 'The standard in practice' },
  { id: 'implement', label: 'Implement', sub: 'Systems and Tagetik' },
]

const EDGE_ORDER: EdgeType[] = ['builds-on', 'measured-by', 'posts-to', 'disclosed-in', 'implemented-by', 'requires-data', 'contrasts-with']
const INBOUND_LABEL: Partial<Record<EdgeType, string>> = {
  'builds-on': 'Leads on to',
  'implemented-by': 'Implements',
  'measured-by': 'Used to measure',
  'posts-to': 'Fed by',
  'disclosed-in': 'Discloses',
  'requires-data': 'Supplies data to',
}

const SANDBOX_LABEL = {
  overview: 'See it in the sandbox',
  rollforward: 'Watch it roll forward',
  journals: 'See the journal entries',
  disclosures: 'See the disclosure',
}

export function ConceptPage() {
  const { id = '' } = useParams()
  const c = CONCEPT_BY_ID[id]
  const { depth, setDepth, markVisited } = usePrefs()

  useEffect(() => {
    if (c) markVisited(c.id)
  }, [c, markVisited])

  if (!c) return <NotFound />
  const track = TRACK_BY_ID[c.track]
  const ordered = track.modules.flatMap((m) => m.concepts)
  const idx = ordered.indexOf(c.id)
  const prev = idx > 0 ? CONCEPT_BY_ID[ordered[idx - 1]] : null
  const next = idx < ordered.length - 1 ? CONCEPT_BY_ID[ordered[idx + 1]] : null
  const module = track.modules.find((m) => m.code === c.module)

  const related = relatedOf(c.id)
  const groups = new Map<string, typeof related>()
  for (const t of EDGE_ORDER) {
    for (const r of related.filter((x) => x.type === t)) {
      const label = r.inbound ? INBOUND_LABEL[t] ?? EDGE_LABEL[t] : EDGE_LABEL[t]
      groups.set(label, [...(groups.get(label) ?? []), r])
    }
  }

  const body = depth === 'explain' ? c.explain : depth === 'apply' ? c.apply : c.implement

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/learn">Learn</Link><span>/</span>
        <Link to={`/learn/${track.id}`}>{track.title}</Link><span>/</span>
        <span>{c.module} {module?.title}</span>
      </nav>
      <div className="concept">
        <aside className="concept-nav" aria-label="Track contents">
          <h4>{track.title}</h4>
          <ol>
            {track.modules.filter((m) => m.concepts.length).map((m) => (
              <li key={m.code}>
                <div className="mod">{m.code} {m.title}</div>
                <ol>
                  {m.concepts.map((cid) => (
                    <li key={cid}>
                      <Link to={`/concept/${cid}`} aria-current={cid === c.id ? 'page' : undefined}>{CONCEPT_BY_ID[cid].title}</Link>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </aside>

        <article className="concept-main">
          <div className="eyebrow">Module {c.module} · {module?.title}</div>
          <h1 className="concept-title">{c.title}</h1>
          <p className="summary"><Inline text={c.summary} /></p>

          <div className="depth" role="group" aria-label="Depth">
            {DEPTHS.map((d) => (
              <button key={d.id} aria-pressed={depth === d.id} onClick={() => setDepth(d.id)}>
                <span>{d.label}</span>
                <small>{d.sub}</small>
              </button>
            ))}
          </div>

          {c.track === 'C' && (
            <div className="callout validation">
              Implementation pattern. Validate CCH Tagetik object names and options against your release before relying on them.
            </div>
          )}

          <div className="prose" key={depth}>
            <RichText body={body} />
          </div>

          {c.lenses && (
            <div className="lens-grid">
              {c.lenses.auditor && <div className="panel lens"><strong>Auditor</strong><span>{c.lenses.auditor}</span></div>}
              {c.lenses.actuary && <div className="panel lens"><strong>Actuary</strong><span>{c.lenses.actuary}</span></div>}
              {c.lenses.developer && <div className="panel lens"><strong>Developer</strong><span>{c.lenses.developer}</span></div>}
            </div>
          )}

          {c.sandbox && (
            <div className="panel try-box">
              <div>
                <strong>{SANDBOX_LABEL[c.sandbox]}</strong>
                <div className="muted" style={{ fontSize: 'var(--step--1)' }}>Run a group of contracts through the IFRS 17 engine and follow this concept.</div>
              </div>
              <Link className="btn btn-primary" to={`/sandbox#${c.sandbox}`}>Open sandbox <Icon name="arrow" /></Link>
            </div>
          )}

          <nav className="pager" aria-label="Next and previous">
            {prev ? <Link to={`/concept/${prev.id}`}><small>Previous</small>{prev.title}</Link> : <span />}
            {next ? <Link to={`/concept/${next.id}`} style={{ textAlign: 'right' }}><small>Next</small>{next.title}</Link> : <Link to={`/learn/${track.id}`} style={{ textAlign: 'right' }}><small>Finished</small>Back to the track</Link>}
          </nav>
        </article>

        <aside className="rail" aria-label="References and related concepts">
          <div className="panel rail-box">
            <h4>Standard references</h4>
            <div className="refs">{c.refs.map((r) => <span className="chip" key={r}>{r}</span>)}</div>
          </div>
          {groups.size > 0 && (
            <div className="panel rail-box">
              <h4>Connect the dots</h4>
              <div className="dots">
                {[...groups.entries()].map(([label, items]) => (
                  <div className="dots-group" key={label}>
                    <span>{label}</span>
                    {items.map((r) => <Link key={r.concept.id} to={`/concept/${r.concept.id}`}>{r.concept.title}</Link>)}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}><Link to={`/map?focus=${c.id}`} style={{ fontSize: 'var(--step--1)' }}>Show on the concept map</Link></div>
            </div>
          )}
          <div className="panel rail-box">
            <h4>Review</h4>
            <div className="review">
              <span><b>Status:</b> {CONTENT_STATUS}</span>
              <span><b>Content version:</b> {CONTENT_VERSION}</span>
              <span><b>Applies to:</b> {c.track === 'C' ? 'CCH Tagetik IFRS 17 solution (release to be validated)' : c.track === 'B' ? 'IFRS 17 as amended June 2020' : 'IFRS Accounting Standards'}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

