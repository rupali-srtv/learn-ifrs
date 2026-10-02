import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CONCEPTS, GLOSSARY } from '../content'

interface Hit {
  to: string
  title: string
  sub: string
  score: number
}

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const nav = useNavigate()

  useEffect(() => input.current?.focus(), [])

  const hits = useMemo<Hit[]>(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) {
      return CONCEPTS.filter((c) => ['csm', 'gmm', 'insurance-revenue', 'onerous-contracts', 'tagetik-overview'].includes(c.id)).map((c) => ({
        to: `/concept/${c.id}`, title: c.title, sub: `${c.module} · suggested`, score: 0,
      }))
    }
    const score = (hay: string, weight: number) =>
      terms.every((t) => hay.includes(t)) ? weight : 0
    const out: Hit[] = []
    for (const c of CONCEPTS) {
      const s = score(c.title.toLowerCase(), 10) + score(c.summary.toLowerCase(), 4) +
        score([...c.explain, ...c.apply, ...c.implement, ...c.refs].join(' ').toLowerCase(), 1)
      if (s) out.push({ to: `/concept/${c.id}`, title: c.title, sub: `${c.module} · ${c.refs[0]}`, score: s })
    }
    for (const g of GLOSSARY) {
      const s = score(`${g.term} ${g.abbr ?? ''}`.toLowerCase(), 8) + score(g.definition.toLowerCase(), 2)
      if (s) out.push({ to: g.concept ? `/concept/${g.concept}` : '/glossary', title: g.term + (g.abbr ? ` (${g.abbr})` : ''), sub: `Glossary · ${g.definition}`, score: s })
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 12)
  }, [q])

  useEffect(() => setSel(0), [q])

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={input}
          id="site-search"
          value={q}
          placeholder="Search concepts, terms or paragraphs, e.g. CSM, coverage units, 17.44"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
            if (e.key === 'Enter' && hits[sel]) { nav(hits[sel].to); onClose() }
          }}
          aria-label="Search"
        />
        <div className="search-results" role="listbox">
          {hits.length === 0 && <p className="muted" style={{ padding: 12 }}>No matches. Try a shorter term.</p>}
          {hits.map((h, i) => (
            <Link key={h.to + h.title} to={h.to} className={i === sel ? 'sel' : ''} onClick={onClose} role="option" aria-selected={i === sel}>
              <span>{h.title}</span>
              <small>{h.sub.length > 110 ? h.sub.slice(0, 110) + '…' : h.sub}</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
