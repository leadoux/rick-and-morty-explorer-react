import { Navigate, Route, Routes } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import CharacterDetailPage from '@/pages/CharacterDetailPage'
import CharactersPage from '@/pages/CharactersPage'
import ComparePage from '@/pages/ComparePage'
import EpisodeDetailPage from '@/pages/EpisodeDetailPage'
import EpisodesPage from '@/pages/EpisodesPage'
import FavoritesPage from '@/pages/FavoritesPage'
import LocationDetailPage from '@/pages/LocationDetailPage'
import LocationsPage from '@/pages/LocationsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <AppHeader />
      <main id="main-content" className="layout">
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
    </>
  )
}
