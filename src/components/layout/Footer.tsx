// src/components/layout/Footer.tsx

import Link from 'next/link'
import { Github, Twitter, Instagram } from 'lucide-react'

const STORE_LINKS = [
  { name: 'Falabella',     href: '/results?store=falabella' },
  { name: 'Paris',         href: '/results?store=paris' },
  { name: 'Ripley',        href: '/results?store=ripley' },
  { name: 'Lider',         href: '/results?store=lider' },
  { name: 'Sodimac',       href: '/results?store=sodimac' },
  { name: 'Mercado Libre', href: '/results?store=mercadolibre' },
  { name: 'Easy',          href: '/results?store=easy' },
  { name: 'ABCDin',        href: '/results?store=abcdin' },
]

const CATEGORY_LINKS = [
  { name: 'Tecnología',  href: '/results?category=tecnologia' },
  { name: 'Celulares',   href: '/results?category=celulares' },
  { name: 'Computación', href: '/results?category=computacion' },
  { name: 'Gaming',      href: '/results?category=gaming' },
  { name: 'Electrohogar',href: '/results?category=electrohogar' },
  { name: 'Moda',        href: '/results?category=moda' },
  { name: 'Deportes',    href: '/results?category=deportes' },
  { name: 'Belleza',     href: '/results?category=belleza' },
]

const HELP_LINKS = [
  { name: '¿Cómo funciona?', href: '/como-funciona' },
  { name: 'Crear alerta',    href: '/alertas' },
  { name: 'Comparador',      href: '/comparador' },
  { name: 'Todas las tiendas', href: '/tiendas' },
]

const LEGAL_LINKS = [
  { name: 'Política de privacidad', href: '/privacidad' },
  { name: 'Términos de uso',        href: '/terminos' },
  { name: 'Política de cookies',    href: '/cookies' },
  { name: 'Contacto',               href: '/contacto' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="site-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Columna 1 — Brand + descripción */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-2xl font-black text-brand-600">Alemss</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Compara precios reales en las principales tiendas de Chile y ahorra en cada compra.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2 — Tiendas */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Tiendas</h3>
            <ul className="space-y-2">
              {STORE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Categorías */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2">
              {CATEGORY_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 — Ayuda + Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 mb-5">
              {HELP_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aviso legal + copyright */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {year} Alemss. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
              Los precios mostrados son informativos y pueden variar. Alemss no es responsable 
              de cambios de precio en las tiendas. Los enlaces a tiendas pueden ser links de afiliados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
