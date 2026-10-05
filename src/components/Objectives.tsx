import { Link } from 'react-router-dom'
import { CONCEPT_BY_ID } from '../content'
import type { PageGoals } from '../content/objectives'
import { useMastery } from '../learning/useMastery'
import { MasteryBadge } from './Mastery'

/** What the page teaches, and what to read first. */
export function Objectives({ goals }: { goals: PageGoals }) {
  const mastery = useMastery()
  return (
    <section className="panel objectives" aria-label="Learning objectives">
      <div>
        <h4>After this page you can</h4>
        <ul>{goals.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
      </div>
      <div>
        <h4>Read first</h4>
        {goals.prerequisites.length === 0 ? (
          <p className="muted">Nothing. This page is a starting point.</p>
        ) : (
          <ul className="prereqs">
            {goals.prerequisites.map((id) => (
              <li key={id}>
                <Link to={`/concept/${id}`}>{CONCEPT_BY_ID[id].title}</Link> <MasteryBadge level={mastery(id)} compact />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
