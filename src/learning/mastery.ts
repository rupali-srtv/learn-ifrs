/**
 * Mastery per concept, derived from what the learner has already done:
 *   Read      the page has been opened
 *   Practised at least one check on the page has been attempted
 *   Mastered  full marks on the knowledge check and every numeric question on the page answered correctly
 * A page with no checks can be read but not mastered.
 */
export type MasteryLevel = 'new' | 'read' | 'practised' | 'mastered'

export interface MasteryInput {
  visited: string[]
  quizScores: Record<string, { score: number; total: number }>
  /** Numeric question id -> answered correctly at least once. */
  numericSolved: Record<string, boolean>
}

export interface ConceptChecks {
  hasQuiz: boolean
  numericIds: string[]
}

export function masteryOf(concept: string, checks: ConceptChecks, input: MasteryInput): MasteryLevel {
  const quiz = input.quizScores[concept]
  const attemptedNumeric = checks.numericIds.some((id) => id in input.numericSolved)
  const hasChecks = checks.hasQuiz || checks.numericIds.length > 0
  if (hasChecks) {
    const quizDone = !checks.hasQuiz || (!!quiz && quiz.score === quiz.total)
    const numericDone = checks.numericIds.every((id) => input.numericSolved[id] === true)
    if (quizDone && numericDone && (checks.hasQuiz ? !!quiz : true)) return 'mastered'
    if (quiz || attemptedNumeric) return 'practised'
  }
  return input.visited.includes(concept) ? 'read' : 'new'
}

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  new: 'Not started',
  read: 'Read',
  practised: 'Practised',
  mastered: 'Mastered',
}
