// src/app/results/page.tsx — Página de resultados/búsqueda

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { searchProducts } from '@/lib/db/products'
import { prisma } from '@/lib/db/client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard, { ProductCardSkeleton } from '@/components/products/ProductCard'
import FiltersSidebar from '@/components/filters/FiltersSidebar'
import ResultsHeader from '@/components/filters/ResultsHeader'
import Pagination from '@/components/ui/Pagination'
import type { SearchFilters, SortOption } from '@/types'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const category = typeof params.category === 'string' ? params.category : ''

  const title = q
    ? `"${q}" - Comparar precios en Chile`
    : category
    ? `Ofertas ${category} en Chile`
    : 'Resultados - Alemss'

  return {
    title,
    description: `Compara precios de ${q || category || 'productos'} en Falabella, Paris, Ripley y más tiendas de Chile.`,
  }
}

// ─────────────────────────────────────────────
// Parsear searchParams a SearchFilters
// ─────────────────────────────────────────────
function parseFilters(params: Record<string, string | string[] | undefined>): SearchFilters {
  const getStr  = (k: string) => (typeof params[k] === 'string' ? params[k] as string : undefined)
  const getNum  = (k: string) => { const v = getStr(k); return v ? Number(v) : undefined }
  const getArr  = (k: string): string[] => {
    const v = params[k]
    if (!v) return []
    return Array.isArray(v) ? v : [v]
  }

  return {
    q:            getStr('q'),
    categorySlug: getStr('category'),
    storeSlug:    getArr('store').length > 0 ? getArr('store') : getArr('partners'),
    minPrice:     getNum('minPrice'),
    maxPrice:     getNum('maxPrice'),
    minDiscount:  getNum('minDiscount'),
    brand:        getArr('brand'),
    sort:         (getStr('sort') as SortOption) || 'discount_desc',
    knastaday:    getNum('knastaday'),
    page:         getNum('page') || 1,
    limit:        24,
  }
}

// ─────────────────────────────────────────────
// Skeleton grilla mientras carga
// ─────────────────────────────────────────────
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default async function ResultsPage({ searchParams }: PageProps) {
  const params  = await searchParams
  const filters = parseFilters(params)

  const [results, stores, categories] = await Promise.all([
    searchProducts(filters),
    prisma.store.findMany({
      where:   { isActive: true },
      orderBy: { priority: 'asc' },
      select:  { id: true, slug: true, displayName: true, logoUrl: true, logoColor: true, url: true, name: true },
    }),
    prisma.category.findMany({
      where:   { isActive: true, level: 0 },
      orderBy: { sortOrder: 'asc' },
      select:  { id: true, slug: true, displayName: true, icon: true },
    }),
  ])

  const pageTitle = filters.q
    ? `Resultados para "${filters.q}"`
    : filters.categorySlug
    ? `Ofertas ${filters.categorySlug}`
    : filters.knastaday === 1
    ? 'Ofertas de hoy'
    : 'Todos los productos'

  return (
    <>
      <Header />

      <div className="site-container py-6">
        {/* Breadcrumb mínimo */}
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <a href="/" className="hover:text-foreground transition-colors">Inicio</a>
          <span>/</span>
          <span className="text-foreground font-medium">{pageTitle}</span>
        </nav>

        <div className="flex gap-6">
          {/* ── Sidebar de filtros ──────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <FiltersSidebar
              currentFilters={filters}
              availableStores={stores}
              availableCategories={categories}
              activeFilters={results.filters}
            />
          </aside>

          {/* ── Contenido principal ─────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Header de resultados: total + sort + vista */}
            <ResultsHeader
              total={results.total}
              currentSort={filters.sort || 'discount_desc'}
              currentFilters={filters}
              availableStores={stores}
              availableCategories={categories}
              activeFilters={results.filters}
            />

            {/* Grilla de productos */}
            {results.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
                  {results.products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isToday={filters.knastaday === 1}
                      position={i}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {results.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={results.page}
                      totalPages={results.totalPages}
                      baseParams={params}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  No encontramos productos con estos filtros. Intenta con otra búsqueda o amplía los filtros.
                </p>
                <a href="/results"
                  className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                  Ver todos los productos
                </a>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
