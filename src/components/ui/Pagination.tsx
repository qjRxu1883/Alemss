'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildQueryString } from '@/lib/utils/format'

interface PaginationProps {
  currentPage: number
  totalPages:  number
  baseParams:  Record<string, string | string[] | undefined>
}

export default function Pagination({ currentPage, totalPages, baseParams }: PaginationProps) {
  const router = useRouter()

  function goTo(page: number) {
    const params = { ...baseParams, page: String(page) }
    router.push(`/results${buildQueryString(params)}`)
  }

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => goTo(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
            ${page === currentPage
              ? 'bg-brand-600 text-white'
              : 'hover:bg-secondary text-foreground'
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
