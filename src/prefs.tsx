import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ROLES, type Depth, type RoleId } from './content'

type Theme = 'system' | 'light' | 'dark'

interface Prefs {
  role: RoleId | null
  setRole: (r: RoleId) => void
  depth: Depth
  setDepth: (d: Depth) => void
  theme: Theme
  setTheme: (t: Theme) => void
  visited: string[]
  markVisited: (id: string) => void
  /** Last concept page opened, for "continue where you left off". */
  lastConcept: string | null
  missionsDone: string[]
  completeMission: (id: string) => void
  quizScores: Record<string, { score: number; total: number }>
  saveQuiz: (id: string, score: number, total: number) => void
  resetProgress: () => void
}

const Ctx = createContext<Prefs | null>(null)

// Storage can be blocked (private windows, sandboxed previews); preferences then live for the session only.
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleId | null>(() => load('ll.role', null))
  const [depth, setDepthState] = useState<Depth>(() => load('ll.depth', 'explain'))
  const [theme, setThemeState] = useState<Theme>(() => load('ll.theme', 'system'))
  const [visited, setVisited] = useState<string[]>(() => load('ll.visited', []))
  const [lastConcept, setLastConcept] = useState<string | null>(() => load('ll.last', null))
  const [missionsDone, setMissionsDone] = useState<string[]>(() => load('ll.missions', []))
  const [quizScores, setQuizScores] = useState<Record<string, { score: number; total: number }>>(() => load('ll.quiz', {}))

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  const value: Prefs = {
    role,
    setRole: (r) => {
      setRoleState(r)
      save('ll.role', r)
      const d = ROLES.find((x) => x.id === r)?.depth
      if (d) {
        setDepthState(d)
        save('ll.depth', d)
      }
    },
    depth,
    setDepth: (d) => {
      setDepthState(d)
      save('ll.depth', d)
    },
    theme,
    setTheme: (t) => {
      setThemeState(t)
      save('ll.theme', t)
    },
    visited,
    markVisited: (id) => {
      setLastConcept(id)
      save('ll.last', id)
      setVisited((v) => {
        if (v.includes(id)) return v
        const next = [...v, id]
        save('ll.visited', next)
        return next
      })
    },
    lastConcept,
    missionsDone,
    completeMission: (id) =>
      setMissionsDone((m) => {
        if (m.includes(id)) return m
        const next = [...m, id]
        save('ll.missions', next)
        return next
      }),
    quizScores,
    saveQuiz: (id, score, total) =>
      setQuizScores((q) => {
        // Keep the best attempt.
        if (q[id] && q[id].score >= score) return q
        const next = { ...q, [id]: { score, total } }
        save('ll.quiz', next)
        return next
      }),
    resetProgress: () => {
      setVisited([])
      setLastConcept(null)
      setMissionsDone([])
      setQuizScores({})
      for (const k of ['ll.visited', 'll.last', 'll.missions', 'll.quiz']) save(k, k === 'll.quiz' ? {} : k === 'll.last' ? null : [])
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePrefs outside PrefsProvider')
  return v
}
