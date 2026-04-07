import { useEffect, useMemo, useRef } from 'react'
import { Navigate, Route, Routes, matchPath, useLocation } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import CharacterDetailPage from '@/pages/CharacterDetailPage'
import CharactersPage from '@/pages/CharactersPage'
import ComparePage from '@/pages/ComparePage'
import EpisodeDetailPage from '@/pages/EpisodeDetailPage'
import EpisodesPage from '@/pages/EpisodesPage'
import FavoritesPage from '@/pages/FavoritesPage'
import LocationDetailPage from '@/pages/LocationDetailPage'
import LocationsPage from '@/pages/LocationsPage'
import {
  characterDetailGenericDescription,
  charactersPageDescription,
  comparePageDescription,
  defaultSiteDescription,
  episodeDetailGenericDescription,
  episodesPageDescription,
  favoritesPageDescription,
  locationDetailGenericDescription,
  locationsPageDescription,
  notFoundPageDescription,
} from '@/lib/seo'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  const location = useLocation()
  const pathname = location.pathname
  const mainContentRef = useRef<HTMLElement | null>(null)
  const routeAnnouncementRef = useRef<HTMLParagraphElement | null>(null)
  const hasNavigated = useRef(false)

  const routeMeta = useMemo(() => {
    if (pathname === '/characters' || pathname === '/') {
      return {
        title: 'Characters | Rick and Morty Explorer',
        description: charactersPageDescription,
      }
    }
    if (pathname === '/episodes') {
      return {
        title: 'Episodes | Rick and Morty Explorer',
        description: episodesPageDescription,
      }
    }
    if (pathname === '/locations') {
      return {
        title: 'Locations | Rick and Morty Explorer',
        description: locationsPageDescription,
      }
    }
    if (pathname === '/favorites') {
      return {
        title: 'Favorites | Rick and Morty Explorer',
        description: favoritesPageDescription,
      }
    }
    if (pathname === '/compare') {
      return {
        title: 'Compare | Rick and Morty Explorer',
        description: comparePageDescription,
      }
    }
    if (matchPath('/character/:id', pathname)) {
      return {
        title: 'Character Details | Rick and Morty Explorer',
        description: characterDetailGenericDescription,
      }
    }
    if (matchPath('/episode/:id', pathname)) {
      return {
        title: 'Episode Details | Rick and Morty Explorer',
        description: episodeDetailGenericDescription,
      }
    }
    if (matchPath('/location/:id', pathname)) {
      return {
        title: 'Location Details | Rick and Morty Explorer',
        description: locationDetailGenericDescription,
      }
    }

    return {
      title: 'Page Not Found | Rick and Morty Explorer',
      description: notFoundPageDescription,
    }
  }, [pathname])

  useDocumentMeta(routeMeta ?? { title: 'Rick and Morty Explorer', description: defaultSiteDescription })

  useEffect(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true
      return
    }

    if (routeAnnouncementRef.current) {
      routeAnnouncementRef.current.textContent = routeMeta.title
    }

    requestAnimationFrame(() => {
      const heading = mainContentRef.current?.querySelector('h1')
      if (heading instanceof HTMLElement) {
        heading.setAttribute('tabindex', '-1')
        heading.focus()
        return
      }
      mainContentRef.current?.focus()
    })
  }, [pathname, routeMeta.title])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <p ref={routeAnnouncementRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
      <AppHeader />
      <main id="main-content" ref={mainContentRef} className="layout" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Navigate to="/characters" replace />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/episodes" element={<EpisodesPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
          <Route path="/episode/:id" element={<EpisodeDetailPage />} />
          <Route path="/location/:id" element={<LocationDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
