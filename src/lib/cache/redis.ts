// src/lib/cache/redis.ts
// Cliente Redis con fallback a Map en memoria (para desarrollo sin Redis)

import Redis from 'ioredis'

// ─────────────────────────────────────────────
// Fallback en memoria para desarrollo
// ─────────────────────────────────────────────
class MemoryCache {
  private store = new Map<string, { value: string; expiresAt: number | null }>()

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, exSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: exSeconds ? Date.now() + exSeconds * 1000 : null,
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return Array.from(this.store.keys()).filter(k => regex.test(k))
  }
}

// ─────────────────────────────────────────────
// Instancia del cliente
// ─────────────────────────────────────────────
let redisClient: Redis | MemoryCache

function getRedisClient(): Redis | MemoryCache {
  if (redisClient) return redisClient

  if (!process.env.REDIS_URL) {
    console.warn('[Cache] REDIS_URL no definida, usando caché en memoria')
    redisClient = new MemoryCache()
    return redisClient
  }

  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    })

    client.on('error', (err) => {
      console.error('[Redis] Error de conexión:', err.message)
    })

    redisClient = client
    return redisClient
  } catch {
    console.warn('[Cache] Error conectando Redis, usando caché en memoria')
    redisClient = new MemoryCache()
    return redisClient
  }
}

// ─────────────────────────────────────────────
// API de caché con tipado genérico
// ─────────────────────────────────────────────

const TTL = {
  PRODUCTS:     60 * 5,       // 5 minutos
  SEARCH:       60 * 2,       // 2 minutos
  PRODUCT_DETAIL: 60 * 10,   // 10 minutos
  PRICE_HISTORY: 60 * 30,    // 30 minutos
  STORES:       60 * 60 * 24, // 24 horas
  CATEGORIES:   60 * 60 * 24, // 24 horas
  AUTOCOMPLETE: 60 * 60,      // 1 hora
} as const

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient()
      const raw = await client.get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch (err) {
      console.error('[Cache] get error:', err)
      return null
    }
  },

  async set<T>(key: string, value: T, ttlSeconds = TTL.PRODUCTS): Promise<void> {
    try {
      const client = getRedisClient()
      const serialized = JSON.stringify(value)
      await client.set(key, serialized, 'EX' as never, ttlSeconds as never)
    } catch (err) {
      console.error('[Cache] set error:', err)
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient()
      await client.del(key)
    } catch (err) {
      console.error('[Cache] del error:', err)
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const client = getRedisClient()
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await Promise.all(keys.map(k => client.del(k)))
      }
    } catch (err) {
      console.error('[Cache] invalidatePattern error:', err)
    }
  },

  /**
   * Cache-aside helper: retorna el valor cacheado o ejecuta la función y guarda el resultado
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = TTL.PRODUCTS
  ): Promise<T> {
    const cached = await cache.get<T>(key)
    if (cached !== null) return cached

    const fresh = await fetcher()
    await cache.set(key, fresh, ttlSeconds)
    return fresh
  },

  TTL,
}

// ─────────────────────────────────────────────
// Helpers de claves de caché estandarizadas
// ─────────────────────────────────────────────
export const cacheKeys = {
  product:       (id: string)       => `product:${id}`,
  productDetail: (id: string)       => `product:detail:${id}`,
  priceHistory:  (id: string)       => `price-history:${id}`,
  search:        (params: string)   => `search:${params}`,
  stores:        ()                 => 'stores:all',
  categories:    ()                 => 'categories:all',
  autocomplete:  (q: string)        => `autocomplete:${q.toLowerCase().slice(0, 50)}`,
  homeOffers:    ()                 => 'home:offers',
  homeFeatured:  ()                 => 'home:featured',
}
