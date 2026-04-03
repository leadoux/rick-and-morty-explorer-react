import { create } from 'zustand'
import type { EntityKind } from '@/types/entities'

const FAVORITES_STORAGE_KEY = 'rm-favorites'

export type FavoriteItem = {
  id: string
  kind: EntityKind
  name: string
  subtitle: string
  image?: string
}

type FavoritesState = {
  hydrated: boolean
  items: FavoriteItem[]
  hydrate: () => void
  isFavorite: (id: string, kind: EntityKind) => boolean
  toggle: (item: FavoriteItem) => void
}

const keyFor = (id: string, kind: EntityKind) => `${kind}:${id}`

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  hydrated: false,
  items: [],
  hydrate: () => {
    if (get().hydrated) return
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) {
      set({ hydrated: true })
      return
    }
    try {
      const parsed = JSON.parse(raw) as FavoriteItem[]
      set({ items: parsed, hydrated: true })
    } catch {
      set({ items: [], hydrated: true })
    }
  },
  isFavorite: (id: string, kind: EntityKind) => {
    return get().items.some((item) => keyFor(item.id, item.kind) === keyFor(id, kind))
  },
  toggle: (item: FavoriteItem) => {
    const currentItems = get().items
    const existingIndex = currentItems.findIndex(
      (entry) => keyFor(entry.id, entry.kind) === keyFor(item.id, item.kind),
    )

    const nextItems =
      existingIndex > -1
        ? currentItems.filter((_, index) => index !== existingIndex)
        : [item, ...currentItems]

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextItems))
    set({ items: nextItems })
  },
}))
