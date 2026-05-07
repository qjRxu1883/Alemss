// src/lib/utils/format.ts
// Utilidades de formato para Alemss (CLP, fechas, slugs)

/**
 * Formatea un número como precio en pesos chilenos (CLP)
 * Ej: 14990 → "$ 14.990"
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return '$ ' + amount.toLocaleString('es-CL')
}

/**
 * Formatea el porcentaje de descuento
 * Ej: 14 → "-14%"
 */
export function formatDiscount(pct: number | null | undefined): string {
  if (!pct) return ''
  return `-${pct}%`
}

/**
 * Formatea una fecha a string legible en español
 * Ej: "hace 2 horas", "hace 3 días"
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = Date.now()
  const diff = now - d.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 1)  return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24)   return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
  if (days < 7)     return `hace ${days} día${days !== 1 ? 's' : ''}`
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

/**
 * Formatea fecha completa para historial de precios
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CL', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

/**
 * Genera slug URL-amigable desde un string
 * Ej: "iPhone 15 Pro Max (256GB)" → "iphone-15-pro-max-256gb"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remover acentos
    .replace(/[^a-z0-9\s-]/g, '')    // solo alfanumérico
    .trim()
    .replace(/\s+/g, '-')            // espacios → guiones
    .replace(/-+/g, '-')             // guiones múltiples → uno
    .slice(0, 80)                     // máx 80 chars
}

/**
 * Calcula el porcentaje de descuento entre precio normal y actual
 */
export function calcDiscount(currentPrice: number, normalPrice: number): number {
  if (!normalPrice || normalPrice <= currentPrice) return 0
  return Math.round(((normalPrice - currentPrice) / normalPrice) * 100)
}

/**
 * Trunca un texto a N caracteres con ellipsis
 */
export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

/**
 * Formatea número grande con sufijo K/M
 * Ej: 1500 → "1.5K"
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

/**
 * Construye query string desde un objeto de filtros
 */
export function buildQueryString(params: Record<string, string | string[] | number | boolean | undefined | null>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach(v => qs.append(key, String(v)))
    } else {
      qs.set(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}
