import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

type SearchOption = {
  id: string
  label: string
  path: string
  group: 'Characters' | 'Episodes' | 'Locations'
}

export default function GlobalSearch() {
  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const debouncedSearchValue = useDebouncedValue(searchValue, 350)
  const navigate = useNavigate()
  const shouldRun = debouncedSearchValue.trim().length >= 2
  const listboxId = 'global-search-listbox'

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
  const flattenedOptions = useMemo<SearchOption[]>(() => {
    const characterOptions = characters.map((character) => ({
      id: `character-${character.id}`,
      label: character.name,
      path: `/character/${character.id}`,
      group: 'Characters' as const,
    }))
    const episodeOptions = episodes.map((episode) => ({
      id: `episode-${episode.id}`,
      label: `${episode.episode} - ${episode.name}`,
      path: `/episode/${episode.id}`,
      group: 'Episodes' as const,
    }))
    const locationOptions = locations.map((location) => ({
      id: `location-${location.id}`,
      label: location.name,
      path: `/location/${location.id}`,
      group: 'Locations' as const,
    }))

    return [...characterOptions, ...episodeOptions, ...locationOptions]
  }, [characters, episodes, locations])
  const hasNoResults = isNoResultsError(error)
  const isPanelVisible = isOpen && searchValue.trim().length > 0
  const activeOptionId = useMemo(() => {
    if (activeOptionIndex < 0) return undefined
    const option = flattenedOptions[activeOptionIndex]
    return option ? `search-option-${option.id}` : undefined
  }, [activeOptionIndex, flattenedOptions])

  const closeDropdown = () => {
    setIsOpen(false)
    setActiveOptionIndex(-1)
  }

  useEffect(() => {
    const trimmed = searchValue.trim()
    const animationFrameId = requestAnimationFrame(() => {
      setActiveOptionIndex(-1)
      if (trimmed.length === 0) {
        setIsOpen(false)
        return
      }
      setIsOpen(true)
    })

    return () => cancelAnimationFrame(animationFrameId)
  }, [searchValue])

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      if (!shouldRun) {
        setActiveOptionIndex(-1)
        if (searchValue.trim().length === 0) {
          closeDropdown()
        }
        return
      }
      if (searchValue.trim().length >= 2) {
        setIsOpen(true)
      }
    })

    return () => cancelAnimationFrame(animationFrameId)
  }, [searchValue, shouldRun])

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      if (!flattenedOptions.length) {
        setActiveOptionIndex(-1)
        return
      }

      if (activeOptionIndex >= flattenedOptions.length) {
        setActiveOptionIndex(flattenedOptions.length - 1)
        return
      }

      if (isPanelVisible && activeOptionIndex < 0) {
        setActiveOptionIndex(0)
      }
    })

    return () => cancelAnimationFrame(animationFrameId)
  }, [activeOptionIndex, flattenedOptions, isPanelVisible])

  const onFocusIn = () => {
    if (shouldRun || searchValue.trim().length > 0) {
      setIsOpen(true)
    }
  }

  const onFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null
    if (searchWrapRef.current?.contains(nextFocusedElement)) return
    closeDropdown()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (isOpen) {
        closeDropdown()
        return
      }
      if (searchValue.trim().length > 0) {
        setSearchValue('')
      }
      return
    }

    if (!shouldRun || !flattenedOptions.length) return

    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsOpen(true)
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (activeOptionIndex < 0) {
        setActiveOptionIndex(0)
        return
      }
      setActiveOptionIndex((activeOptionIndex + 1) % flattenedOptions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (activeOptionIndex < 0) {
        setActiveOptionIndex(flattenedOptions.length - 1)
        return
      }
      setActiveOptionIndex(activeOptionIndex <= 0 ? flattenedOptions.length - 1 : activeOptionIndex - 1)
      return
    }

    if (event.key === 'Enter' && activeOptionIndex >= 0) {
      event.preventDefault()
      const option = flattenedOptions[activeOptionIndex]
      if (!option) return
      navigate(option.path)
      closeDropdown()
    }
  }

  return (
    <div ref={searchWrapRef} className="search-wrap" role="search" onFocus={onFocusIn} onBlur={onFocusOut}>
      <label className="sr-only" htmlFor="global-search-input">
        Search characters, episodes, and locations
      </label>
      <input
        id="global-search-input"
        className="input"
        type="search"
        value={searchValue}
        placeholder="Search everything..."
        aria-label="Search characters, episodes and locations"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isPanelVisible ? 'true' : 'false'}
        aria-controls={isPanelVisible ? listboxId : undefined}
        aria-activedescendant={activeOptionId}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={onKeyDown}
      />

      {isPanelVisible ? (
        <div id={listboxId} className="results card" role={shouldRun ? 'listbox' : undefined}>
          {!shouldRun ? (
            <p className="hint debounce-hint" role="status" aria-live="polite" aria-atomic="true">
              Type at least 2 letters to search.
            </p>
          ) : (
            <>
              {fetching ? (
                <p className="hint" role="status" aria-live="polite" aria-atomic="true">
                  Searching...
                </p>
              ) : null}
              {!fetching && error && !hasNoResults ? (
                <p className="error" role="status" aria-live="polite" aria-atomic="true">
                  Unable to run search right now.
                </p>
              ) : null}
              {!fetching && !error && hasResults ? (
                <>
                  {characters.length ? (
                    <div>
                      <p className="section-label">Characters</p>
                      {characters.map((character) => {
                        const optionId = `search-option-character-${character.id}`
                        const selected = activeOptionId === optionId
                        return (
                          <Link
                            key={character.id}
                            className={`result-link ${selected ? 'active' : ''}`}
                            to={`/character/${character.id}`}
                            role="option"
                            id={optionId}
                            aria-selected={selected ? 'true' : 'false'}
                            tabIndex={-1}
                            onMouseEnter={() =>
                              setActiveOptionIndex(flattenedOptions.findIndex((option) => option.id === `character-${character.id}`))
                            }
                            onClick={closeDropdown}
                          >
                            {character.name}
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                  {episodes.length ? (
                    <div>
                      <p className="section-label">Episodes</p>
                      {episodes.map((episode) => {
                        const optionId = `search-option-episode-${episode.id}`
                        const selected = activeOptionId === optionId
                        return (
                          <Link
                            key={episode.id}
                            className={`result-link ${selected ? 'active' : ''}`}
                            to={`/episode/${episode.id}`}
                            role="option"
                            id={optionId}
                            aria-selected={selected ? 'true' : 'false'}
                            tabIndex={-1}
                            onMouseEnter={() =>
                              setActiveOptionIndex(flattenedOptions.findIndex((option) => option.id === `episode-${episode.id}`))
                            }
                            onClick={closeDropdown}
                          >
                            {episode.episode} - {episode.name}
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                  {locations.length ? (
                    <div>
                      <p className="section-label">Locations</p>
                      {locations.map((location) => {
                        const optionId = `search-option-location-${location.id}`
                        const selected = activeOptionId === optionId
                        return (
                          <Link
                            key={location.id}
                            className={`result-link ${selected ? 'active' : ''}`}
                            to={`/location/${location.id}`}
                            role="option"
                            id={optionId}
                            aria-selected={selected ? 'true' : 'false'}
                            tabIndex={-1}
                            onMouseEnter={() =>
                              setActiveOptionIndex(flattenedOptions.findIndex((option) => option.id === `location-${location.id}`))
                            }
                            onClick={closeDropdown}
                          >
                            {location.name}
                          </Link>
                        )
                      })}
                    </div>
                  ) : null}
                </>
              ) : null}
              {!fetching && (!hasResults || hasNoResults) ? (
                <p className="hint" role="status" aria-live="polite" aria-atomic="true">
                  No results for this query.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
