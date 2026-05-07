// src/app/layout.tsx - Root layout de Alemss

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import SessionProvider from '@/components/auth/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import '@/styles/globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://alemss.cl'),
  title: {
    default:  'Alemss - Compara Precios y Encuentra Ofertas en Chile',
    template: '%s | Alemss',
  },
  description:
    'Compara precios en las principales tiendas de Chile. Historial de precios real, alertas de descuento y ofertas de Falabella, Paris, Ripley, Lider, Sodimac y más.',
  keywords: [
    'comparar precios chile',
    'ofertas chile',
    'descuentos chile',
    'historial precios',
    'falabella ofertas',
    'paris ofertas',
    'ripley descuentos',
  ],
  openGraph: {
    type:        'website',
    locale:      'es_CL',
    siteName:    'Alemss',
    title:       'Alemss - Comparador de Precios Chile',
    description: 'Compara precios en las principales tiendas de Chile con historial real.',
    images:     [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Alemss - Comparador de Precios Chile',
    description: 'Compara precios reales en las principales tiendas de Chile.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon:      '/favicon.ico',
    shortcut:  '/favicon-16x16.png',
    apple:     '/apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast:   'bg-card border border-border text-foreground shadow-lg',
                  success: 'border-green-500/30',
                  error:   'border-red-500/30',
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
