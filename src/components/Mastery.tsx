import { MASTERY_LABEL, type MasteryLevel } from '../learning/mastery'
import { Icon } from './Icon'

const GLYPH: Record<MasteryLevel, string> = { new: '', read: '', practised: '', mastered: 'check' }

/** A small badge showing how far a learner has taken a concept. */
export function MasteryBadge({ level, compact = false }: { level: MasteryLevel; compact?: boolean }) {
  if (compact && level === 'new') return null
  return (
    <span className={`mastery mastery-${level}`} title={MASTERY_LABEL[level]}>
      {GLYPH[level] ? <Icon name={GLYPH[level]} size={12} /> : <span className="mastery-dot" aria-hidden="true" />}
      {compact ? <span className="sr-only">{MASTERY_LABEL[level]}</span> : MASTERY_LABEL[level]}
    </span>
  )
}

export function MasteryLegend() {
  return (
    <p className="mastery-legend">
      <MasteryBadge level="read" /> page opened
      <MasteryBadge level="practised" /> a check attempted
      <MasteryBadge level="mastered" /> every check on the page answered correctly
    </p>
  )
}
