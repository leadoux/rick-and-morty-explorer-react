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
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleCharacter = useCompareStore((state) => state.toggleCharacter)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const [{ data, fetching, error }] = useQuery<CharacterDetailData>({
    query: CHARACTER_DETAIL_QUERY,
    variables: { id },
  })

  const character = data?.character
  useDocumentMeta({
    title: character?.name ? `${character.name} | Rick and Morty Explorer` : 'Character Details | Rick and Morty Explorer',
    description: character
      ? `Profile for ${character.name}: ${character.species}, ${character.status}. Episode list and links from Rick and Morty Explorer.`
      : characterDetailGenericDescription,
  })

  return (
    <section>
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
          <img src={character.image} alt={character.name} loading="eager" decoding="async" onError={handleImageError} />
          <div>
            <h1>{character.name}</h1>
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
                {isFavorite(character.id, 'character') ? 'Unfavorite' : 'Favorite'}
              </AppButton>
              <AppButton
                variant="secondary"
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
                Compare
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
