// src/app/page.tsx — Página de inicio de Alemss (Server Component)

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/products/ProductCard'
import {
  getDayOffers,
  getPopularProducts,
  getPriceDrops,
  getProductsByCategory,
} from '@/lib/db/products'
import { prisma } from '@/lib/db/client'
import { cache, cacheKeys } from '@/lib/cache/redis'
import { ArrowRight, Flame, TrendingDown, Star, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Alemss - Compara Precios y Encuentra Ofertas Reales en Chile',
  description:
    'Compara precios en Falabella, Paris, Ripley, Lider, Sodimac y más. Historial de precios real y alertas de descuento.',
}

// Revalidar cada 5 minutos
export const revalidate = 300

// ─────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────
async function getStores() {
  return cache.getOrSet(
    cacheKeys.stores(),
    () => prisma.store.findMany({
      where:   { isActive: true },
      orderBy: { priority: 'asc' },
      select:  { id: true, slug: true, displayName: true, logoUrl: true, logoColor: true, url: true, name: true },
    }),
    cache.TTL.STORES
  )
}

// ─────────────────────────────────────────────
// Componente HeroBanner
// ─────────────────────────────────────────────
function HeroBanner() {
  return (
    <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
      <div className="site-container py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">
            Compara Precios y Encuentra{' '}
            <span className="text-yellow-300">Ofertas Reales</span>{' '}
            en Chile
          </h1>
          <p className="text-brand-100 text-base md:text-lg mb-8 leading-relaxed">
            Historial de precios real en Falabella, Paris, Ripley, Lider, Sodimac, 
            Mercado Libre y muchas más tiendas chilenas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/results?knastaday=1"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-700 
                font-semibold rounded-lg hover:bg-brand-50 transition-colors text-sm"
            >
              <Flame className="w-4 h-4" />
              Ofertas de hoy
            </Link>
            <Link
              href="/results?sort=discount_desc"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500/40 text-white
                font-semibold rounded-lg hover:bg-brand-500/60 transition-colors text-sm border border-white/20"
            >
              <TrendingDown className="w-4 h-4" />
              Mayores descuentos
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Componente FeaturedCategories
// ─────────────────────────────────────────────
function FeaturedCategories() {
  const categories = [
    { slug: 'tecnologia',   label: 'Tecnología',   icon: '💻', color: 'bg-blue-50   dark:bg-blue-900/20',   link: '/results?category=tecnologia&knastaday=7' },
    { slug: 'celulares',    label: 'Celulares',    icon: '📱', color: 'bg-purple-50 dark:bg-purple-900/20', link: '/results?category=celulares&knastaday=7' },
    { slug: 'gaming',       label: 'Gaming',       icon: '🎮', color: 'bg-green-50  dark:bg-green-900/20',  link: '/results?category=gaming&knastaday=7' },
    { slug: 'electrohogar', label: 'Electrohogar', icon: '🏠', color: 'bg-orange-50 dark:bg-orange-900/20', link: '/results?category=electrohogar&knastaday=7' },
    { slug: 'moda',         label: 'Moda',         icon: '👗', color: 'bg-pink-50   dark:bg-pink-900/20',   link: '/results?category=moda&knastaday=7' },
    { slug: 'deportes',     label: 'Deportes',     icon: '⚽', color: 'bg-yellow-50 dark:bg-yellow-900/20', link: '/results?category=deportes&knastaday=7' },
    { slug: 'belleza',      label: 'Belleza',      icon: '💄', color: 'bg-rose-50   dark:bg-rose-900/20',   link: '/results?category=belleza&knastaday=7' },
    { slug: 'computacion',  label: 'Computación',  icon: '🖥️', color: 'bg-indigo-50 dark:bg-indigo-900/20', link: '/results?category=computacion&knastaday=7' },
  ]

  return (
    <section className="home-section">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={cat.link}
            className={`flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl 
              ${cat.color} hover:opacity-80 transition-all duration-200 
              border border-transparent hover:border-border group`}
          >
            <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200">
              {cat.icon}
            </span>
            <span className="text-xs font-medium text-center leading-tight text-foreground">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Componente ProductGrid Section
// ─────────────────────────────────────────────
interface SectionProps {
  title:     string
  subtitle?: string
  href:      string
  icon:      React.ReactNode
  products:  Awaited<ReturnType<typeof getDayOffers>>
  isToday?:  boolean
}

function ProductSection({ title, subtitle, href, icon, products, isToday }: SectionProps) {
  if (!products.length) return null

  return (
    <section className="home-section">
      <div className="section-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <Link href={href} className="section-link flex items-center gap-1">
          Ver todo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            isToday={isToday}
            position={i}
          />
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Componente StoreChips
// ─────────────────────────────────────────────
interface StoreChip {
  id: string; slug: string; displayName: string
  logoUrl: string | null; logoColor: string | null
  url: string; name: string
}

function StoreChips({ stores }: { stores: StoreChip[] }) {
  return (
    <section className="home-section">
      <h2 className="section-title mb-4">Tiendas disponibles</h2>
      <div className="flex flex-wrap gap-2">
        {stores.map(store => (
          <Link
            key={store.id}
            href={`/results?store=${store.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border 
              rounded-full text-sm font-medium hover:border-brand-500 hover:text-brand-600 
              transition-all duration-200 hover:shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: store.logoColor || '#888' }}
            />
            {store.displayName}
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Banners de categorías especiales (como knasta)
// ─────────────────────────────────────────────
function CategoryBanners() {
  const banners = [
    {
      title:    'Ofertas de hoy',
      subtitle: 'Aquí encontrarás las bajadas de precio de las últimas horas',
      href:     '/results?knastaday=1',
      gradient: 'from-red-500 to-orange-500',
      emoji:    '🔥',
      cta:      'Ver ofertas de hoy',
    },
    {
      title:    'Ofertas Tecno',
      subtitle: 'Las mejores ofertas en tecnología de la semana',
      href:     '/results?category=tecnologia&knastaday=7',
      gradient: 'from-blue-500 to-indigo-600',
      emoji:    '📲',
      cta:      'Ver ofertas Tecno',
    },
    {
      title:    'Ofertas Moda',
      subtitle: 'Ofertas de ropa y calzado de la semana',
      href:     '/results?category=moda&knastaday=7',
      gradient: 'from-pink-500 to-purple-600',
      emoji:    '👗',
      cta:      'Ver ofertas Moda',
    },
  ]

  return (
    <section className="home-section grid grid-cols-1 sm:grid-cols-3 gap-4">
      {banners.map(b => (
        <Link
          key={b.href}
          href={b.href}
          className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${b.gradient} 
            text-white group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
        >
          <div className="text-3xl mb-2">{b.emoji}</div>
          <h3 className="text-base font-bold mb-1">{b.title}</h3>
          <p className="text-xs text-white/80 mb-3">{b.subtitle}</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold
            bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
            {b.cta} <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      ))}
    </section>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default async function HomePage() {
  const [dayOffers, popular, priceDrops, techProducts, fashionProducts, stores] =
    await Promise.all([
      getDayOffers(12),
      getPopularProducts(12),
      getPriceDrops(12),
      getProductsByCategory('tecnologia', 6),
      getProductsByCategory('moda', 6),
      getStores(),
    ])

  return (
    <>
      <Header />

      <main>
        <HeroBanner />

        <div className="site-container py-8">
          {/* Categorías */}
          <FeaturedCategories />

          {/* Banners especiales */}
          <CategoryBanners />

          {/* Tiendas */}
          <StoreChips stores={stores} />

          {/* Ofertas del día */}
          <ProductSection
            title="Mejores Ofertas de hoy"
            subtitle="Las mayores bajadas de precio de las últimas horas"
            href="/results?knastaday=1"
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            products={dayOffers}
            isToday
          />

          {/* Bajadas de precio */}
          <ProductSection
            title="Bajadas de Precio"
            subtitle="Productos que bajaron de precio recientemente"
            href="/results?sort=discount_desc&knastaday=3"
            icon={<TrendingDown className="w-5 h-5 text-brand-500" />}
            products={priceDrops}
          />

          {/* Más populares */}
          <ProductSection
            title="Más Populares"
            subtitle="Los productos más vistos por nuestra comunidad"
            href="/results?sort=popular"
            icon={<Star className="w-5 h-5 text-yellow-500" />}
            products={popular}
          />

          {/* Tecnología */}
          {techProducts.length > 0 && (
            <ProductSection
              title="Ofertas Tecno"
              subtitle="Las mejores ofertas en tecnología de la semana"
              href="/results?category=tecnologia&knastaday=7"
              icon={<span className="text-lg">📲</span>}
              products={techProducts}
            />
          )}

          {/* Moda */}
          {fashionProducts.length > 0 && (
            <ProductSection
              title="Ofertas Moda"
              subtitle="Ropa y calzado con descuento esta semana"
              href="/results?category=moda&knastaday=7"
              icon={<span className="text-lg">👗</span>}
              products={fashionProducts}
            />
          )}

          {/* CTA final */}
          <section className="text-center py-10 bg-secondary/50 rounded-2xl">
            <Zap className="w-10 h-10 text-brand-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
            <p className="text-muted-foreground mb-5 text-sm max-w-md mx-auto">
              Usa nuestro buscador avanzado o crea una alerta y te avisamos cuando el precio baje.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/results"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                Buscar productos
              </Link>
              <Link href="/alertas"
                className="px-5 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                Crear alerta de precio
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
