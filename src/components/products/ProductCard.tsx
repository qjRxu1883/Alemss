'use client'
// src/components/products/ProductCard.tsx
// Tarjeta de producto principal - pixel-perfect similar a knasta.cl

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Bell, TrendingDown, ExternalLink } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import type { ProductCard as ProductCardType } from '@/types'
import { formatPrice } from '@/lib/utils/format'

interface ProductCardProps {
  product:   ProductCardType
  className?: string
  /** Mostrar badge "Oferta de hoy" */
  isToday?:  boolean
  /** Posición en la grilla para tracking */
  position?: number
}

export default function ProductCard({
  product,
  className = '',
  isToday = false,
  position,
}: ProductCardProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFav,  setLoadingFav] = useState(false)
  const [imageError,  setImageError] = useState(false)

  const detailHref = `/detail/${product.store.slug}/${product.externalId}/${product.slug}`

  // ── Favorito ────────────────────────────────────────────────────────────
  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Inicia sesión para guardar favoritos')
      return
    }

    setLoadingFav(true)
    try {
      const res = await fetch('/api/favorites', {
        method:  isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId: product.id }),
      })
      if (res.ok) {
        setIsFavorite(!isFavorite)
        toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
      }
    } catch {
      toast.error('Error al actualizar favoritos')
    } finally {
      setLoadingFav(false)
    }
  }

  // ── Alerta de precio ────────────────────────────────────────────────────
  async function createAlert(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Inicia sesión para crear alertas')
      return
    }

    // Sugerir 10% menos del precio actual
    const target = Math.round(product.currentPrice * 0.9)
    toast.info(`Alerta creada: te avisamos si baja de ${formatPrice(target)}`, {
      action: {
        label: 'Ver alertas',
        onClick: () => window.location.href = '/alertas',
      },
    })

    await fetch('/api/alerts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: product.id, targetPrice: target }),
    })
  }

  return (
    <article
      className={`group relative bg-card border border-border rounded-xl overflow-hidden
        product-card-hover flex flex-col ${className}`}
    >
      {/* ── Badges superiores ─────────────────────────────────────────── */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          {/* Badge descuento */}
          {product.discountPercent && product.discountPercent >= 5 && (
            <span className="badge-discount pointer-events-none">
              <TrendingDown className="w-3 h-3" />
              {product.discountPercent}% de descuento
            </span>
          )}
          {/* Badge oferta del día */}
          {isToday && (
            <span className="inline-flex items-center text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded">
              Oferta de hoy
            </span>
          )}
        </div>

        {/* Botón favorito */}
        <button
          onClick={toggleFavorite}
          disabled={loadingFav}
          className="p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm
            text-muted-foreground hover:text-red-500 transition-colors pointer-events-auto
            opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* ── Imagen ────────────────────────────────────────────────────── */}
      <Link href={detailHref} className="block aspect-square bg-white dark:bg-zinc-900 overflow-hidden relative">
        {!imageError && product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      {/* ── Info del producto ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Marca */}
        {product.brand && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {product.brand}
          </span>
        )}

        {/* Título */}
        <Link href={detailHref} className="block">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug
            hover:text-brand-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Precios */}
        <div className="mt-auto space-y-0.5">
          {/* Precio con tarjeta (si existe) */}
          {product.cardPrice && product.cardPrice < product.currentPrice && (
            <p className="text-xs text-brand-600 font-medium">
              con tarjeta {formatPrice(product.cardPrice)}
            </p>
          )}

          {/* Precio actual */}
          <p className="price-current">
            {formatPrice(product.currentPrice)}
          </p>

          {/* Precio normal tachado */}
          {product.normalPrice && product.normalPrice > product.currentPrice && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Antes:</span>
              <span className="price-normal">{formatPrice(product.normalPrice)}</span>
            </div>
          )}
        </div>

        {/* Footer: tienda + acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-1">
          {/* Logo/nombre de tienda */}
          <Link
            href={`/results?store=${product.store.slug}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            {product.store.logoUrl ? (
              <Image
                src={product.store.logoUrl}
                alt={product.store.displayName}
                width={16}
                height={16}
                className="rounded object-contain"
              />
            ) : (
              <span
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: product.store.logoColor || '#888' }}
              />
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {product.store.displayName}
            </span>
          </Link>

          {/* Acciones: alerta + link externo */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={createAlert}
              className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-brand-600"
              aria-label="Crear alerta de precio"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={e => e.stopPropagation()}
              className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-brand-600"
              aria-label="Ver en tienda"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Badge "Mejor precio" */}
        {product.currentPrice === product.minPrice && product.minPrice !== null && (
          <span className="inline-flex text-xs text-green-700 dark:text-green-400 font-medium">
            ✓ Mejor precio histórico
          </span>
        )}
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2.5">
        <div className="h-3 skeleton w-16 rounded" />
        <div className="h-4 skeleton w-full rounded" />
        <div className="h-4 skeleton w-3/4 rounded" />
        <div className="h-6 skeleton w-24 rounded mt-2" />
        <div className="h-3 skeleton w-16 rounded" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 skeleton w-20 rounded" />
        </div>
      </div>
    </div>
  )
}
