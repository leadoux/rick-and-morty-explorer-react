import { useEffect } from 'react'
import AppButton from '@/components/AppButton'
import PaginationControls from '@/components/PaginationControls'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/hooks/useUrlSyncedFilters'
import { isNoResultsError } from '@/lib/errors'
import { LOCATIONS_QUERY } from '@/lib/queries'
import { useFavoritesStore } from '@/stores/favorites'

type LocationCard = {
  id: string
  name: string
  type: string
  dimension: string
  residents: Array<{ id: string; name: string }>
}

type LocationsQueryData = {
  locations?: {
    results?: LocationCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

export default function LocationsPage() {
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const { page, filters, setPage, setFilter } = useUrlSyncedFilters({
    name: '',
    type: '',
    dimension: '',
  })

  const debouncedName = useDebouncedValue(filters.name, 300)
  const debouncedType = useDebouncedValue(filters.type, 300)
  const debouncedDimension = useDebouncedValue(filters.dimension, 300)
  const hasShortTextFilter =
    (debouncedName.trim().length > 0 && debouncedName.trim().length < 2) ||
    (debouncedType.trim().length > 0 && debouncedType.trim().length < 2) ||
    (debouncedDimension.trim().length > 0 && debouncedDimension.trim().length < 2)

  const { items: locations, totalPages, totalCount, fetching, error } = usePaginatedQuery<
    LocationsQueryData,
    { page: number; filter: { name?: string; type?: string; dimension?: string } },
    LocationCard
  >({
    query: LOCATIONS_QUERY,
    variables: {
      page,
      filter: {
        name: debouncedName || undefined,
        type: debouncedType || undefined,
        dimension: debouncedDimension || undefined,
      },
    },
    pause: hasShortTextFilter,
    select: (data) => ({
      results: data?.locations?.results ?? [],
      pages: data?.locations?.info?.pages ?? 1,
      count: data?.locations?.info?.count ?? (data?.locations?.results?.length ?? 0),
    }),
  })

  const hasNoResultsError = isNoResultsError(error)

  return (
    <section>
      <h1>Locations Explorer</h1>
      <p className="description">Filter by location type and dimension for quick world discovery.</p>

      <fieldset className="card filters">
        <legend className="sr-only">Location filters</legend>
        <label className="sr-only" htmlFor="locations-filter-name">
          Filter locations by name
        </label>
        <input
          id="locations-filter-name"
          className="input"
          placeholder="Location name"
          aria-describedby="locations-short-text-hint"
          value={filters.name}
          onChange={(event) => setFilter('name', event.target.value)}
        />
        <label className="sr-only" htmlFor="locations-filter-type">
          Filter locations by type
        </label>
        <input
          id="locations-filter-type"
          className="input"
          placeholder="Type"
          aria-describedby="locations-short-text-hint"
          value={filters.type}
          onChange={(event) => setFilter('type', event.target.value)}
        />
        <label className="sr-only" htmlFor="locations-filter-dimension">
          Filter locations by dimension
        </label>
        <input
          id="locations-filter-dimension"
          className="input"
          placeholder="Dimension"
          aria-describedby="locations-short-text-hint"
          value={filters.dimension}
          onChange={(event) => setFilter('dimension', event.target.value)}
        />
      </fieldset>

      {fetching ? <p className="hint">Loading locations...</p> : null}
      {!fetching ? (
        <p id="locations-short-text-hint" className={hasShortTextFilter ? 'hint' : 'sr-only'}>
          Type at least 2 letters for text filters.
        </p>
      ) : null}
      {!fetching && !hasShortTextFilter && error && !hasNoResultsError ? <p className="error">Unable to load locations.</p> : null}
      {!fetching && (!locations.length && (!error || hasNoResultsError)) ? (
        <p className="hint">No locations match these filters.</p>
      ) : null}

      {!fetching && locations.length ? (
        <div className="grid">
          <h2 className="section-heading">Location results ({totalCount})</h2>
          {locations.map((location) => (
            <article key={location.id} className="card">
              <h3>{location.name}</h3>
              <p className="meta">Type: {location.type || 'Unknown'}</p>
              <p className="meta">Dimension: {location.dimension || 'Unknown'}</p>
              <p className="meta">Residents: {location.residents.length}</p>
              <div className="row">
                <AppButton to={`/location/${location.id}`}>Open</AppButton>
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
                  {isFavorite(location.id, 'location') ? 'Unfavorite' : 'Favorite'}
                </AppButton>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!fetching && locations.length ? (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </section>
  )
}
