import { openDB } from 'idb'

type CachedGraphqlPayload = {
  data?: unknown
  errors?: unknown
}

type CacheEntry = {
  key: string
  createdAt: number
  payload: CachedGraphqlPayload
}

const DB_NAME = 'rm-graphql-cache'
const STORE_NAME = 'responses'
const DB_VERSION = 1
const isDev = import.meta.env.DEV

const databasePromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      store.createIndex('createdAt', 'createdAt')
    }
  },
})

const toCacheResponse = (payload: CachedGraphqlPayload, state: 'HIT' | 'STALE') =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'x-rm-cache': state,
    },
  })

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hashBuffer)].map((item) => item.toString(16).padStart(2, '0')).join('')
}

const debugLog = (...args: unknown[]) => {
  if (!isDev) return
  console.debug('[graphql-cache]', ...args)
}

const readCacheEntry = async (key: string) => {
  const db = await databasePromise
  return db.get(STORE_NAME, key) as Promise<CacheEntry | undefined>
}

const writeCacheEntry = async (entry: CacheEntry) => {
  const db = await databasePromise
  await db.put(STORE_NAME, entry)
}

const pruneOldEntries = async (maxEntries: number) => {
  const db = await databasePromise
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const index = store.index('createdAt')
  const entryCount = await store.count()

  if (entryCount > maxEntries) {
    const toRemoveCount = entryCount - maxEntries
    let removed = 0
    let cursor = await index.openCursor()

    while (cursor && removed < toRemoveCount) {
      await cursor.delete()
      removed += 1
      cursor = await cursor.continue()
    }
  }

  await tx.done
}

const readRequestBody = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof init?.body === 'string') return init.body

  if (input instanceof Request) {
    try {
      return await input.clone().text()
    } catch {
      return undefined
    }
  }

  return undefined
}

export const createCachedGraphqlFetch = (ttlMs = 10 * 60 * 1000, maxEntries = 200): typeof fetch => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const body = await readRequestBody(input, init)
    const urlForKey = method === 'GET' ? requestUrl : undefined

    if (
      !['POST', 'GET'].includes(method) ||
      (!body && !urlForKey) ||
      !('indexedDB' in globalThis) ||
      !('crypto' in globalThis) ||
      !globalThis.crypto?.subtle
    ) {
      return fetch(input, init)
    }

    try {
      if (body) {
        const parsedBody = JSON.parse(body) as { query?: string }
        const queryText = parsedBody.query ?? ''
        if (queryText.includes('mutation')) return fetch(input, init)
      }

      const cacheSource = body ?? urlForKey ?? ''
      const cacheKey = await sha256(cacheSource)
      const now = Date.now()
      const cached = await readCacheEntry(cacheKey)

      if (cached && now - cached.createdAt < ttlMs) {
        debugLog('hit', method, requestUrl)
        return toCacheResponse(cached.payload, 'HIT')
      }

      const networkResponse = await fetch(input, init)
      if (networkResponse.status === 429 && cached) {
        debugLog('stale-fallback', method, requestUrl)
        return toCacheResponse(cached.payload, 'STALE')
      }

      if (!networkResponse.ok) return networkResponse

      const payload = (await networkResponse.clone().json()) as CachedGraphqlPayload
      if (payload.data && !payload.errors) {
        await writeCacheEntry({ key: cacheKey, createdAt: now, payload })
        debugLog('write', method, requestUrl)
        void pruneOldEntries(maxEntries)
      }

      return networkResponse
    } catch {
      debugLog('bypass', method, requestUrl)
      return fetch(input, init)
    }
  }
}
