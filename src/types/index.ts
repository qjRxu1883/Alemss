// src/types/index.ts — Tipos globales de Alemss

// ─────────────────────────────────────────────
// PRODUCTO
// ─────────────────────────────────────────────

export interface ProductCard {
  id:              string
  externalId:      string
  title:           string
  slug:            string
  brand:           string | null
  imageUrl:        string | null
  currentPrice:    number
  normalPrice:     number | null
  cardPrice:       number | null
  discountPercent: number | null
  isOnSale:        boolean
  isAvailable:     boolean
  url:             string
  store:           StoreInfo
  category:        CategoryInfo | null
  lastScrapedAt:   Date | null
}

export interface ProductDetail extends ProductCard {
  description:     string | null
  imageUrls:       string[]
  model:           string | null
  sku:             string | null
  ean:             string | null
  minPrice:        number | null
  maxPrice:        number | null
  viewCount:       number
  favoriteCount:   number
  priceHistory:    PricePoint[]
  createdAt:       Date
}

export interface PricePoint {
  price:           number
  normalPrice:     number | null
  discountPercent: number | null
  recordedAt:      Date
}

// ─────────────────────────────────────────────
// TIENDA
// ─────────────────────────────────────────────

export interface StoreInfo {
  id:          string
  slug:        string
  name:        string
  displayName: string
  url:         string
  logoUrl:     string | null
  logoColor:   string | null
}

// ─────────────────────────────────────────────
// CATEGORÍA
// ─────────────────────────────────────────────

export interface CategoryInfo {
  id:          string
  slug:        string
  displayName: string
  icon:        string | null
}

export interface CategoryTree extends CategoryInfo {
  children:    CategoryTree[]
  level:       number
  sortOrder:   number
}

// ─────────────────────────────────────────────
// BÚSQUEDA Y FILTROS
// ─────────────────────────────────────────────

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'discount_desc'
  | 'newest'
  | 'popular'

export interface SearchFilters {
  q?:            string
  categorySlug?: string
  storeSlug?:    string[]
  minPrice?:     number
  maxPrice?:     number
  minDiscount?:  number
  brand?:        string[]
  sort?:         SortOption
  knastaday?:    number  // Productos con descuento en los últimos N días
  page?:         number
  limit?:        number
}

export interface SearchResult {
  products:    ProductCard[]
  total:       number
  page:        number
  totalPages:  number
  filters:     ActiveFilters
}

export interface ActiveFilters {
  brands:      string[]
  stores:      StoreInfo[]
  minPrice:    number
  maxPrice:    number
}

// ─────────────────────────────────────────────
// ALERTAS Y FAVORITOS
// ─────────────────────────────────────────────

export interface PriceAlertInput {
  productId:   string
  targetPrice: number
}

export interface AlertWithProduct {
  id:          string
  targetPrice: number
  isActive:    boolean
  createdAt:   Date
  product:     ProductCard
}

// ─────────────────────────────────────────────
// SCRAPER
// ─────────────────────────────────────────────

export interface ScrapedProduct {
  externalId:  string
  title:       string
  brand?:      string
  model?:      string
  imageUrl?:   string
  imageUrls?:  string[]
  url:         string
  currentPrice: number
  normalPrice?: number
  cardPrice?:   number
  sku?:         string
  ean?:         string
  categorySlug?: string
  isAvailable:  boolean
}

export interface ScraperConfig {
  storeSlug:    string
  baseUrl:      string
  concurrency:  number
  delayMs:      number
  userAgent?:   string
}

export interface ScraperResult {
  storeSlug:        string
  productsFound:    number
  productsUpdated:  number
  productsNew:      number
  priceChanges:     number
  errors:           string[]
  durationMs:       number
}

// ─────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data:    T
}

export interface ApiError {
  success: false
  error:   string
  code?:   string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────
// PAGINACIÓN
// ─────────────────────────────────────────────

export interface PaginationMeta {
  page:        number
  limit:       number
  total:       number
  totalPages:  number
  hasNext:     boolean
  hasPrev:     boolean
}
