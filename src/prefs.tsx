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
    markVisited: (id) =>
      setVisited((v) => {
        if (v.includes(id)) return v
        const next = [...v, id]
        save('ll.visited', next)
        return next
      }),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePrefs outside PrefsProvider')
  return v
}
