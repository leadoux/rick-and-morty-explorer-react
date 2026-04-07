import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import AppButton from '@/components/AppButton'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { handleImageError } from '@/lib/image'
import { EPISODE_DETAIL_QUERY } from '@/lib/queries'
import { episodeDetailGenericDescription } from '@/lib/seo'
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
  const favoriteItems = useFavoritesStore((state) => state.items)
  const toggleEpisode = useCompareStore((state) => state.toggleEpisode)
  const comparedEpisodes = useCompareStore((state) => state.episodes)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const [{ data, fetching, error }] = useQuery<EpisodeDetailData>({
    query: EPISODE_DETAIL_QUERY,
    variables: { id },
  })

  const episode = data?.episode
  const isInCompare = episode ? comparedEpisodes.some((e) => e.id === episode.id) : false
  const isEpisodeFavorite = episode ? favoriteItems.some((item) => item.id === episode.id && item.kind === 'episode') : false
  const pageHeading = episode ? `${episode.episode} - ${episode.name}` : 'Episode details'
  useDocumentMeta({
    title: episode?.name
      ? `${episode.episode} - ${episode.name} | Rick and Morty Explorer`
      : 'Episode Details | Rick and Morty Explorer',
    description: episode
      ? `${episode.episode} ${episode.name}: air date, characters, and compare from Rick and Morty Explorer.`
      : episodeDetailGenericDescription,
  })

  return (
    <section>
      <h1>{pageHeading}</h1>
      {fetching ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Loading episode...
        </p>
      ) : null}
      {!fetching && error ? (
        <p className="error" role="status" aria-live="polite" aria-atomic="true">
          Unable to load this episode.
        </p>
      ) : null}

      {episode ? (
        <article className="card">
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
              {isEpisodeFavorite ? 'Unfavorite' : 'Favorite'}
            </AppButton>
            <AppButton
              variant="secondary"
              aria-pressed={isInCompare}
              aria-label={`${isInCompare ? 'Remove' : 'Add'} ${episode.name} ${isInCompare ? 'from' : 'to'} compare`}
              onClick={() =>
                toggleEpisode({
                  id: episode.id,
                  name: episode.name,
                  episode: episode.episode,
                  air_date: episode.air_date,
                })
              }
            >
              {isInCompare ? 'Compared' : 'Compare'}
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
