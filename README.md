# Rick and Morty Explorer

[![CI](https://github.com/leadoux/rick-and-morty-explorer-react/actions/workflows/ci.yml/badge.svg)](https://github.com/leadoux/rick-and-morty-explorer-react/actions/workflows/ci.yml)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Frm-react.leadoux.dev&label=live%20site)](https://rm-react.leadoux.dev)

A React + TypeScript project that demonstrates:

- React fundamentals (components, hooks, routing, and centralized state)
- GraphQL API integration against the [Rick and Morty API](https://rickandmortyapi.com/graphql)
- UX polish (responsive layouts, loading/error/empty states, dark mode)
- Basic testing quality with Vitest unit coverage for critical logic

> Project status: this repository is approximately **60% complete**.

Live app: [https://rm-react.leadoux.dev](https://rm-react.leadoux.dev)

## Feature Map

- **Global search** across characters, episodes, and locations.
- **Explorer pages** with URL-synced filters and pagination:
  - Characters (`status`, `species`, `gender`, `name`)
  - Episodes (`name`, `season`)
  - Locations (`name`, `type`, `dimension`)
- **Detail pages** for each entity with relationship navigation.
- **Favorites** persisted in `localStorage`.
- **Compare workspace** for side-by-side character/episode comparison.
- **Dark mode** with persisted preference.

## Architecture Snapshot

- `src/App.tsx` contains route-based application flow.
- `src/stores` contains Zustand stores for favorites, compare state, and theme preferences.
- `src/lib/queries.ts` centralizes GraphQL operations.
- `src/lib/graphqlCache.ts` adds IndexedDB response caching with TTL and stale fallback on API rate limits.
- `src/pages` provides page-level feature modules.
- `src/components` contains reusable UI elements (header, global search, pagination, buttons).

The app keeps API querying close to page modules through reusable hooks and `urql`, while shared stores manage cross-page state such as theme, favorites, and compare selections.

## Local Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

The dev server proxies GraphQL requests through `/graphql` to avoid browser CORS issues during local development.
For deployed environments, you can optionally set `VITE_GRAPHQL_URL` to route through your own backend/proxy endpoint.

## Quality Checks

```sh
pnpm lint
pnpm build
pnpm test:run
```

## Current Test Coverage

- Store behavior: favorites toggle/persistence and compare max-two logic.
- GraphQL UX logic: no-results error detection handling.

## Deployment

This is a static Vite application. Deploy the `dist/` output after:

```sh
pnpm build
```
