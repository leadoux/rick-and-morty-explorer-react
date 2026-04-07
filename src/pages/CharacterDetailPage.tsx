import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import AppButton from '@/components/AppButton'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { handleImageError } from '@/lib/image'
import { CHARACTER_DETAIL_QUERY } from '@/lib/queries'
import { characterDetailGenericDescription } from '@/lib/seo'
import { useCompareStore } from '@/stores/compare'
import { useFavoritesStore } from '@/stores/favorites'
import type { Character } from '@/types/entities'

type CharacterDetailData = {
  character?: Character
}

export default function CharacterDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const favoriteItems = useFavoritesStore((state) => state.items)
  const toggleCharacter = useCompareStore((state) => state.toggleCharacter)
  const comparedCharacters = useCompareStore((state) => state.characters)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const [{ data, fetching, error }] = useQuery<CharacterDetailData>({
    query: CHARACTER_DETAIL_QUERY,
    variables: { id },
  })

  const character = data?.character
  const isInCompare = character ? comparedCharacters.some((c) => c.id === character.id) : false
  const isCharacterFavorite = character
    ? favoriteItems.some((item) => item.id === character.id && item.kind === 'character')
    : false
  const pageHeading = character?.name ?? 'Character details'
  useDocumentMeta({
    title: character?.name ? `${character.name} | Rick and Morty Explorer` : 'Character Details | Rick and Morty Explorer',
    description: character
      ? `Profile for ${character.name}: ${character.species}, ${character.status}. Episode list and links from Rick and Morty Explorer.`
      : characterDetailGenericDescription,
  })

  return (
    <section>
      <h1>{pageHeading}</h1>
      {fetching ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Loading character...
        </p>
      ) : null}
      {!fetching && error ? (
        <p className="error" role="status" aria-live="polite" aria-atomic="true">
          Unable to load this character.
        </p>
      ) : null}

      {character ? (
        <article className="card detail">
          <img
            src={character.image}
            alt={character.name}
            className="detail-hero-image"
            width={300}
            height={300}
            loading="eager"
            decoding="async"
            onError={handleImageError}
          />
          <div>
            <p className="meta">Status: {character.status}</p>
            <p className="meta">Species: {character.species}</p>
            <p className="meta">Gender: {character.gender}</p>
            <p className="meta">Origin: {character.origin?.name || 'Unknown'}</p>
            <p className="meta">Last known location: {character.location?.name || 'Unknown'}</p>

            <div className="row">
              <AppButton
                variant="secondary"
                onClick={() =>
                  toggleFavorite({
                    id: character.id,
                    kind: 'character',
                    name: character.name,
                    subtitle: `${character.species} - ${character.status}`,
                    image: character.image,
                  })
                }
              >
                {isCharacterFavorite ? 'Unfavorite' : 'Favorite'}
              </AppButton>
              <AppButton
                variant="secondary"
                aria-pressed={isInCompare}
                aria-label={`${isInCompare ? 'Remove' : 'Add'} ${character.name} ${isInCompare ? 'from' : 'to'} compare`}
                onClick={() =>
                  toggleCharacter({
                    id: character.id,
                    name: character.name,
                    image: character.image,
                    status: character.status,
                    species: character.species,
                  })
                }
              >
                {isInCompare ? 'Compared' : 'Compare'}
              </AppButton>
            </div>

            <h2>Episode Appearances</h2>
            <ul>
              {character.episode.map((episode) => (
                <li key={episode.id}>
                  <Link to={`/episode/${episode.id}`}>{episode.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ) : null}
    </section>
  )
}
