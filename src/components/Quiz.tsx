import { useState } from 'react'
import type { QuizQuestion } from '../content/types'
import { usePrefs } from '../prefs'
import { Inline } from './RichText'
import { quizItem } from '../learning/review'

export function Quiz({ conceptId, questions }: { conceptId: string; questions: QuizQuestion[] }) {
  const { quizScores, saveQuiz, studyAnswer } = usePrefs()
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null))
  const [attempt, setAttempt] = useState(0)
  const answered = picked.filter((p) => p !== null).length
  const score = picked.filter((p, i) => p === questions[i].answer).length
  const best = quizScores[conceptId]

  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== null) return
    const next = picked.map((p, i) => (i === qi ? oi : p))
    setPicked(next)
    studyAnswer(quizItem(conceptId, qi), oi === questions[qi].answer)
    if (next.every((p) => p !== null)) saveQuiz(conceptId, next.filter((p, i) => p === questions[i].answer).length, questions.length)
  }

  return (
    <section className="panel quiz" aria-labelledby={`quiz-${conceptId}`}>
      <div className="score">
        <h3 id={`quiz-${conceptId}`}>Check your understanding</h3>
        {best && <span className="tag">Best: {best.score} of {best.total}</span>}
      </div>
      {questions.map((q, qi) => {
        const p = picked[qi]
        return (
          <fieldset key={`${attempt}-${qi}`}>
            <legend>{qi + 1}. <Inline text={q.q} /></legend>
            {q.options.map((o, oi) => {
              const state = p === null ? '' : oi === q.answer ? 'right' : oi === p ? 'wrong' : ''
              return (
                <label key={oi} className={state}>
                  <input type="radio" name={`q-${conceptId}-${attempt}-${qi}`} checked={p === oi} disabled={p !== null} onChange={() => choose(qi, oi)} />
                  <span><Inline text={o} /></span>
                </label>
              )
            })}
            {p !== null && (
              <div className="why" role="status">
                <strong>{p === q.answer ? 'Correct. ' : 'Not quite. '}</strong>
                <Inline text={q.why} />
              </div>
            )}
          </fieldset>
        )
      })}
      {answered === questions.length && (
        <div className="score">
          <strong>You scored {score} of {questions.length}.</strong>
          <button type="button" className="btn btn-ghost" onClick={() => { setPicked(questions.map(() => null)); setAttempt((a) => a + 1) }}>Try again</button>
        </div>
      )}
    </section>
  )
}
