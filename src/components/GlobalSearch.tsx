import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'urql'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { isNoResultsError } from '@/lib/errors'
import { GLOBAL_SEARCH_QUERY } from '@/lib/queries'

type SearchCharacter = {
  id: string
  name: string
  status: string
  species: string
  image: string
}

type SearchEpisode = {
  id: string
  name: string
  episode: string
  air_date: string
}

type SearchLocation = {
  id: string
  name: string
  type: string
  dimension: string
}

type GlobalSearchQuery = {
  characters?: { results?: SearchCharacter[] }
  episodes?: { results?: SearchEpisode[] }
  locations?: { results?: SearchLocation[] }
}

export default function GlobalSearch() {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebouncedValue(searchValue, 350)
  const shouldRun = debouncedSearchValue.trim().length >= 2

  const [{ data, fetching, error }] = useQuery<GlobalSearchQuery>({
    query: GLOBAL_SEARCH_QUERY,
    variables: {
      name: debouncedSearchValue.trim(),
    },
    pause: !shouldRun,
  })

  const characters = useMemo(() => (data?.characters?.results ?? []).slice(0, 5), [data])
  const episodes = useMemo(() => (data?.episodes?.results ?? []).slice(0, 5), [data])
  const locations = useMemo(() => (data?.locations?.results ?? []).slice(0, 5), [data])
  const hasResults = characters.length > 0 || episodes.length > 0 || locations.length > 0
  const hasNoResults = isNoResultsError(error)

  return (
    <div className="search-wrap">
      <input
        className="input"
        type="search"
        value={searchValue}
        placeholder="Search everything..."
        aria-label="Search characters, episodes and locations"
        onChange={(event) => setSearchValue(event.target.value)}
      />

      {shouldRun ? (
        <div className="results card">
          {fetching ? <p className="hint">Searching...</p> : null}
          {!fetching && error && !hasNoResults ? <p className="error">Unable to run search right now.</p> : null}
          {!fetching && !error && hasResults ? (
            <>
              {characters.length ? (
                <div>
                  <p className="section-label">Characters</p>
                  {characters.map((character) => (
                    <Link key={character.id} className="result-link" to={`/character/${character.id}`}>
                      {character.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {episodes.length ? (
                <div>
                  <p className="section-label">Episodes</p>
                  {episodes.map((episode) => (
                    <Link key={episode.id} className="result-link" to={`/episode/${episode.id}`}>
                      {episode.episode} - {episode.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {locations.length ? (
                <div>
                  <p className="section-label">Locations</p>
                  {locations.map((location) => (
                    <Link key={location.id} className="result-link" to={`/location/${location.id}`}>
                      {location.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          {!fetching && (!hasResults || hasNoResults) ? <p className="hint">No results for this query.</p> : null}
        </div>
      ) : null}

      {!shouldRun && searchValue.trim().length > 0 ? (
        <p className="hint debounce-hint">Type at least 2 letters to search.</p>
      ) : null}
    </div>
  )
}
