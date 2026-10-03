import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CONCEPT_BY_ID, CONTENT_STATUS, CONTENT_VERSION, EDGE_LABEL, QUIZ_BY_ID, TRACK_BY_ID, relatedOf, type Depth,
} from '../content'
import { Quiz } from '../components/Quiz'
import { MISSIONS } from '../engine/missions'
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

/** Labs that demonstrate a concept beyond the measurement simulator. */
const LAB_FOR: Record<string, { to: string; title: string; text: string }> = {
  paa: { to: '/lab/paa', title: 'Compare the PAA with the GMM', text: 'Measure one group both ways and test whether the PAA is a reasonable approximation.' },
  discounting: { to: '/lab/discounting', title: 'Try the discounting lab', text: 'Discount factors, interest unwinding and what happens when rates move.' },
  'insurance-finance': { to: '/lab/discounting', title: 'Try the discounting lab', text: 'See finance expenses split between profit or loss and OCI.' },
  'tagetik-overview': { to: '/lab/pipeline', title: 'Walk the implementation pipeline', text: 'Load, validate, calculate, post, reconcile and drill back for one period.' },
  'tagetik-data-model': { to: '/lab/pipeline', title: 'Break the data, see the controls', text: 'Inject data errors and watch which validation rule catches each one.' },
  'tagetik-journals': { to: '/lab/pipeline', title: 'Trace a journal to its source', text: 'Follow a ledger line back to its movement record and source rows.' },
  'tagetik-testing': { to: '/lab/pipeline', title: 'See reconciliations in action', text: 'Six tie-outs between data, movements, ledger and disclosures.' },
}

const words = (xs: string[]) => xs.join(' ').split(/\s+/).length

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id])

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
  const minutes = Math.max(1, Math.round((words(body) + words([c.summary])) / 200))
  const lab = LAB_FOR[c.id]
  const missions = MISSIONS.filter((m) => m.concept === c.id)
  const quiz = QUIZ_BY_ID[c.id]

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
          <div className="eyebrow">Module {c.module} · {module?.title} · {minutes} min read</div>
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

          {lab && (
            <div className="panel try-box">
              <div>
                <strong>{lab.title}</strong>
                <div className="muted" style={{ fontSize: 'var(--step--1)' }}>{lab.text}</div>
              </div>
              <Link className="btn btn-primary" to={lab.to}>Open lab <Icon name="arrow" /></Link>
            </div>
          )}

          {missions.length > 0 && (
            <div className="panel try-box" style={{ background: 'var(--mark-soft)' }}>
              <div>
                <strong>Mission: {missions[0].title}</strong>
                <div className="muted" style={{ fontSize: 'var(--step--1)' }}>{missions[0].goal}</div>
              </div>
              <Link className="btn btn-ghost" to={`/sandbox?mission=${missions[0].id}`}><Icon name="flag" /> Take the mission</Link>
            </div>
          )}

          {quiz && quiz.length > 0 && <Quiz key={c.id} conceptId={c.id} questions={quiz} />}

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

