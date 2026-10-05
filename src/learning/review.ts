/**
 * Spaced review using Leitner boxes. Every question a learner answers enters the queue: a wrong answer comes back
 * tomorrow, a right one in a few days. Answering correctly during a review moves the card to a longer interval;
 * a wrong answer sends it back to the first box. After the last box the card is retired as learned.
 */
export interface ReviewCard {
  box: number
  /** Local calendar date the card is next due, YYYY-MM-DD. */
  due: string
}

export type ReviewState = Record<string, ReviewCard>

/** Days until the next review for each box. */
export const INTERVALS = [1, 3, 7, 16, 35]
export const RETIRED = INTERVALS.length

export function today(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return today(new Date(y, m - 1, d + days))
}

/** Item ids: `q:<concept>:<index>` for knowledge-check questions, `n:<id>` for numeric questions. */
export const quizItem = (concept: string, index: number) => `q:${concept}:${index}`
export const numericItem = (id: string) => `n:${id}`

/**
 * An answer given while studying a page. It adds a new card, and a wrong answer resets an existing card,
 * but a right answer never promotes a card: promotion only happens in a spaced review.
 */
export function recordStudyAnswer(state: ReviewState, item: string, correct: boolean, on = today()): ReviewState {
  const card = state[item]
  if (!card) return { ...state, [item]: correct ? { box: 1, due: addDays(on, INTERVALS[1]) } : { box: 0, due: addDays(on, INTERVALS[0]) } }
  if (!correct) return { ...state, [item]: { box: 0, due: addDays(on, INTERVALS[0]) } }
  return state
}

/** An answer given in a review session. */
export function recordReviewAnswer(state: ReviewState, item: string, correct: boolean, on = today()): ReviewState {
  const card = state[item] ?? { box: 0, due: on }
  if (!correct) return { ...state, [item]: { box: 0, due: addDays(on, INTERVALS[0]) } }
  const box = card.box + 1
  return { ...state, [item]: { box, due: box >= RETIRED ? '' : addDays(on, INTERVALS[box]) } }
}

export const isRetired = (c: ReviewCard) => c.box >= RETIRED

export function dueItems(state: ReviewState, on = today()): string[] {
  return Object.entries(state)
    .filter(([, c]) => !isRetired(c) && c.due <= on)
    .sort((a, b) => (a[1].due === b[1].due ? a[1].box - b[1].box : a[1].due < b[1].due ? -1 : 1))
    .map(([id]) => id)
}

/** Cards not yet due, soonest first, for practising early. */
export function upcomingItems(state: ReviewState, on = today()): string[] {
  return Object.entries(state)
    .filter(([, c]) => !isRetired(c) && c.due > on)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : 0))
    .map(([id]) => id)
}
