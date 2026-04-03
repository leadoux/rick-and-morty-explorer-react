import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { createCachedGraphqlFetch } from '@/lib/graphqlCache'
import { usePreferencesStore } from '@/stores/preferences'
import './index.css'
import App from './App.tsx'

const client = createClient({
  url: import.meta.env.DEV
    ? '/graphql'
    : (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ?? 'https://rickandmortyapi.com/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
  fetchOptions: {
    method: 'POST',
  },
  fetch: createCachedGraphqlFetch(),
})

usePreferencesStore.getState().initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider value={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
