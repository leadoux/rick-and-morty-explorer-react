import { beforeEach, describe, expect, it } from 'vitest'
import { useCompareStore } from './compare'

describe('compare store', () => {
  beforeEach(() => {
    useCompareStore.setState({
      characters: [],
      episodes: [],
      canCompareCharacters: false,
      canCompareEpisodes: false,
    })
  })

  it('keeps at most two characters and drops oldest', () => {
    const store = useCompareStore.getState()

    store.toggleCharacter({ id: '1', name: 'A', image: 'a', status: 'alive', species: 'Human' })
    store.toggleCharacter({ id: '2', name: 'B', image: 'b', status: 'alive', species: 'Alien' })
    store.toggleCharacter({ id: '3', name: 'C', image: 'c', status: 'dead', species: 'Robot' })

    expect(useCompareStore.getState().characters.map((item) => item.id)).toEqual(['2', '3'])
    expect(useCompareStore.getState().canCompareCharacters).toBe(true)
  })

  describe('isCharacterCompared', () => {
    it('returns false before any character is added', () => {
      expect(useCompareStore.getState().isCharacterCompared('1')).toBe(false)
    })

    it('returns true after a character is toggled in', () => {
      const store = useCompareStore.getState()
      store.toggleCharacter({ id: '1', name: 'A', image: 'a', status: 'alive', species: 'Human' })
      expect(useCompareStore.getState().isCharacterCompared('1')).toBe(true)
    })

    it('returns false after a character is toggled out', () => {
      const store = useCompareStore.getState()
      store.toggleCharacter({ id: '1', name: 'A', image: 'a', status: 'alive', species: 'Human' })
      store.toggleCharacter({ id: '1', name: 'A', image: 'a', status: 'alive', species: 'Human' })
      expect(useCompareStore.getState().isCharacterCompared('1')).toBe(false)
    })

    it('returns false for shifted-out character when max 2 is exceeded', () => {
      const store = useCompareStore.getState()
      store.toggleCharacter({ id: '1', name: 'A', image: 'a', status: 'alive', species: 'Human' })
      store.toggleCharacter({ id: '2', name: 'B', image: 'b', status: 'alive', species: 'Alien' })
      store.toggleCharacter({ id: '3', name: 'C', image: 'c', status: 'dead', species: 'Robot' })
      expect(useCompareStore.getState().isCharacterCompared('1')).toBe(false)
      expect(useCompareStore.getState().isCharacterCompared('2')).toBe(true)
      expect(useCompareStore.getState().isCharacterCompared('3')).toBe(true)
    })
  })

  describe('isEpisodeCompared', () => {
    it('returns false before any episode is added', () => {
      expect(useCompareStore.getState().isEpisodeCompared('1')).toBe(false)
    })

    it('returns true after an episode is toggled in', () => {
      const store = useCompareStore.getState()
      store.toggleEpisode({ id: '1', name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' })
      expect(useCompareStore.getState().isEpisodeCompared('1')).toBe(true)
    })

    it('returns false after an episode is toggled out', () => {
      const store = useCompareStore.getState()
      store.toggleEpisode({ id: '1', name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' })
      store.toggleEpisode({ id: '1', name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' })
      expect(useCompareStore.getState().isEpisodeCompared('1')).toBe(false)
    })

    it('returns false for shifted-out episode when max 2 is exceeded', () => {
      const store = useCompareStore.getState()
      store.toggleEpisode({ id: '1', name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' })
      store.toggleEpisode({ id: '2', name: 'Lawnmower Dog', episode: 'S01E02', air_date: 'December 9, 2013' })
      store.toggleEpisode({ id: '3', name: 'Anatomy Park', episode: 'S01E03', air_date: 'December 16, 2013' })
      expect(useCompareStore.getState().isEpisodeCompared('1')).toBe(false)
      expect(useCompareStore.getState().isEpisodeCompared('2')).toBe(true)
      expect(useCompareStore.getState().isEpisodeCompared('3')).toBe(true)
    })
  })
})
