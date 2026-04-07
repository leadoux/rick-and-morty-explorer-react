import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppButton from '@/components/AppButton'
import PaginationControls from '@/components/PaginationControls'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/hooks/useUrlSyncedFilters'
import { isNoResultsError } from '@/lib/errors'
import { handleImageError } from '@/lib/image'
import { CHARACTERS_QUERY } from '@/lib/queries'
import { useCompareStore } from '@/stores/compare'
import { useFavoritesStore } from '@/stores/favorites'

type CharacterCard = {
  id: string
  name: string
  status: string
  species: string
  gender: string
  image: string
  origin?: {
    name: string
  }
}

type CharactersQueryData = {
  characters?: {
    results?: CharacterCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

export default function CharactersPage() {
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const favoriteItems = useFavoritesStore((state) => state.items)
  const toggleCharacter = useCompareStore((state) => state.toggleCharacter)
  const isCharacterCompared = useCompareStore((state) => state.isCharacterCompared)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const { page, filters, setPage, setFilter, resetFilters } = useUrlSyncedFilters({
    name: '',
    status: '',
    species: '',
    gender: '',
  })

  const debouncedName = useDebouncedValue(filters.name, 300)
  const debouncedSpecies = useDebouncedValue(filters.species, 300)

  const hasShortTextFilter =
    (debouncedName.trim().length > 0 && debouncedName.trim().length < 2) ||
    (debouncedSpecies.trim().length > 0 && debouncedSpecies.trim().length < 2)

  const { items: characters, totalPages, totalCount, fetching, error } = usePaginatedQuery<
    CharactersQueryData,
    {
      page: number
      filter: {
        name?: string
        status?: string
        species?: string
        gender?: string
      }
    },
    CharacterCard
  >({
    query: CHARACTERS_QUERY,
    variables: {
      page,
      filter: {
        name: debouncedName || undefined,
        status: filters.status || undefined,
        species: debouncedSpecies || undefined,
        gender: filters.gender || undefined,
      },
    },
    pause: hasShortTextFilter,
    select: (data) => ({
      results: data?.characters?.results ?? [],
      pages: data?.characters?.info?.pages ?? 1,
      count: data?.characters?.info?.count ?? (data?.characters?.results?.length ?? 0),
    }),
  })

  const hasNoResultsError = isNoResultsError(error)

  return (
    <section>
      <h1>Characters Explorer</h1>
      <p className="description">Browse every character with URL-synced filters and compare-ready cards.</p>

      <fieldset className="card filters">
        <legend className="sr-only">Character filters</legend>
        <label className="sr-only" htmlFor="characters-filter-name">
          Filter characters by name
        </label>
        <input
          id="characters-filter-name"
          className="input"
          placeholder="Name"
          aria-describedby="characters-short-text-hint"
          value={filters.name}
          onChange={(event) => setFilter('name', event.target.value)}
        />
        <label className="sr-only" htmlFor="characters-filter-status">
          Filter characters by status
        </label>
        <select
          id="characters-filter-status"
          className="input"
          value={filters.status}
          onChange={(event) => setFilter('status', event.target.value)}
        >
          <option value="">Any status</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
        <label className="sr-only" htmlFor="characters-filter-species">
          Filter characters by species
        </label>
        <input
          id="characters-filter-species"
          className="input"
          placeholder="Species"
          aria-describedby="characters-short-text-hint"
          value={filters.species}
          onChange={(event) => setFilter('species', event.target.value)}
        />
        <label className="sr-only" htmlFor="characters-filter-gender">
          Filter characters by gender
        </label>
        <select
          id="characters-filter-gender"
          className="input"
          value={filters.gender}
          onChange={(event) => setFilter('gender', event.target.value)}
        >
          <option value="">Any gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="genderless">Genderless</option>
          <option value="unknown">Unknown</option>
        </select>
        <AppButton variant="secondary" onClick={resetFilters}>
          Reset
        </AppButton>
      </fieldset>

      <p id="characters-short-text-hint" className="sr-only">
        Type at least 2 letters for name/species filters.
      </p>
      {fetching ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Loading characters...
        </p>
      ) : null}
      {!fetching && hasShortTextFilter ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Type at least 2 letters for name/species filters.
        </p>
      ) : null}
      {!fetching && !hasShortTextFilter && error && !hasNoResultsError ? (
        <p className="error" role="status" aria-live="polite" aria-atomic="true">
          Unable to load character data right now.
        </p>
      ) : null}
      {!fetching && (!characters.length && (!error || hasNoResultsError)) ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          No characters match these filters.
        </p>
      ) : null}

      {!fetching && characters.length ? (
        <div className="grid">
          <h2 className="section-heading">Character results ({totalCount})</h2>
          {characters.map((character) => {
            const inCompare = isCharacterCompared(character.id)
            const isCharacterFavorite = favoriteItems.some((item) => item.id === character.id && item.kind === 'character')
            return (
              <article key={character.id} className="card">
                <Link className="image-link" to={`/character/${character.id}`} aria-label={`Open ${character.name}`}>
                  <img
                    src={character.image}
                    alt={character.name}
                    className="avatar"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                  />
                </Link>
                <h3>{character.name}</h3>
                <p className="meta">
                  {character.species} - {character.status}
                </p>
                <p className="meta">Origin: {character.origin?.name || 'Unknown'}</p>
                <div className="row">
                  <AppButton to={`/character/${character.id}`}>Open</AppButton>
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
                    aria-pressed={inCompare}
                    aria-label={`${inCompare ? 'Remove' : 'Add'} ${character.name} ${inCompare ? 'from' : 'to'} compare`}
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
                    {inCompare ? 'Compared' : 'Compare'}
                  </AppButton>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {!fetching && characters.length ? (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </section>
  )
}
