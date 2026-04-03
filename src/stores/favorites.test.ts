import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from './favorites'

describe('favorites store', () => {
  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ hydrated: false, items: [] })
  })

  it('toggles favorite items and persists the data', () => {
    const store = useFavoritesStore.getState()
    store.toggle({
      id: '1',
      kind: 'character',
      name: 'Rick Sanchez',
      subtitle: 'Human - Alive',
      image: 'https://example.com/rick.png',
    })

    expect(useFavoritesStore.getState().items).toHaveLength(1)
    expect(useFavoritesStore.getState().isFavorite('1', 'character')).toBe(true)
    expect(localStorage.getItem('rm-favorites')).toContain('Rick Sanchez')

    store.toggle({
      id: '1',
      kind: 'character',
      name: 'Rick Sanchez',
      subtitle: 'Human - Alive',
      image: 'https://example.com/rick.png',
    })

    expect(useFavoritesStore.getState().items).toHaveLength(0)
    expect(useFavoritesStore.getState().isFavorite('1', 'character')).toBe(false)
  })
})
