import { Link, matchPath, useLocation } from 'react-router-dom'
import { useCompareStore } from '@/stores/compare'
import { usePreferencesStore } from '@/stores/preferences'
import AppButton from './AppButton'
import GlobalSearch from './GlobalSearch'

export default function AppHeader() {
  const location = useLocation()
  const pathname = location.pathname
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const isDarkMode = usePreferencesStore((state) => state.isDarkMode)
  const compareCount = useCompareStore((state) => state.characters.length + state.episodes.length)

  const isCharactersActive = pathname === '/characters' || Boolean(matchPath('/character/:id', pathname))
  const isEpisodesActive = pathname === '/episodes' || Boolean(matchPath('/episode/:id', pathname))
  const isLocationsActive = pathname === '/locations' || Boolean(matchPath('/location/:id', pathname))
  const isFavoritesActive = pathname === '/favorites'
  const isCompareActive = pathname === '/compare'

  const linkClass = (isActive: boolean) => (isActive ? 'active' : undefined)

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" to="/characters">
          Rick and Morty Explorer
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link to="/characters" className={linkClass(isCharactersActive)} aria-current={isCharactersActive ? 'page' : undefined}>
            Characters
          </Link>
          <Link to="/episodes" className={linkClass(isEpisodesActive)} aria-current={isEpisodesActive ? 'page' : undefined}>
            Episodes
          </Link>
          <Link to="/locations" className={linkClass(isLocationsActive)} aria-current={isLocationsActive ? 'page' : undefined}>
            Locations
          </Link>
          <Link to="/favorites" className={linkClass(isFavoritesActive)} aria-current={isFavoritesActive ? 'page' : undefined}>
            Favorites
          </Link>
          <Link
            to="/compare"
            className={linkClass(isCompareActive)}
            aria-current={isCompareActive ? 'page' : undefined}
            aria-label={`Compare (${compareCount} selected items)`}
          >
            Compare <span className="badge">{compareCount}</span>
          </Link>
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
