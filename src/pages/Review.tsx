import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPT_BY_ID, QUIZ_BY_ID } from '../content'
import { NUMERIC_BY_ID } from '../content/numeric'
import type { QuizQuestion } from '../content/types'
import { INTERVALS, RETIRED, dueItems, isRetired, upcomingItems } from '../learning/review'
import { usePrefs } from '../prefs'
import { NumericCard } from '../components/Numeric'
import { Inline } from '../components/RichText'
import { Icon } from '../components/Icon'

type Resolved =
  | { kind: 'quiz'; id: string; concept: string; q: QuizQuestion }
  | { kind: 'numeric'; id: string; concept: string; q: (typeof NUMERIC_BY_ID)[string] }

/** Turns a review item id back into its question, or null if the content has since changed. */
export function resolveItem(id: string): Resolved | null {
  const [kind, a, b] = id.split(':')
  if (kind === 'q') {
    const q = QUIZ_BY_ID[a]?.[Number(b)]
    return q ? { kind: 'quiz', id, concept: a, q } : null
  }
  if (kind === 'n') {
    const q = NUMERIC_BY_ID[a]
    return q ? { kind: 'numeric', id, concept: q.concept, q } : null
  }
  return null
}

export function Review() {
  const { review, reviewAnswer } = usePrefs()
  const valid = (ids: string[]) => ids.filter((id) => resolveItem(id))
  const due = valid(dueItems(review))
  const upcoming = valid(upcomingItems(review))
  const retired = Object.values(review).filter(isRetired).length
  // The session works from a snapshot so that answering a card does not reshuffle the queue mid-session.
  const [queue, setQueue] = useState<string[] | null>(null)
  const [pos, setPos] = useState(0)
  const [right, setRight] = useState(0)

  const start = (ids: string[]) => { setQueue(ids); setPos(0); setRight(0) }

  if (queue && pos < queue.length) {
    const item = resolveItem(queue[pos])!
    const concept = CONCEPT_BY_ID[item.concept]
    const answered = (correct: boolean) => {
      reviewAnswer(item.id, correct)
      if (correct) setRight((r) => r + 1)
    }
    return (
      <>
        <div className="eyebrow">Review · card {pos + 1} of {queue.length}</div>
        <div className="progress" style={{ margin: '12px 0 20px', maxWidth: '68ch' }}><span style={{ width: `${(pos / queue.length) * 100}%` }} /></div>
        <div className="review-card" key={item.id}>
          <p className="muted review-from">From <Link to={`/concept/${item.concept}`}>{concept?.title ?? item.concept}</Link></p>
          {item.kind === 'quiz'
            ? <ReviewQuiz q={item.q} name={item.id} onAnswered={answered} />
            : <NumericCard q={item.q} onAnswered={answered} />}
          <div className="row" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={() => setPos((p) => p + 1)}>{pos + 1 < queue.length ? 'Next card' : 'Finish'} <Icon name="arrow" /></button>
            <button type="button" className="link-btn" onClick={() => setQueue(null)}>Stop for now</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="eyebrow">Daily review</div>
      <h1 style={{ marginTop: 8 }}>Remember what you have learned</h1>
      <p className="hero-lede">
        Every question you answer on a page joins your review queue. A question you miss comes back tomorrow; one you get right comes back after
        3, 7, 16 and then 35 days. Answer it correctly each time and it retires as learned.
      </p>

      {queue && (
        <div className="panel verdict good" role="status" style={{ marginTop: 20, maxWidth: '68ch' }}>
          <Icon name="check" size={20} />
          <div><strong>Session complete.</strong> You answered {right} of {queue.length} correctly. Missed cards will be back tomorrow.</div>
        </div>
      )}

      <div className="panel stat-grid" style={{ marginTop: 20 }}>
        <div><b>{due.length}</b><span>Due today</span></div>
        <div><b>{upcoming.length}</b><span>Coming up</span></div>
        <div><b>{retired}</b><span>Retired as learned</span></div>
      </div>

      <div className="row" style={{ marginTop: 20 }}>
        {due.length > 0 && <button type="button" className="btn btn-primary" onClick={() => start(due)}>Review {due.length} due {due.length === 1 ? 'card' : 'cards'} <Icon name="arrow" /></button>}
        {due.length === 0 && upcoming.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => start(upcoming.slice(0, 10))}>Practise early: next {Math.min(10, upcoming.length)} cards</button>}
      </div>

      {due.length === 0 && upcoming.length === 0 && (
        <div className="panel empty-review" style={{ marginTop: 20, maxWidth: '68ch' }}>
          <strong>Nothing to review yet.</strong>
          <p className="muted">
            Answer the knowledge check or the TBIC numeric questions on any page and those questions will appear here when they are due.
            The <Link to="/concept/csm">contractual service margin</Link> page is a good place to start.
          </p>
        </div>
      )}

      {due.length === 0 && upcoming.length > 0 && <p className="muted" style={{ marginTop: 12 }}>Nothing is due today. Practising early counts as a review: a right answer moves a card to its next box, a wrong one brings it back tomorrow.</p>}

      <section className="section">
        <div className="section-head"><div><h2>How the boxes work</h2></div></div>
        <div className="table-wrap" style={{ maxWidth: '68ch' }}>
          <table className="data">
            <thead><tr><th scope="col">Box</th><th scope="col">Next review after a correct answer</th><th scope="col">Cards</th></tr></thead>
            <tbody>
              {INTERVALS.map((_, b) => (
                <tr key={b}>
                  <td>{b === 0 ? 'Box 0 (missed)' : `Box ${b}`}</td>
                  <td>{b + 1 < RETIRED ? `${INTERVALS[b + 1]} days` : 'Retires as learned'}</td>
                  <td>{Object.values(review).filter((c) => c.box === b).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function ReviewQuiz({ q, name, onAnswered }: { q: QuizQuestion; name: string; onAnswered: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <fieldset className="panel quiz review-quiz">
      <legend><Inline text={q.q} /></legend>
      {q.options.map((o, oi) => {
        const state = picked === null ? '' : oi === q.answer ? 'right' : oi === picked ? 'wrong' : ''
        return (
          <label key={oi} className={state}>
            <input type="radio" name={name} checked={picked === oi} disabled={picked !== null} onChange={() => { setPicked(oi); onAnswered(oi === q.answer) }} />
            <span><Inline text={o} /></span>
          </label>
        )
      })}
      {picked !== null && (
        <div className="why" role="status">
          <strong>{picked === q.answer ? 'Correct. ' : 'Not quite. '}</strong>
          <Inline text={q.why} />
        </div>
      )}
    </fieldset>
  )
}
