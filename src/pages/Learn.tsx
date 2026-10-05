import { Link, useParams } from 'react-router-dom'
import { CONCEPT_BY_ID, TRACKS, TRACK_BY_ID } from '../content'
import { NotFound } from './NotFound'
import { Icon } from '../components/Icon'
import { MasteryBadge, MasteryLegend } from '../components/Mastery'
import { useMastery } from '../learning/useMastery'

export function Learn() {
  return (
    <>
      <div className="eyebrow">Learn</div>
      <h1 style={{ marginTop: 8 }}>Learning tracks</h1>
      <p className="hero-lede">Start with Foundations if accounting is new to you. Go straight to IFRS 17 if you know the basics. Use the Tagetik track when you are designing or building a system.</p>
      <MasteryLegend />
      {TRACKS.map((t) => (
        <section className="section" key={t.id} style={{ marginTop: 40 }}>
          <div className="section-head">
            <div>
              <span className="track-letter">Track {t.id}</span>
              <h2 style={{ marginTop: 4 }}>{t.title}</h2>
              <p>{t.tagline}. {t.audience}.</p>
            </div>
            <Link to={`/learn/${t.id}`}>Open track</Link>
          </div>
          <ModuleList trackId={t.id} />
        </section>
      ))}
    </>
  )
}

function ModuleList({ trackId }: { trackId: string }) {
  const mastery = useMastery()
  const t = TRACK_BY_ID[trackId]
  return (
    <div className="panel module-list">
      {t.modules.map((m) => (
        <div className="module" key={m.code}>
          <span className="module-code">{m.code}</span>
          <div>
            <h3>{m.title}</h3>
            <p>{m.blurb}</p>
            {m.concepts.length > 0 && (
              <div className="module-links">
                {m.concepts.map((id) => (
                  <Link key={id} to={`/concept/${id}`}>
                    {CONCEPT_BY_ID[id].title} <MasteryBadge level={mastery(id)} compact />
                  </Link>
                ))}
              </div>
            )}
          </div>
          {m.concepts.length === 0 ? <span className="soon tag">In production</span> : <span className="soon">{m.concepts.length} {m.concepts.length === 1 ? 'page' : 'pages'}</span>}
        </div>
      ))}
    </div>
  )
}

export function TrackPage() {
  const { trackId = '' } = useParams()
  const t = TRACK_BY_ID[trackId]
  if (!t) return <NotFound />
  const first = t.modules.find((m) => m.concepts.length)?.concepts[0]
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/learn">Learn</Link><span>/</span><span>Track {t.id}</span></nav>
      <span className="track-letter">Track {t.id}</span>
      <h1 style={{ marginTop: 6 }}>{t.title}</h1>
      <p className="hero-lede">{t.tagline}. {t.audience}.</p>
      {first && <div className="hero-cta"><Link className="btn btn-primary" to={`/concept/${first}`}>Start the track <Icon name="arrow" /></Link></div>}
      {t.id === 'C' && (
        <div className="callout validation">
          This track describes implementation patterns. CCH Tagetik object names, screens and options vary by release and must be validated in a licensed environment before you rely on them.
        </div>
      )}
      <div style={{ marginTop: 28 }}><ModuleList trackId={t.id} /></div>
    </>
  )
}
