import { Link } from 'react-router-dom'
import { MISSIONS } from '../../engine/missions'
import { usePrefs } from '../../prefs'
import { Icon } from '../../components/Icon'

export const LABS = [
  {
    to: '/sandbox',
    title: 'Measurement simulator',
    blurb: 'One group under the General Measurement Model. Change premiums, claims, rates or the outlook and watch the CSM, liabilities, journals and disclosures move together.',
    tags: ['GMM', 'CSM bridge', 'Journals', 'Disclosures'],
  },
  {
    to: '/lab/paa',
    title: 'PAA versus GMM',
    blurb: 'Measure the same group both ways. See where revenue and the liability differ, test whether the PAA is a reasonable approximation, and why lifetime profit is the same.',
    tags: ['IFRS 17.53', 'Eligibility', 'Revenue pattern'],
  },
  {
    to: '/lab/discounting',
    title: 'Discounting and interest',
    blurb: 'Discount factors, present values and how interest unwinds into insurance finance expense. Move rates after day one to see current versus locked-in effects.',
    tags: ['IFRS 17.36', 'B72', 'OCI option'],
  },
  {
    to: '/decide',
    title: 'Decision trees',
    blurb: 'Six classification questions as clickable trees: scope, separating components, the contract boundary, PAA eligibility, the VFA test and grouping. Every question cites its paragraph.',
    tags: ['Scope', 'PAA', 'VFA', 'Grouping'],
  },
  {
    to: '/lab/pipeline',
    title: 'Implementation pipeline',
    blurb: 'Follow numbers through the chain a CCH Tagetik solution builds: load, validate, calculate movements, post, reconcile and drill back. Break the data and watch the controls catch it.',
    tags: ['Data quality', 'Posting rules', 'Audit trail'],
  },
]

export function LabHub() {
  const { missionsDone } = usePrefs()
  const done = MISSIONS.filter((m) => missionsDone.includes(m.id)).length
  const nextMission = MISSIONS.find((m) => !missionsDone.includes(m.id))
  return (
    <>
      <div className="eyebrow">Labs</div>
      <h1 style={{ marginTop: 8 }}>Learn by changing the numbers</h1>
      <p className="hero-lede">
        Every lab runs the same calculation engine, and every number links back to the concept that explains it. Nothing you do here is saved
        anywhere except your own browser.
      </p>

      <div className="grid cols-2" style={{ marginTop: 28 }}>
        {LABS.map((l) => (
          <Link key={l.to} to={l.to} className="panel lab-card">
            <div className="lab-ico"><Icon name="lab" size={20} /></div>
            <h3>{l.title}</h3>
            <p>{l.blurb}</p>
            <div className="lab-meta">{l.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Missions</h2>
            <p>Short challenges in the measurement simulator. Each one has a goal, a hint and a lesson that appears once you reach it.</p>
          </div>
          <div className="row">
            <span className="muted">{done} of {MISSIONS.length} complete</span>
            {nextMission && <Link className="btn btn-primary" to={`/sandbox?mission=${nextMission.id}`}><Icon name="play" size={14} /> {done ? 'Continue' : 'Start'} missions</Link>}
          </div>
        </div>
        <div className="progress" style={{ marginBottom: 16 }}><span style={{ width: `${(done / MISSIONS.length) * 100}%` }} /></div>
        <div className="panel mission-list">
          {MISSIONS.map((m, i) => {
            const isDone = missionsDone.includes(m.id)
            return (
              <Link key={m.id} to={`/sandbox?mission=${m.id}`} className={`mission-row${isDone ? ' done' : ''}`}>
                <span className="state" aria-label={isDone ? 'Complete' : 'Not started'}>{isDone ? <Icon name="check" size={14} /> : i + 1}</span>
                <span>
                  <strong>{m.title}</strong>
                  <span className="goal">{m.goal}</span>
                </span>
                <span className="tag">{m.level}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
