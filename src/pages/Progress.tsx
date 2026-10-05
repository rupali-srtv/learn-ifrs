import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPT_BY_ID, QUIZ_BY_ID, TRACKS } from '../content'
import { MISSIONS } from '../engine/missions'
import { usePrefs } from '../prefs'
import { Icon } from '../components/Icon'
import { MasteryLegend } from '../components/Mastery'
import { useMastery } from '../learning/useMastery'
import { NUMERIC_QUESTIONS } from '../content/numeric'
import { dueItems } from '../learning/review'

export function Progress() {
  const { visited, lastConcept, missionsDone, quizScores, numericSolved, review, resetProgress } = usePrefs()
  const mastery = useMastery()
  const [confirm, setConfirm] = useState(false)
  const all = TRACKS.flatMap((t) => t.modules.flatMap((m) => m.concepts))
  const read = all.filter((id) => visited.includes(id)).length
  const quizIds = Object.keys(QUIZ_BY_ID).filter((id) => QUIZ_BY_ID[id].length)
  const taken = quizIds.filter((id) => quizScores[id])
  const right = taken.reduce((a, id) => a + quizScores[id].score, 0)
  const asked = taken.reduce((a, id) => a + quizScores[id].total, 0)
  const last = lastConcept ? CONCEPT_BY_ID[lastConcept] : null
  // Next unread page in track order after the last one read, else the first unread page.
  const nextUnread = (() => {
    const from = lastConcept ? all.indexOf(lastConcept) : -1
    return [...all.slice(from + 1), ...all.slice(0, from + 1)].find((id) => !visited.includes(id))
  })()
  const mastered = all.filter((id) => mastery(id) === 'mastered').length
  const solved = NUMERIC_QUESTIONS.filter((q) => numericSolved[q.id]).length
  const due = dueItems(review).length
  const toRetry = taken.filter((id) => quizScores[id].score < quizScores[id].total)

  return (
    <>
      <div className="eyebrow">Your progress</div>
      <h1 style={{ marginTop: 8 }}>Where you are</h1>
      <p className="hero-lede">Progress is kept in this browser only. Nothing is sent anywhere, and clearing your browser data resets it.</p>

      {(last || nextUnread) && (
        <div className="panel continue" style={{ marginTop: 24 }}>
          <div>
            <small>{last ? 'Continue where you left off' : 'Start here'}</small>
            <strong>{last ? last.title : CONCEPT_BY_ID[nextUnread!].title}</strong>
          </div>
          <div className="row">
            {last && <Link className="btn btn-ghost" to={`/concept/${last.id}`}>Reopen</Link>}
            {nextUnread && <Link className="btn btn-primary" to={`/concept/${nextUnread}`}>Next unread: {CONCEPT_BY_ID[nextUnread].title} <Icon name="arrow" /></Link>}
          </div>
        </div>
      )}

      <div className="panel stat-grid" style={{ marginTop: 20 }}>
        <div><b>{read} / {all.length}</b><span>Pages read</span></div>
        <div><b>{taken.length} / {quizIds.length}</b><span>Knowledge checks taken</span></div>
        <div><b>{asked ? Math.round((right / asked) * 100) : 0}%</b><span>Best-attempt quiz score</span></div>
        <div><b>{missionsDone.length} / {MISSIONS.length}</b><span>Lab missions complete</span></div>
        <div><b>{mastered} / {all.length}</b><span>Pages mastered</span></div>
        <div><b>{solved} / {NUMERIC_QUESTIONS.length}</b><span>TBIC numeric questions solved</span></div>
        <div><b>{due}</b><span>Review cards due today</span></div>
      </div>
      {due > 0 && <div className="row" style={{ marginTop: 12 }}><Link className="btn btn-primary" to="/review">Start today’s review <Icon name="arrow" /></Link></div>}
      <MasteryLegend />

      <section className="section">
        <div className="section-head"><div><h2>By track</h2></div></div>
        <div className="grid cols-3">
          {TRACKS.map((t) => (
            <div key={t.id} className="panel" style={{ padding: 18 }}>
              <span className="track-letter">Track {t.id}</span>
              <h3 style={{ margin: '4px 0 12px' }}>{t.title}</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {t.modules.map((m) => {
                  const done = m.concepts.filter((id) => visited.includes(id)).length
                  const m2 = m.concepts.filter((id) => mastery(id) === 'mastered').length
                  return (
                    <div key={m.code}>
                      <div className="row" style={{ justifyContent: 'space-between', fontSize: 'var(--step--1)' }}>
                        <Link to={m.concepts[0] ? `/concept/${m.concepts[0]}` : `/learn/${t.id}`}>{m.code} {m.title}</Link>
                        <span className="muted">{done}/{m.concepts.length} read{m2 ? ` · ${m2} mastered` : ''}</span>
                      </div>
                      <div className="progress" style={{ marginTop: 4 }}><span style={{ width: `${m.concepts.length ? (done / m.concepts.length) * 100 : 0}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div><h2>Knowledge checks</h2><p>{toRetry.length ? 'Worth another look: checks where you missed a question.' : 'Every concept with a check, and your best score.'}</p></div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th scope="col">Concept</th><th scope="col">Best score</th></tr></thead>
            <tbody>
              {quizIds.map((id) => (
                <tr key={id}>
                  <td style={{ textAlign: 'left' }}><Link to={`/concept/${id}`}>{CONCEPT_BY_ID[id]?.title ?? id}</Link></td>
                  <td>{quizScores[id] ? `${quizScores[id].score} of ${quizScores[id].total}` : <span className="muted">Not taken</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><div><h2>Missions</h2></div><Link to="/lab">Open Labs</Link></div>
        <div className="panel mission-list">
          {MISSIONS.map((m, i) => {
            const d = missionsDone.includes(m.id)
            return (
              <Link key={m.id} to={`/sandbox?mission=${m.id}`} className={`mission-row${d ? ' done' : ''}`}>
                <span className="state">{d ? <Icon name="check" size={14} /> : i + 1}</span>
                <span><strong>{m.title}</strong><span className="goal">{m.goal}</span></span>
                <span className="tag">{d ? 'Done' : m.level}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section">
        {confirm ? (
          <div className="panel verdict warn">
            <Icon name="warn" size={20} />
            <div>
              <strong>Reset all progress?</strong> Pages read, quiz scores, numeric answers, your review queue and missions will be cleared from this browser.
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btn-primary" onClick={() => { resetProgress(); setConfirm(false) }}>Reset</button>
                <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Reset progress</button>
        )}
      </section>
    </>
  )
}
