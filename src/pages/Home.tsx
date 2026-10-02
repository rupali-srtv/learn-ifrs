import { Link } from 'react-router-dom'
import { CONCEPTS, ROLES, TRACKS } from '../content'
import { usePrefs } from '../prefs'
import { Icon } from '../components/Icon'

const CHAIN = [
  { n: '1', title: 'Concept', text: 'CSM: the unearned profit held back on day one', to: '/concept/csm' },
  { n: '2', title: 'Calculation', text: 'Roll the CSM forward: accrete, adjust, release', to: '/sandbox' },
  { n: '3', title: 'Journal entry', text: 'Debit LRC, credit insurance revenue', to: '/concept/insurance-revenue' },
  { n: '4', title: 'Disclosure', text: 'CSM line in the IFRS 17.101 reconciliation', to: '/concept/disclosures' },
  { n: '5', title: 'Tagetik build', text: 'Calculation rules, posting scheme, disclosure report', to: '/concept/tagetik-csm-build' },
]

export function Home() {
  const { role, setRole, visited } = usePrefs()
  const current = ROLES.find((r) => r.id === role)
  const start = current ? CONCEPTS.find((c) => c.id === current.start) : null

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">IFRS · IFRS 17 · CCH Tagetik</div>
          <h1 style={{ marginTop: 12 }}>
            Understand the standard, <em>see the numbers move</em>, then build it.
          </h1>
          <p className="hero-lede">
            A learning portal for everyone who touches insurance reporting: from first-day graduates to audit partners,
            actuaries and Tagetik architects. Every concept links to its calculation, its journal entry, its disclosure and its
            implementation.
          </p>
          <div className="hero-cta row">
            <Link className="btn btn-primary" to={start ? `/concept/${start.id}` : '/learn'}>
              {start ? `Start: ${start.title}` : 'Start learning'} <Icon name="arrow" />
            </Link>
            <Link className="btn btn-ghost" to="/sandbox">Open the IFRS 17 sandbox</Link>
          </div>
          <div style={{ marginTop: 28 }}>
            <div className="eyebrow">I am</div>
            <div className="role-picker" role="group" aria-label="Choose your role">
              {ROLES.map((r) => (
                <button key={r.id} aria-pressed={role === r.id} onClick={() => setRole(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 'var(--step--1)' }}>
              {current
                ? `Pages open at the ${current.depth === 'explain' ? 'Explain' : current.depth === 'apply' ? 'Apply' : 'Implement'} level for you. You can switch on any page.`
                : 'Your role sets the default depth and where to start. Nothing is locked.'}
            </p>
          </div>
        </div>
        <div className="panel chain" aria-label="How one concept connects">
          <div className="eyebrow" style={{ marginBottom: 6 }}>One concept, five connected views</div>
          {CHAIN.map((s) => (
            <Link key={s.n} to={s.to} className="chain-step" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="chain-dot">{s.n}</span>
              <div>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Three tracks, one knowledge graph</h2>
            <p>Follow a track in order, or jump sideways from any page to the related calculation, entry, disclosure or Tagetik build.</p>
          </div>
          <Link to="/learn">All modules</Link>
        </div>
        <div className="grid cols-3">
          {TRACKS.map((t) => {
            const ids = t.modules.flatMap((m) => m.concepts)
            const done = ids.filter((id) => visited.includes(id)).length
            return (
              <Link key={t.id} to={`/learn/${t.id}`} className="panel track-card">
                <span className="track-letter">Track {t.id}</span>
                <h3>{t.title}</h3>
                <p>{t.tagline}</p>
                <div className="progress" aria-label={`${done} of ${ids.length} pages read`}><span style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} /></div>
                <div className="track-meta">
                  <span>{t.modules.length} modules · {ids.length} pages live</span>
                  <span>{t.audience}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Learn by doing</h2>
            <p>The sandbox, journals and disclosures share one tested calculation engine, so every number ties across views.</p>
          </div>
        </div>
        <div className="grid cols-feat">
          <Link to="/sandbox" className="panel feature">
            <span className="eyebrow">Sandbox</span>
            <h3>IFRS 17 measurement simulator</h3>
            <p>Change premiums, claims, discount rate or the claims outlook and watch the CSM, LRC, LIC and profit move year by year.</p>
          </Link>
          <Link to="/sandbox#journals" className="panel feature">
            <span className="eyebrow">Journals</span>
            <h3>Every entry, every year</h3>
            <p>See the double entries a year produces and how they post to the liability and income statement lines.</p>
          </Link>
          <Link to="/sandbox#disclosures" className="panel feature">
            <span className="eyebrow">Disclosures</span>
            <h3>Reconciliations that tie</h3>
            <p>The IFRS 17.103, 104 and 106 tables generated from the same run, with a tie-out check on every column.</p>
          </Link>
          <Link to="/map" className="panel feature">
            <span className="eyebrow">Concept map</span>
            <h3>See how it all connects</h3>
            <p>Explore the knowledge graph from foundations to Tagetik objects. Pick a node to light up its links.</p>
          </Link>
          <Link to="/glossary" className="panel feature">
            <span className="eyebrow">Glossary</span>
            <h3>No jargon walls</h3>
            <p>Every IFRS 17 term in plain English, with hover cards wherever it appears in the text.</p>
          </Link>
          <Link to="/concept/tagetik-overview" className="panel feature">
            <span className="eyebrow">Implementation</span>
            <h3>From standard to system</h3>
            <p>The end-to-end chain in CCH Tagetik: data, calculation, accounting, reporting and control.</p>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="panel trust-strip">
          <div>
            <strong>Cited to the paragraph</strong>
            <p>Every page lists the IFRS 17 paragraphs it explains, in the margin.</p>
          </div>
          <div>
            <strong>Tested calculations</strong>
            <p>Engine checks prove lifetime profit equals net cash and every reconciliation ties.</p>
          </div>
          <div>
            <strong>Reviewed and versioned</strong>
            <p>Each page shows its review status, content version and the release it applies to.</p>
          </div>
          <div>
            <strong>Independent</strong>
            <p>Written from first principles; not affiliated with the IFRS Foundation or Wolters Kluwer.</p>
          </div>
        </div>
      </section>
    </>
  )
}
