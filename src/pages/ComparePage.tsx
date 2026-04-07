import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppButton from '@/components/AppButton'
import { handleImageError } from '@/lib/image'
import { useCompareStore } from '@/stores/compare'

export default function ComparePage() {
  const [tab, setTab] = useState<'characters' | 'episodes'>('characters')
  const characters = useCompareStore((state) => state.characters)
  const episodes = useCompareStore((state) => state.episodes)
  const canCompareCharacters = useCompareStore((state) => state.canCompareCharacters)
  const canCompareEpisodes = useCompareStore((state) => state.canCompareEpisodes)

  const isCharactersTab = tab === 'characters'
  const setActiveTab = (nextTab: 'characters' | 'episodes') => {
    setTab(nextTab)
    const nextTabId = nextTab === 'characters' ? 'compare-tab-characters' : 'compare-tab-episodes'
    requestAnimationFrame(() => {
      document.getElementById(nextTabId)?.focus()
    })
  }

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      setActiveTab(isCharactersTab ? 'episodes' : 'characters')
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveTab('characters')
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveTab('episodes')
    }
  }

  return (
    <section>
      <h1>Compare</h1>
      <p className="description">Pick two items from explorer pages and compare them side-by-side here.</p>

      <div className="row" role="tablist" aria-label="Compare category" aria-orientation="horizontal">
        <AppButton
          id="compare-tab-characters"
          variant="secondary"
          role="tab"
          aria-selected={isCharactersTab}
          aria-controls="compare-panel-characters"
          tabIndex={isCharactersTab ? 0 : -1}
          onClick={() => setActiveTab('characters')}
          onKeyDown={onTabKeyDown}
        >
          Characters
        </AppButton>
        <AppButton
          id="compare-tab-episodes"
          variant="secondary"
          role="tab"
          aria-selected={!isCharactersTab}
          aria-controls="compare-panel-episodes"
          tabIndex={!isCharactersTab ? 0 : -1}
          onClick={() => setActiveTab('episodes')}
          onKeyDown={onTabKeyDown}
        >
          Episodes
        </AppButton>
      </div>

      <div
        id="compare-panel-characters"
        className="compare-grid"
        role="tabpanel"
        aria-labelledby="compare-tab-characters"
        hidden={!isCharactersTab}
      >
        {canCompareCharacters ? (
          <>
            <h2 className="section-heading">Character comparison ({characters.length})</h2>
            {characters.map((character) => (
              <article key={character.id} className="card">
                <Link className="image-link" to={`/character/${character.id}`} aria-label={`Open ${character.name}`}>
                  <img src={character.image} alt={character.name} loading="lazy" decoding="async" onError={handleImageError} />
                </Link>
                <h3>{character.name}</h3>
                <p className="meta">Status: {character.status}</p>
                <p className="meta">Species: {character.species}</p>
              </article>
            ))}
          </>
        ) : (
          <p className="hint" role="status" aria-live="polite" aria-atomic="true">
            Add two characters to start comparing.
          </p>
        )}
      </div>

      <div
        id="compare-panel-episodes"
        className="compare-grid"
        role="tabpanel"
        aria-labelledby="compare-tab-episodes"
        hidden={isCharactersTab}
      >
        {canCompareEpisodes ? (
          <>
            <h2 className="section-heading">Episode comparison ({episodes.length})</h2>
            {episodes.map((episode) => (
              <article key={episode.id} className="card">
                <h3>{episode.name}</h3>
                <p className="meta">Episode: {episode.episode}</p>
                <p className="meta">Air date: {episode.air_date}</p>
              </article>
            ))}
          </>
        ) : (
          <p className="hint" role="status" aria-live="polite" aria-atomic="true">
            Add two episodes to start comparing.
          </p>
        )}
      </div>
    </section>
  )
}
