import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GLOSSARY } from '../content'

export function Glossary() {
  const [q, setQ] = useState('')
  const items = useMemo(() => {
    const s = q.trim().toLowerCase()
    return [...GLOSSARY]
      .sort((a, b) => a.term.localeCompare(b.term))
      .filter((g) => !s || `${g.term} ${g.abbr ?? ''} ${g.definition}`.toLowerCase().includes(s))
  }, [q])
  return (
    <>
      <div className="eyebrow">Reference</div>
      <h1 style={{ marginTop: 8 }}>Glossary</h1>
      <p className="hero-lede">Plain-English definitions of the terms used across IFRS 17 and its implementation. The same definitions appear as hover cards in the learning pages.</p>
      <div style={{ marginTop: 20 }}>
        <label htmlFor="gloss-q" className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Filter terms</label>
        <input id="gloss-q" className="gloss-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. coverage, LIC, OCI" />
      </div>
      <div className="gloss-list">
        {items.map((g) => (
          <div key={g.id} className="panel gloss-item" id={g.id}>
            <h3>{g.term} {g.abbr && <small>{g.abbr}</small>}</h3>
            <p>{g.definition}</p>
            {g.concept && <Link to={`/concept/${g.concept}`} style={{ fontSize: 'var(--step--1)' }}>Go to the concept page</Link>}
          </div>
        ))}
        {items.length === 0 && <p className="muted">No terms match “{q}”.</p>}
      </div>
    </>
  )
}
