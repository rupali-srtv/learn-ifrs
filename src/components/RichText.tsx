import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPT_BY_ID, GLOSSARY_BY_ID } from '../content'
import type { Body } from '../content/types'
import { Term } from './Term'

const SPECIAL: Record<string, string> = {
  'measurement-sandbox': '/sandbox',
  'concept-map': '/map',
  glossary: '/glossary',
}

/** Renders inline [[id]] / [[id|label]] markup as concept links or glossary hover terms. */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const [, id, label] = m
    const concept = CONCEPT_BY_ID[id]
    const gloss = GLOSSARY_BY_ID[id]
    if (concept) parts.push(<Link key={i++} to={`/concept/${id}`}>{label ?? concept.title}</Link>)
    else if (SPECIAL[id]) parts.push(<Link key={i++} to={SPECIAL[id]}>{label ?? id}</Link>)
    else if (gloss) parts.push(<Term key={i++} id={id}>{label ?? gloss.term}</Term>)
    else parts.push(label ?? id)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

/** Renders a body: paragraphs, "- " bullets, "> " callouts and "$ " formulas. */
export function RichText({ body }: { body: Body }) {
  const out: ReactNode[] = []
  let bullets: string[] = []
  const flush = () => {
    if (bullets.length) {
      const items = bullets
      out.push(
        <ul key={`ul${out.length}`}>
          {items.map((b, i) => (
            <li key={i}><Inline text={b} /></li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }
  body.forEach((block, i) => {
    if (block.startsWith('- ')) {
      bullets.push(block.slice(2))
      return
    }
    flush()
    if (block.startsWith('> ')) out.push(<div className="callout" key={i}><Inline text={block.slice(2)} /></div>)
    else if (block.startsWith('$ ')) out.push(<div className="formula" key={i} role="math">{block.slice(2)}</div>)
    else out.push(<p key={i}><Inline text={block} /></p>)
  })
  flush()
  return <Fragment>{out}</Fragment>
}
