'use client'
// src/components/filters/FiltersSidebar.tsx

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatPrice, buildQueryString } from '@/lib/utils/format'
import { X, SlidersHorizontal } from 'lucide-react'
import type { SearchFilters, ActiveFilters } from '@/types'

interface FiltersSidebarProps {
  currentFilters:      SearchFilters
  availableStores:     { id: string; slug: string; displayName: string; logoColor: string | null }[]
  availableCategories: { id: string; slug: string; displayName: string; icon: string | null }[]
  activeFilters:       ActiveFilters
}

export default function FiltersSidebar({
  currentFilters,
  availableStores,
  availableCategories,
  activeFilters,
}: FiltersSidebarProps) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.minPrice  ?? activeFilters.minPrice,
    currentFilters.maxPrice  ?? activeFilters.maxPrice,
  ])

  const applyFilter = useCallback((key: string, value: string | null) => {
    const params: Record<string, string | string[] | undefined> = {}
    searchParams?.forEach((v, k) => {
      if (k === 'page') return // reset page
      params[k] = v
    })

    if (value === null) {
      delete params[key]
    } else {
      params[key] = value
    }

    router.push(`/results${buildQueryString(params)}`)
  }, [router, searchParams])

  const toggleArrayFilter = useCallback((key: string, value: string) => {
    const current = searchParams?.getAll(key) ?? []
    let updated: string[]

    if (current.includes(value)) {
      updated = current.filter(v => v !== value)
    } else {
      updated = [...current, value]
    }

    const params: Record<string, string | string[] | undefined> = {}
    searchParams?.forEach((v, k) => {
      if (k === key || k === 'page') return
      params[k] = v
    })
    if (updated.length > 0) params[key] = updated

    router.push(`/results${buildQueryString(params)}`)
  }, [router, searchParams])

  const applyPriceRange = useCallback(() => {
    const params: Record<string, string | string[] | undefined> = {}
    searchParams?.forEach((v, k) => {
      if (k === 'minPrice' || k === 'maxPrice' || k === 'page') return
      params[k] = v
    })
    params.minPrice = String(priceRange[0])
    params.maxPrice = String(priceRange[1])
    router.push(`/results${buildQueryString(params)}`)
  }, [router, searchParams, priceRange])

  const clearAllFilters = useCallback(() => {
    const params: Record<string, string | string[] | undefined> = {}
    if (currentFilters.q) params.q = currentFilters.q
    router.push(`/results${buildQueryString(params)}`)
  }, [router, currentFilters.q])

  const hasActiveFilters = !!(
    currentFilters.storeSlug?.length ||
    currentFilters.brand?.length ||
    currentFilters.categorySlug ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.minDiscount
  )

  const selectedStores     = currentFilters.storeSlug    || []
  const selectedBrands     = currentFilters.brand        || []

  return (
    <div className="space-y-1">
      {/* Header filtros */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {/* ── Categorías ──────────────────────────────────────────────── */}
      <div className="filter-group">
        <h3 className="filter-title">Categoría</h3>
        <div className="space-y-1.5">
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => applyFilter('category',
                currentFilters.categorySlug === cat.slug ? null : cat.slug
              )}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm 
                transition-colors text-left
                ${currentFilters.categorySlug === cat.slug
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-medium'
                  : 'hover:bg-secondary text-foreground'
                }`}
            >
              {cat.icon && <span className="text-base">{cat.icon}</span>}
              <span className="truncate">{cat.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Rango de precio ────────────────────────────────────────── */}
      <div className="filter-group">
        <h3 className="filter-title">Rango de precio</h3>
        <div className="px-1">
          <Slider
            min={activeFilters.minPrice}
            max={activeFilters.maxPrice}
            step={1000}
            value={priceRange}
            onValueChange={v => setPriceRange(v as [number, number])}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={applyPriceRange}
          >
            Aplicar precio
          </Button>
        </div>
      </div>

      {/* ── Descuento mínimo ─────────────────────────────────────────── */}
      <div className="filter-group">
        <h3 className="filter-title">Descuento mínimo</h3>
        <div className="space-y-1.5">
          {[10, 20, 30, 50, 70].map(pct => (
            <button
              key={pct}
              onClick={() => applyFilter('minDiscount',
                currentFilters.minDiscount === pct ? null : String(pct)
              )}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md 
                text-sm transition-colors
                ${currentFilters.minDiscount === pct
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-medium'
                  : 'hover:bg-secondary text-foreground'
                }`}
            >
              <span>Desde {pct}% off</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tiendas ──────────────────────────────────────────────────── */}
      <div className="filter-group">
        <h3 className="filter-title">Tiendas</h3>
        <div className="space-y-2">
          {availableStores.map(store => (
            <div key={store.id} className="flex items-center gap-2">
              <Checkbox
                id={`store-${store.slug}`}
                checked={selectedStores.includes(store.slug)}
                onCheckedChange={() => toggleArrayFilter('store', store.slug)}
              />
              <Label
                htmlFor={`store-${store.slug}`}
                className="flex items-center gap-1.5 text-sm cursor-pointer font-normal"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: store.logoColor || '#888' }}
                />
                {store.displayName}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marcas (si hay disponibles) ──────────────────────────────── */}
      {activeFilters.brands.length > 0 && (
        <div className="filter-group">
          <h3 className="filter-title">Marcas</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeFilters.brands.slice(0, 20).map(brand => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleArrayFilter('brand', brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer font-normal truncate"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Período de oferta ────────────────────────────────────────── */}
      <div className="filter-group">
        <h3 className="filter-title">Período de oferta</h3>
        <div className="space-y-1.5">
          {[
            { label: 'Hoy',           value: '1'  },
            { label: 'Últimos 3 días', value: '3'  },
            { label: 'Esta semana',   value: '7'  },
            { label: 'Este mes',      value: '30' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => applyFilter('knastaday',
                String(currentFilters.knastaday) === opt.value ? null : opt.value
              )}
              className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-sm 
                transition-colors text-left
                ${String(currentFilters.knastaday) === opt.value
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-medium'
                  : 'hover:bg-secondary text-foreground'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
