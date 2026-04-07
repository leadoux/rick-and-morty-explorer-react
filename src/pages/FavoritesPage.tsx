import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppButton from '@/components/AppButton'
import { handleImageError } from '@/lib/image'
import { useFavoritesStore } from '@/stores/favorites'
import type { EntityKind } from '@/types/entities'

const pathFor = (kind: EntityKind, id: string) => {
  if (kind === 'character') return `/character/${id}`
  if (kind === 'episode') return `/episode/${id}`
  return `/location/${id}`
}

export default function FavoritesPage() {
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate)
  const items = useFavoritesStore((state) => state.items)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)

  useEffect(() => {
    hydrateFavorites()
  }, [hydrateFavorites])

  return (
    <section>
      <h1>Favorites</h1>
      <p className="description">Your saved picks are persisted locally and available after refresh.</p>

      {!items.length ? (
        <p className="hint" role="status" aria-live="polite" aria-atomic="true">
          No favorites yet. Save some items from the explorers.
        </p>
      ) : null}

      {items.length ? (
        <div className="grid">
          <h2 className="section-heading">Saved favorites ({items.length})</h2>
          {items.map((item) => (
            <article key={`${item.kind}:${item.id}`} className="card">
              {item.image ? (
                <Link className="image-link character-portrait-link" to={pathFor(item.kind, item.id)} aria-label={`Open ${item.name}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                  />
                </Link>
              ) : null}
              <h3>{item.name}</h3>
              <p className="meta">{item.subtitle}</p>
              <div className="row">
                <AppButton to={pathFor(item.kind, item.id)}>Open</AppButton>
                <AppButton variant="secondary" onClick={() => toggleFavorite(item)}>
                  Remove
                </AppButton>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
