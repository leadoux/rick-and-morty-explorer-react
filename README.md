# Rick and Morty Explorer (React)

A React + TypeScript implementation of the Rick and Morty explorer app, matching the feature set of the Vue version:

- Global search across characters, episodes, and locations
- Explorer pages with URL-synced filters and pagination
- Character, episode, and location detail pages
- Favorites persisted in localStorage
- Compare workspace for side-by-side character/episode comparison
- Dark mode with persisted preference

## Stack

- React + React Router
- urql + GraphQL
- Zustand
- Vite

## Development

```sh
npm install
npm run dev
```

Dev requests are proxied through `/graphql` to avoid local browser CORS issues.

## Build and Quality

```sh
npm run lint
npm run build
npm run test:run
```
