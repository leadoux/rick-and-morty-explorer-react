import { useCallback, useEffect } from 'react'
import AppButton from '@/components/AppButton'
import PaginationControls from '@/components/PaginationControls'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/hooks/useUrlSyncedFilters'
import { isNoResultsError } from '@/lib/errors'
import { EPISODES_QUERY } from '@/lib/queries'
import { useCompareStore } from '@/stores/compare'
import { useFavoritesStore } from '@/stores/favorites'

type EpisodeCard = {
  id: string
  name: string
  air_date: string
  episode: string
  characters: Array<{ id: string; name: string }>
}

type EpisodesQueryData = {
  episodes?: {
    results?: EpisodeCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

export default function EpisodesPage() {
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const favoriteItems = useFavoritesStore((state) => state.items)
  const toggleEpisode = useCompareStore((state) => state.toggleEpisode)
  const comparedEpisodes = useCompareStore((state) => state.episodes)
  const isEpisodeCompared = useCallback((episodeId: string) => comparedEpisodes.some((episode) => episode.id === episodeId), [comparedEpisodes])

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  const { page, filters, setPage, setFilter } = useUrlSyncedFilters({
    name: '',
    season: '',
  })

  const episodeCode = filters.season ? `S${filters.season.padStart(2, '0')}` : undefined
  const debouncedName = useDebouncedValue(filters.name, 300)
  const hasShortTextFilter = debouncedName.trim().length > 0 && debouncedName.trim().length < 2

  const { items: episodes, totalPages, totalCount, fetching, error } = usePaginatedQuery<
    EpisodesQueryData,
    { page: number; filter: { name?: string; episode?: string } },
    EpisodeCard
  >({
    query: EPISODES_QUERY,
    variables: {
      page,
      filter: {
        name: debouncedName || undefined,
        episode: episodeCode,
      },
    },
    pause: hasShortTextFilter,
    select: (data) => ({
      results: data?.episodes?.results ?? [],
      pages: data?.episodes?.info?.pages ?? 1,
      count: data?.episodes?.info?.count ?? (data?.episodes?.results?.length ?? 0),
    }),
  })

  const hasNoResultsError = isNoResultsError(error)

  return (
    <section>
      <h1>Episodes Explorer</h1>
      <p className="description">Browse episodes by name or season, then jump into details or comparison.</p>

      <fieldset className="card filters">
        <legend className="sr-only">Episode filters</legend>
        <label className="sr-only" htmlFor="episodes-filter-name">
          Filter episodes by name
        </label>
        <input
          id="episodes-filter-name"
          className="input"
          placeholder="Episode name"
          aria-describedby="episodes-short-text-hint"
          value={filters.name}
          onChange={(event) => setFilter('name', event.target.value)}
        />
        <label className="sr-only" htmlFor="episodes-filter-season">
          Filter episodes by season
        </label>
        <select
          id="episodes-filter-season"
          className="input"
          value={filters.season}
          onChange={(event) => setFilter('season', event.target.value)}
        >
          <option value="">All seasons</option>
          {Array.from({ length: 7 }, (_, index) => index + 1).map((option) => (
            <option key={option} value={String(option)}>
              Season {option}
            </option>
          ))}
        </select>
      </fieldset>

      <p id="episodes-short-text-hint" className="sr-only">
        Type at least 2 letters for episode name.
      </p>
      {fetching ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Loading episodes...
        </p>
      ) : null}
      {!fetching && hasShortTextFilter ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          Type at least 2 letters for episode name.
        </p>
      ) : null}
      {!fetching && !hasShortTextFilter && error && !hasNoResultsError ? (
        <p className="error" role="status" aria-live="polite" aria-atomic="true">
          Unable to load episode data.
        </p>
      ) : null}
      {!fetching && (!episodes.length && (!error || hasNoResultsError)) ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          No episodes match these filters.
        </p>
      ) : null}

      {!fetching && episodes.length ? (
        <div className="grid">
          <h2 className="section-heading">Episode results ({totalCount})</h2>
          {episodes.map((episode) => {
            const inCompare = isEpisodeCompared(episode.id)
            const isEpisodeFavorite = favoriteItems.some((item) => item.id === episode.id && item.kind === 'episode')
            return (
              <article key={episode.id} className="card">
                <h3>
                  {episode.episode} - {episode.name}
                </h3>
                <p className="meta">Air date: {episode.air_date}</p>
                <p className="meta">Characters: {episode.characters.length}</p>
                <div className="row">
                  <AppButton to={`/episode/${episode.id}`}>Open</AppButton>
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
                    aria-pressed={inCompare}
                    aria-label={`${inCompare ? 'Remove' : 'Add'} ${episode.name} ${inCompare ? 'from' : 'to'} compare`}
                    onClick={() =>
                      toggleEpisode({
                        id: episode.id,
                        name: episode.name,
                        episode: episode.episode,
                        air_date: episode.air_date,
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

      {!fetching && episodes.length ? (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}
    </section>
  )
}
