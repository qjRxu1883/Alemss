'use client'
// src/components/layout/Header.tsx

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import {
  Search, Bell, Heart, BarChart2, Sun, Moon, Menu, X,
  ChevronDown, LogOut, User, Settings, Loader2,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────
interface AutocompleteItem {
  label: string
  type: 'query' | 'product'
}

export default function Header() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const [query,         setQuery]         = useState(searchParams?.get('q') || '')
  const [suggestions,   setSuggestions]   = useState<AutocompleteItem[]>([])
  const [showSuggest,   setShowSuggest]   = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)

  const searchRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Autocompletado con debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggest(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions((data.data || []).map((s: string) => ({ label: s, type: 'query' as const })))
        setShowSuggest(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 280)
  }, [query])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setShowSuggest(false)
    router.push(`/results?q=${encodeURIComponent(query.trim())}`)
  }

  function selectSuggestion(label: string) {
    setQuery(label)
    setShowSuggest(false)
    router.push(`/results?q=${encodeURIComponent(label)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="site-container">
        <div className="flex items-center gap-4 h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-brand-600 select-none">
              Alemss
            </span>
          </Link>

          {/* ── Links de navegación (desktop) ───────────────── */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            <Link href="/tiendas"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              Tiendas
            </Link>
            <Link href="/results?knastaday=1"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              Ofertas de hoy
            </Link>
            <Link href="/results?category=tecnologia&knastaday=7"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              Tecnología
            </Link>
          </nav>

          {/* ── Buscador principal (desktop) ─────────────────── */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Busca zapatillas, celulares, televisores..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
                    transition-all placeholder:text-muted-foreground"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
            </form>

            {/* Dropdown sugerencias */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(s.label)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left
                      hover:bg-secondary transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Acciones de la derecha ────────────────────────── */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session ? (
              <>
                {/* Favoritos */}
                <Link href="/favoritos"
                  className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
                  aria-label="Favoritos">
                  <Heart className="w-4 h-4" />
                </Link>

                {/* Alertas */}
                <Link href="/alertas"
                  className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
                  aria-label="Alertas de precio">
                  <Bell className="w-4 h-4" />
                </Link>

                {/* Comparador */}
                <Link href="/comparador"
                  className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground hidden sm:flex"
                  aria-label="Comparador">
                  <BarChart2 className="w-4 h-4" />
                </Link>

                {/* Menú usuario */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 ml-1 px-2.5 py-1.5 rounded-md hover:bg-secondary transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium truncate">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/favoritos" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <Heart className="w-4 h-4" /> Mis favoritos
                        </Link>
                        <Link href="/alertas" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <Bell className="w-4 h-4" /> Mis alertas
                        </Link>
                        <Link href="/comparador" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <BarChart2 className="w-4 h-4" /> Comparador
                        </Link>
                        <Link href="/perfil" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                          <User className="w-4 h-4" /> Mi perfil
                        </Link>
                        {(session.user as { role?: string })?.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                            <Settings className="w-4 h-4" /> Admin
                          </Link>
                        )}
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors">
                          <LogOut className="w-4 h-4" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth/login"
                className="ml-1 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg
                  hover:bg-brand-700 transition-colors">
                Iniciar sesión
              </Link>
            )}

            {/* Hamburger móvil */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors ml-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Buscador móvil ──────────────────────────────────── */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Menú móvil ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="site-container py-3 space-y-1">
            <Link href="/tiendas" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
              Tiendas
            </Link>
            <Link href="/results?knastaday=1" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
              Ofertas de hoy
            </Link>
            {session && (
              <>
                <hr className="border-border" />
                <Link href="/favoritos" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                  <Heart className="w-4 h-4" /> Favoritos
                </Link>
                <Link href="/alertas" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
                  <Bell className="w-4 h-4" /> Alertas
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
