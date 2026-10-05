import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DecisionOutcome, DecisionQuestion, DecisionTree as Tree } from '../content/decisions'
import { CONCEPT_BY_ID } from '../content'
import { Icon } from './Icon'
import { Inline } from './RichText'

interface Step { node: string; choice: number }

const TONE_LABEL: Record<DecisionOutcome['tone'], string> = { in: 'Result', out: 'Result', choice: 'Result: a choice or a further test' }

/** Walks a learner through one classification question, keeping a trail of every answer given. */
export function DecisionTree({ tree }: { tree: Tree }) {
  const [trail, setTrail] = useState<Step[]>([])
  const current = trail.length ? (tree.nodes[trail[trail.length - 1].node] as DecisionQuestion).options[trail[trail.length - 1].choice].next : tree.start
  const node = tree.nodes[current]

  const choose = (i: number) => setTrail((t) => [...t, { node: current, choice: i }])
  const back = () => setTrail((t) => t.slice(0, -1))
  const restart = () => setTrail([])
  const concept = CONCEPT_BY_ID[tree.concept]

  return (
    <div className="dtree">
      {trail.length > 0 && (
        <ol className="dtree-trail" aria-label="Your answers so far">
          {trail.map((s, i) => {
            const q = tree.nodes[s.node] as DecisionQuestion
            const o = q.options[s.choice]
            return (
              <li key={i}>
                <span className="dtree-q"><Inline text={q.text} /></span>
                <span className="dtree-a"><b>{o.label}</b>{o.note && <> · <Inline text={o.note} /></>}</span>
              </li>
            )
          })}
        </ol>
      )}

      {node.kind === 'question' ? (
        <fieldset className="panel dtree-node" aria-live="polite">
          <legend className="dtree-step">Question {trail.length + 1}</legend>
          <p className="dtree-text"><Inline text={node.text} /></p>
          {node.help && <p className="muted dtree-help"><Inline text={node.help} /></p>}
          <div className="dtree-options">
            {node.options.map((o, i) => (
              <button key={i} type="button" className="btn btn-ghost" onClick={() => choose(i)}>{o.label}</button>
            ))}
          </div>
          <div className="refs">{node.refs.map((r) => <span className="chip" key={r}>{r}</span>)}</div>
        </fieldset>
      ) : (
        <div className={`panel dtree-outcome tone-${node.tone}`} role="status">
          <small>{TONE_LABEL[node.tone]}</small>
          <h3>{node.title}</h3>
          <p><Inline text={node.text} /></p>
          <div className="refs">{node.refs.map((r) => <span className="chip" key={r}>{r}</span>)}</div>
          {node.next && <Link className="btn btn-primary" to={node.next.to}>{node.next.label} <Icon name="arrow" /></Link>}
        </div>
      )}

      <div className="row dtree-tools">
        {trail.length > 0 && <button type="button" className="btn btn-ghost" onClick={back}>Back one step</button>}
        {trail.length > 0 && <button type="button" className="link-btn" onClick={restart}>Start again</button>}
        {concept && <Link to={`/concept/${concept.id}`} className="dtree-concept">Read the page: {concept.title}</Link>}
      </div>
    </div>
  )
}
