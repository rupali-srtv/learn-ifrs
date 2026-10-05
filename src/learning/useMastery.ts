import { QUIZ_BY_ID } from '../content'
import { NUMERIC_BY_CONCEPT } from '../content/numeric'
import { usePrefs } from '../prefs'
import { masteryOf, type ConceptChecks, type MasteryLevel } from './mastery'

export function checksFor(concept: string): ConceptChecks {
  return {
    hasQuiz: (QUIZ_BY_ID[concept]?.length ?? 0) > 0,
    numericIds: (NUMERIC_BY_CONCEPT[concept] ?? []).map((q) => q.id),
  }
}

/** Returns a function giving the learner's mastery level for any concept. */
export function useMastery(): (concept: string) => MasteryLevel {
  const { visited, quizScores, numericSolved } = usePrefs()
  return (concept) => masteryOf(concept, checksFor(concept), { visited, quizScores, numericSolved })
}
