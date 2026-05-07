'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildQueryString } from '@/lib/utils/format'
import type { SearchFilters, ActiveFilters, SortOption } from '@/types'

interface ResultsHeaderProps {
  total:               number
  currentSort:         SortOption
  currentFilters:      SearchFilters
  availableStores:     { id: string; slug: string; displayName: string; logoColor: string | null }[]
  availableCategories: { id: string; slug: string; displayName: string; icon: string | null }[]
  activeFilters:       ActiveFilters
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'discount_desc', label: 'Mayor descuento' },
  { value: 'price_asc',     label: 'Menor precio'   },
  { value: 'price_desc',    label: 'Mayor precio'   },
  { value: 'newest',        label: 'Más recientes'  },
  { value: 'popular',       label: 'Más populares'  },
]

export default function ResultsHeader({
  total, currentSort, currentFilters,
}: ResultsHeaderProps) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  function changeSort(sort: SortOption) {
    const params: Record<string, string | string[] | undefined> = {}
    searchParams?.forEach((v, k) => { params[k] = v })
    params.sort = sort
    delete params.page
    router.push(`/results${buildQueryString(params)}`)
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {total.toLocaleString('es-CL')}
        </span>{' '}
        producto{total !== 1 ? 's' : ''}
        {currentFilters.q && (
          <> para <span className="font-medium">"{currentFilters.q}"</span></>
        )}
      </p>

      <select
        value={currentSort}
        onChange={e => changeSort(e.target.value as SortOption)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background
          focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
