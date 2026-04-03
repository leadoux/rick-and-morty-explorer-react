import { Link, NavLink } from 'react-router-dom'
import { useCompareStore } from '@/stores/compare'
import { usePreferencesStore } from '@/stores/preferences'
import AppButton from './AppButton'
import GlobalSearch from './GlobalSearch'

export default function AppHeader() {
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const isDarkMode = usePreferencesStore((state) => state.isDarkMode)
  const compareCount = useCompareStore((state) => state.characters.length + state.episodes.length)

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" to="/characters">
          Rick and Morty Explorer
        </Link>
        <nav className="nav-links">
          <NavLink to="/characters">Characters</NavLink>
          <NavLink to="/episodes">Episodes</NavLink>
          <NavLink to="/locations">Locations</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          <NavLink to="/compare">
            Compare <span className="badge">{compareCount}</span>
          </NavLink>
        </nav>
        <div className="actions">
          <GlobalSearch />
          <AppButton variant="secondary" onClick={toggleTheme}>
            {isDarkMode ? 'Light' : 'Dark'} mode
          </AppButton>
        </div>
      </div>
    </header>
  )
}
