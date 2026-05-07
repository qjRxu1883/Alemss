// src/lib/db/products.ts
// Funciones de consulta de productos con caché integrado

import { prisma } from './client'
import { cache, cacheKeys } from '../cache/redis'
import type { SearchFilters, ProductCard, ProductDetail, SearchResult } from '@/types'

// ─────────────────────────────────────────────
// SELECT base para tarjetas de producto
// ─────────────────────────────────────────────
const productCardSelect = {
  id:              true,
  externalId:      true,
  title:           true,
  slug:            true,
  brand:           true,
  imageUrl:        true,
  currentPrice:    true,
  normalPrice:     true,
  cardPrice:       true,
  discountPercent: true,
  isOnSale:        true,
  isAvailable:     true,
  url:             true,
  lastScrapedAt:   true,
  store: {
    select: {
      id:          true,
      slug:        true,
      name:        true,
      displayName: true,
      url:         true,
      logoUrl:     true,
      logoColor:   true,
    },
  },
  category: {
    select: {
      id:          true,
      slug:        true,
      displayName: true,
      icon:        true,
    },
  },
} as const

// ─────────────────────────────────────────────
// BÚSQUEDA CON FILTROS
// ─────────────────────────────────────────────
export async function searchProducts(filters: SearchFilters): Promise<SearchResult> {
  const {
    q,
    categorySlug,
    storeSlug,
    minPrice,
    maxPrice,
    minDiscount = 0,
    brand,
    sort = 'discount_desc',
    knastaday,
    page = 1,
    limit = 24,
  } = filters

  const cacheKey = cacheKeys.search(JSON.stringify(filters))
  const cached = await cache.get<SearchResult>(cacheKey)
  if (cached) return cached

  // Construir WHERE dinámico
  const where: Record<string, unknown> = {
    isAvailable: true,
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  if (storeSlug && storeSlug.length > 0) {
    where.store = { slug: { in: storeSlug } }
  }

  if (minPrice || maxPrice) {
    where.currentPrice = {}
    if (minPrice) (where.currentPrice as Record<string, number>).gte = minPrice
    if (maxPrice) (where.currentPrice as Record<string, number>).lte = maxPrice
  }

  if (minDiscount > 0) {
    where.discountPercent = { gte: minDiscount }
  }

  if (brand && brand.length > 0) {
    where.brand = { in: brand, mode: 'insensitive' }
  }

  // Filtro por días (productos con descuento reciente)
  if (knastaday) {
    const since = new Date()
    since.setDate(since.getDate() - knastaday)
    where.lastScrapedAt = { gte: since }
    where.isOnSale = true
  }

  // Orden
  const orderByMap: Record<string, unknown> = {
    price_asc:     { currentPrice: 'asc' },
    price_desc:    { currentPrice: 'desc' },
    discount_desc: { discountPercent: 'desc' },
    newest:        { createdAt: 'desc' },
    popular:       { viewCount: 'desc' },
  }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where:   where as Parameters<typeof prisma.product.findMany>[0]['where'],
      select:  productCardSelect,
      orderBy: orderByMap[sort] as Parameters<typeof prisma.product.findMany>[0]['orderBy'],
      skip,
      take:    limit,
    }),
    prisma.product.count({
      where: where as Parameters<typeof prisma.product.count>[0]['where'],
    }),
  ])

  // Agregar información de filtros activos (marcas/tiendas disponibles en resultados)
  const [brands, stores] = await Promise.all([
    prisma.product.findMany({
      where: where as Parameters<typeof prisma.product.findMany>[0]['where'],
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
    prisma.store.findMany({
      where:  { products: { some: where as Parameters<typeof prisma.product.findMany>[0]['where'] } },
      select: { id: true, slug: true, name: true, displayName: true, url: true, logoUrl: true, logoColor: true },
    }),
  ])

  const priceAgg = await prisma.product.aggregate({
    where:  where as Parameters<typeof prisma.product.aggregate>[0]['where'],
    _min:   { currentPrice: true },
    _max:   { currentPrice: true },
  })

  const result: SearchResult = {
    products: products as unknown as ProductCard[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
    filters: {
      brands:   brands.map(b => b.brand).filter(Boolean) as string[],
      stores:   stores as unknown as SearchResult['filters']['stores'],
      minPrice: priceAgg._min.currentPrice ?? 0,
      maxPrice: priceAgg._max.currentPrice ?? 9999999,
    },
  }

  await cache.set(cacheKey, result, cache.TTL.SEARCH)
  return result
}

// ─────────────────────────────────────────────
// DETALLE DE PRODUCTO
// ─────────────────────────────────────────────
export async function getProductDetail(
  storeSlug: string,
  externalId: string
): Promise<ProductDetail | null> {
  const cacheKey = cacheKeys.productDetail(`${storeSlug}:${externalId}`)
  const cached = await cache.get<ProductDetail>(cacheKey)
  if (cached) return cached

  const product = await prisma.product.findFirst({
    where: {
      externalId,
      store: { slug: storeSlug },
    },
    include: {
      store:    { select: { id: true, slug: true, name: true, displayName: true, url: true, logoUrl: true, logoColor: true } },
      category: { select: { id: true, slug: true, displayName: true, icon: true } },
      priceHistory: {
        orderBy: { recordedAt: 'asc' },
        take:    365,  // Último año
        select: {
          price:           true,
          normalPrice:     true,
          discountPercent: true,
          recordedAt:      true,
        },
      },
    },
  })

  if (!product) return null

  // Incrementar contador de vistas (fire and forget)
  prisma.product.update({
    where: { id: product.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => {}) // No bloquear

  const detail = product as unknown as ProductDetail
  await cache.set(cacheKey, detail, cache.TTL.PRODUCT_DETAIL)
  return detail
}

// ─────────────────────────────────────────────
// OFERTAS DEL DÍA (home)
// ─────────────────────────────────────────────
export async function getDayOffers(limit = 12): Promise<ProductCard[]> {
  return cache.getOrSet(
    cacheKeys.homeOffers(),
    async () => {
      const since = new Date()
      since.setHours(0, 0, 0, 0)

      const products = await prisma.product.findMany({
        where: {
          isOnSale:    true,
          isAvailable: true,
          discountPercent: { gte: 10 },
          lastScrapedAt:   { gte: since },
        },
        select:  productCardSelect,
        orderBy: { discountPercent: 'desc' },
        take:    limit,
      })

      return products as unknown as ProductCard[]
    },
    cache.TTL.PRODUCTS
  )
}

// ─────────────────────────────────────────────
// PRODUCTOS MÁS POPULARES
// ─────────────────────────────────────────────
export async function getPopularProducts(limit = 12): Promise<ProductCard[]> {
  return cache.getOrSet(
    'products:popular',
    async () => {
      const products = await prisma.product.findMany({
        where: { isAvailable: true },
        select: productCardSelect,
        orderBy: { viewCount: 'desc' },
        take: limit,
      })
      return products as unknown as ProductCard[]
    },
    cache.TTL.PRODUCTS
  )
}

// ─────────────────────────────────────────────
// BAJADAS DE PRECIO RECIENTES
// ─────────────────────────────────────────────
export async function getPriceDrops(limit = 12): Promise<ProductCard[]> {
  return cache.getOrSet(
    'products:price-drops',
    async () => {
      const since = new Date()
      since.setDate(since.getDate() - 3)

      const products = await prisma.product.findMany({
        where: {
          isOnSale:    true,
          isAvailable: true,
          discountPercent: { gte: 5 },
          updatedAt:   { gte: since },
        },
        select:  productCardSelect,
        orderBy: { updatedAt: 'desc' },
        take:    limit,
      })

      return products as unknown as ProductCard[]
    },
    cache.TTL.PRODUCTS
  )
}

// ─────────────────────────────────────────────
// AUTOCOMPLETADO
// ─────────────────────────────────────────────
export async function getAutocomplete(q: string): Promise<string[]> {
  if (q.length < 2) return []

  return cache.getOrSet(
    cacheKeys.autocomplete(q),
    async () => {
      const [products, queries] = await Promise.all([
        prisma.product.findMany({
          where: {
            title: { contains: q, mode: 'insensitive' },
            isAvailable: true,
          },
          select: { title: true, brand: true },
          distinct: ['title'],
          take: 6,
        }),
        prisma.searchQuery.findMany({
          where: { query: { contains: q, mode: 'insensitive' } },
          orderBy: { count: 'desc' },
          take: 4,
        }),
      ])

      const suggestions = [
        ...queries.map(q => q.query),
        ...products.map(p => p.brand ? `${p.brand} ${p.title}`.trim() : p.title),
      ]

      // Deduplicar y limitar
      return [...new Set(suggestions)].slice(0, 8)
    },
    cache.TTL.AUTOCOMPLETE
  )
}

// ─────────────────────────────────────────────
// PRODUCTOS POR CATEGORÍA
// ─────────────────────────────────────────────
export async function getProductsByCategory(
  categorySlug: string,
  limit = 12
): Promise<ProductCard[]> {
  return cache.getOrSet(
    `products:category:${categorySlug}`,
    async () => {
      const products = await prisma.product.findMany({
        where: {
          category:    { slug: categorySlug },
          isAvailable: true,
          isOnSale:    true,
        },
        select:  productCardSelect,
        orderBy: { discountPercent: 'desc' },
        take:    limit,
      })
      return products as unknown as ProductCard[]
    },
    cache.TTL.PRODUCTS
  )
}
