import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'urql'
import AppButton from '@/components/AppButton'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { handleImageError } from '@/lib/image'
import { LOCATION_DETAIL_QUERY } from '@/lib/queries'
import { locationDetailGenericDescription } from '@/lib/seo'
import { useFavoritesStore } from '@/stores/favorites'

type Resident = {
  id: string
  name: string
  image: string
  species: string
  status: string
}

type LocationDetail = {
  id: string
  name: string
  type: string
  dimension: string
  residents: Resident[]
}

type LocationDetailData = {
  location?: LocationDetail
}

export default function LocationDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const favoriteItems = useFavoritesStore((state) => state.items)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const [{ data, fetching, error }] = useQuery<LocationDetailData>({
    query: LOCATION_DETAIL_QUERY,
    variables: { id },
  })

  const location = data?.location
  const pageHeading = location?.name ?? 'Location details'
  const isLocationFavorite = location
    ? favoriteItems.some((item) => item.id === location.id && item.kind === 'location')
    : false
  useDocumentMeta({
    title: location?.name ? `${location.name} | Rick and Morty Explorer` : 'Location Details | Rick and Morty Explorer',
    description: location
      ? `Location ${location.name}: type, dimension, and residents from Rick and Morty Explorer.`
      : locationDetailGenericDescription,
  })

  return (
    <section>
      <h1>{pageHeading}</h1>
      {fetching ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Loading location...
        </p>
      ) : null}
      {!fetching && error ? (
        <p className="error" role="status" aria-live="polite" aria-atomic="true">
          Unable to load this location.
        </p>
      ) : null}

      {location ? (
        <article className="card">
          <p className="meta">Type: {location.type || 'Unknown'}</p>
          <p className="meta">Dimension: {location.dimension || 'Unknown'}</p>
          <p className="meta">Residents: {location.residents.length}</p>
          <AppButton
            variant="secondary"
            onClick={() =>
              toggleFavorite({
                id: location.id,
                kind: 'location',
                name: location.name,
                subtitle: `${location.type || 'Unknown'} - ${location.dimension || 'Unknown'}`,
              })
            }
          >
            {isLocationFavorite ? 'Unfavorite' : 'Favorite'}
          </AppButton>

          <h2>Residents</h2>
          <div className="grid">
            {location.residents.map((resident) => (
              <article key={resident.id} className="card resident">
                <Link className="image-link character-portrait-link" to={`/character/${resident.id}`} aria-label={`Open ${resident.name}`}>
                  <img
                    src={resident.image}
                    alt={resident.name}
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                  />
                </Link>
                <h3>{resident.name}</h3>
                <p className="meta">
                  {resident.species} - {resident.status}
                </p>
                <AppButton to={`/character/${resident.id}`}>Open</AppButton>
              </article>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  )
}
