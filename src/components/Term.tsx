import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GLOSSARY_BY_ID } from '../content'

/** A glossary term with a hover and focus card. */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const g = GLOSSARY_BY_ID[id]
  const [open, setOpen] = useState(false)
  const cardId = useId()
  if (!g) return <>{children}</>
  return (
    <span
      style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="term"
        aria-describedby={open ? cardId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        {children}
      </button>
      {open && (
        <span className="term-card" id={cardId} role="tooltip">
          <strong>{g.term}{g.abbr ? ` (${g.abbr})` : ''}</strong>
          {g.definition}
          {g.concept && (
            <>
              {' '}
              <Link to={`/concept/${g.concept}`}>Read more</Link>
            </>
          )}
        </span>
      )}
    </span>
  )
}
