import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTENT_STATUS, CONTENT_VERSION } from '../content'
import { usePrefs } from '../prefs'
import { BrandMark, Icon } from './Icon'
import { SearchDialog } from './SearchDialog'

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/lab', label: 'Labs' },
  { to: '/map', label: 'Concept map' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/progress', label: 'Progress' },
  { to: '/about', label: 'Trust & method' },
]

export function Shell({ children }: { children: ReactNode }) {
  const { theme, setTheme } = usePrefs()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !(e.target instanceof HTMLInputElement))) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const themeIcon = theme === 'system' ? 'auto' : theme === 'light' ? 'sun' : 'moon'

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Recognara home">
            <BrandMark />
            <span>Recognara <small>IFRS 17 & Tagetik</small></span>
          </Link>
          <nav className={`nav${menu ? ' open' : ''}`} aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive || (n.to === '/lab' && loc.pathname === '/sandbox') ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-tools">
            <button className="icon-btn search-btn" onClick={() => setSearch(true)} aria-label="Search">
              <Icon name="search" /> <span>Search concepts</span> <kbd>/</kbd>
            </button>
            <button
              className="icon-btn"
              onClick={() => setTheme(nextTheme)}
              aria-label={`Theme: ${theme}. Switch to ${nextTheme}`}
              title={`Theme: ${theme}`}
            >
              <Icon name={themeIcon} />
            </button>
            <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="page">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            Recognara · content {CONTENT_VERSION} · {CONTENT_STATUS}.
          </div>
          <div>
            Educational material, not professional advice. Always refer to the IFRS Accounting Standards issued by the IFRS
            Foundation. CCH Tagetik is a product of Wolters Kluwer; this portal is independent and not affiliated with or
            endorsed by Wolters Kluwer or the IFRS Foundation.
          </div>
        </div>
      </footer>
      {search && <SearchDialog onClose={() => setSearch(false)} />}
    </>
  )
}
