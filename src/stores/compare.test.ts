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
})
