import { useState } from 'react'
import { checkNumeric, type NumericQuestion, type NumericVerdict } from '../content/numeric'
import { TBIC_GROUPS } from '../engine/tbic'
import { numericItem } from '../learning/review'
import { usePrefs } from '../prefs'
import { Icon } from './Icon'
import { Inline } from './RichText'
import { n1 } from '../content/tbic-figures'

/**
 * One numeric question. `onAnswered` fires on the first checked answer only, which is the one that counts
 * for review; later attempts still get feedback.
 */
export function NumericCard({ q, onAnswered, showRefs = true }: { q: NumericQuestion; onAnswered?: (correct: boolean) => void; showRefs?: boolean }) {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<NumericVerdict | null>(null)
  const [first, setFirst] = useState(true)
  const [showWork, setShowWork] = useState(false)
  const inputId = `num-${q.id}`

  const check = () => {
    const v = checkNumeric(q, value)
    setVerdict(v)
    if (v.kind === 'invalid') return
    if (first) {
      setFirst(false)
      onAnswered?.(v.kind === 'correct')
    }
    if (v.kind === 'correct') setShowWork(true)
  }

  return (
    <div className="numeric">
      <div className="numeric-group">{TBIC_GROUPS[q.group].name}</div>
      <label htmlFor={inputId} className="numeric-prompt"><Inline text={q.prompt} /></label>
      <form className="numeric-answer" onSubmit={(e) => { e.preventDefault(); check() }}>
        <span className="numeric-unit" aria-hidden="true">₹</span>
        <input
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={verdict ? `${inputId}-v` : undefined}
          placeholder="0.0"
        />
        <span className="numeric-unit">lakh</span>
        <button type="submit" className="btn btn-primary" disabled={!value.trim()}>Check</button>
        <button type="button" className="link-btn" onClick={() => setShowWork((s) => !s)} aria-expanded={showWork}>
          {showWork ? 'Hide the working' : 'Show the working'}
        </button>
      </form>
      {verdict && (
        <div id={`${inputId}-v`} role="status" className={`panel verdict ${verdict.kind === 'correct' ? 'good' : verdict.kind === 'invalid' ? 'warn' : 'bad'}`}>
          <Icon name={verdict.kind === 'correct' ? 'check' : 'warn'} size={20} />
          <div>
            {verdict.kind === 'correct' && <><strong>Correct.</strong> The answer is ₹{n1(q.answer)} lakh.</>}
            {verdict.kind === 'mistake' && <><strong>Not quite, and here is why.</strong> {verdict.message}</>}
            {verdict.kind === 'wrong' && <><strong>Not quite.</strong> Try again, or open the working to see each step.</>}
            {verdict.kind === 'invalid' && <>Type a number in ₹ lakh, for example 774.2.</>}
          </div>
        </div>
      )}
      {showWork && (
        <ol className="numeric-work">
          {q.solution.map((s, i) => <li key={i}><Inline text={s} /></li>)}
        </ol>
      )}
      {showRefs && <div className="refs">{q.refs.map((r) => <span className="chip" key={r}>{r}</span>)}</div>}
    </div>
  )
}

/** All numeric questions for a concept, recorded for mastery and review. */
export function NumericSet({ questions }: { questions: NumericQuestion[] }) {
  const { recordNumeric, studyAnswer, numericSolved } = usePrefs()
  const solved = questions.filter((q) => numericSolved[q.id]).length
  return (
    <section className="panel numeric-set" aria-labelledby="numeric-head">
      <div className="score">
        <h3 id="numeric-head">Work it out with TBIC</h3>
        <span className="tag">{solved} of {questions.length} solved</span>
      </div>
      <p className="muted numeric-intro">Type your answer in ₹ lakh to one decimal place. Small rounding differences are accepted.</p>
      {questions.map((q) => (
        <NumericCard
          key={q.id}
          q={q}
          onAnswered={(correct) => {
            recordNumeric(q.id, correct)
            studyAnswer(numericItem(q.id), correct)
          }}
        />
      ))}
    </section>
  )
}
