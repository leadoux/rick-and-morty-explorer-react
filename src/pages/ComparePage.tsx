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

  const canCompare = tab === 'characters' ? canCompareCharacters : canCompareEpisodes

  return (
    <section>
      <h1>Compare</h1>
      <p className="description">Pick two items from explorer pages and compare them side-by-side here.</p>

      <div className="row">
        <AppButton variant="secondary" disabled={tab === 'characters'} onClick={() => setTab('characters')}>
          Characters
        </AppButton>
        <AppButton variant="secondary" disabled={tab === 'episodes'} onClick={() => setTab('episodes')}>
          Episodes
        </AppButton>
      </div>

      {!canCompare ? <p className="hint">Add two {tab} to start comparing.</p> : null}

      {canCompare && tab === 'characters' ? (
        <div className="compare-grid">
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
        </div>
      ) : null}

      {canCompare && tab === 'episodes' ? (
        <div className="compare-grid">
          <h2 className="section-heading">Episode comparison ({episodes.length})</h2>
          {episodes.map((episode) => (
            <article key={episode.id} className="card">
              <h3>{episode.name}</h3>
              <p className="meta">Episode: {episode.episode}</p>
              <p className="meta">Air date: {episode.air_date}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
