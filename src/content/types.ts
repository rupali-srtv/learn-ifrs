export type TrackId = 'A' | 'B' | 'C'

export type NodeKind =
  | 'foundation'
  | 'scope'
  | 'measurement'
  | 'presentation'
  | 'disclosure'
  | 'tagetik'

export type EdgeType =
  | 'builds-on'
  | 'measured-by'
  | 'posts-to'
  | 'disclosed-in'
  | 'implemented-by'
  | 'contrasts-with'
  | 'requires-data'

export interface Edge {
  type: EdgeType
  to: string
}

/**
 * Body text is a list of blocks. A block starting with:
 *   "- "  is a bullet (consecutive bullets form one list)
 *   "> "  is a callout
 *   "$ "  is a display formula
 * Inline markup: [[id]] or [[id|label]] links a concept or opens a glossary hover card.
 */
export type Body = string[]

export interface Concept {
  id: string
  title: string
  track: TrackId
  module: string
  kind: NodeKind
  /** Two-sentence plain-language answer shown at the top of the page. */
  summary: string
  explain: Body
  apply: Body
  implement: Body
  /** Paragraph references, e.g. "IFRS 17.38". */
  refs: string[]
  links: Edge[]
  /** Sandbox tab that demonstrates this concept, if any. */
  sandbox?: 'overview' | 'rollforward' | 'journals' | 'disclosures'
  lenses?: { auditor?: string; actuary?: string; developer?: string }
}

export interface Module {
  code: string
  title: string
  blurb: string
  concepts: string[]
}

export interface Track {
  id: TrackId
  title: string
  tagline: string
  audience: string
  modules: Module[]
}

export interface GlossaryTerm {
  id: string
  term: string
  abbr?: string
  definition: string
  concept?: string
}
