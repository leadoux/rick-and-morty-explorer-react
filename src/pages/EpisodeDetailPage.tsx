import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import AppButton from '@/components/AppButton'
import { handleImageError } from '@/lib/image'
import { EPISODE_DETAIL_QUERY } from '@/lib/queries'
import { useCompareStore } from '@/stores/compare'
import { useFavoritesStore } from '@/stores/favorites'

type EpisodeCharacter = {
  id: string
  name: string
  image: string
  species: string
  status: string
}

type EpisodeDetail = {
  id: string
  name: string
  air_date: string
  episode: string
  characters: EpisodeCharacter[]
}

type EpisodeDetailData = {
  episode?: EpisodeDetail
}

export default function EpisodeDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleEpisode = useCompareStore((state) => state.toggleEpisode)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const [{ data, fetching, error }] = useQuery<EpisodeDetailData>({
    query: EPISODE_DETAIL_QUERY,
    variables: { id },
  })

  const episode = data?.episode

  return (
    <section>
      {fetching ? <p className="hint">Loading episode...</p> : null}
      {!fetching && error ? <p className="error">Unable to load this episode.</p> : null}

      {episode ? (
        <article className="card">
          <h1>
            {episode.episode} - {episode.name}
          </h1>
          <p className="meta">Air date: {episode.air_date}</p>
          <p className="meta">Character count: {episode.characters.length}</p>

          <div className="row">
            <AppButton
              variant="secondary"
              onClick={() =>
                toggleFavorite({
                  id: episode.id,
                  kind: 'episode',
                  name: episode.name,
                  subtitle: `${episode.episode} - ${episode.air_date}`,
                })
              }
            >
              {isFavorite(episode.id, 'episode') ? 'Unfavorite' : 'Favorite'}
            </AppButton>
            <AppButton
              variant="secondary"
              onClick={() =>
                toggleEpisode({
                  id: episode.id,
                  name: episode.name,
                  episode: episode.episode,
                  air_date: episode.air_date,
                })
              }
            >
              Compare
            </AppButton>
          </div>

          <h2>Characters</h2>
          <div className="grid">
            {episode.characters.map((character) => (
              <article key={character.id} className="card resident">
                <Link className="image-link" to={`/character/${character.id}`} aria-label={`Open ${character.name}`}>
                  <img src={character.image} alt={character.name} loading="lazy" decoding="async" onError={handleImageError} />
                </Link>
                <h3>{character.name}</h3>
                <p className="meta">
                  {character.species} - {character.status}
                </p>
                <AppButton to={`/character/${character.id}`}>Open</AppButton>
              </article>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  )
}
