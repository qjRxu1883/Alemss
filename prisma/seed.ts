// prisma/seed.ts - Datos iniciales para Alemss
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Alemss database...')

  // ── TIENDAS ──────────────────────────────────────────────────────────────
  const stores = [
    { slug: 'falabella',    name: 'falabella',    displayName: 'Falabella',     url: 'https://www.falabella.com/falabella-cl', logoColor: '#9B1C1C', priority: 1 },
    { slug: 'paris',        name: 'paris',        displayName: 'Paris',         url: 'https://www.paris.cl',                  logoColor: '#00529B', priority: 2 },
    { slug: 'ripley',       name: 'ripley',       displayName: 'Ripley',        url: 'https://simple.ripley.cl',              logoColor: '#C41230', priority: 3 },
    { slug: 'lider',        name: 'lider',        displayName: 'Lider',         url: 'https://www.lider.cl',                  logoColor: '#0033A0', priority: 4 },
    { slug: 'sodimac',      name: 'sodimac',      displayName: 'Sodimac',       url: 'https://www.sodimac.cl',                logoColor: '#E8431C', priority: 5 },
    { slug: 'mercadolibre', name: 'mercadolibre', displayName: 'Mercado Libre', url: 'https://listado.mercadolibre.cl',       logoColor: '#FFE600', priority: 6 },
    { slug: 'easy',         name: 'easy',         displayName: 'Easy',          url: 'https://www.easy.cl',                   logoColor: '#00923F', priority: 7 },
    { slug: 'abcdin',       name: 'abcdin',       displayName: 'ABCDin',        url: 'https://www.abcdin.cl',                 logoColor: '#E4002B', priority: 8 },
    { slug: 'tricot',       name: 'tricot',       displayName: 'Tricot',        url: 'https://www.tricot.cl',                 logoColor: '#1A1A1A', priority: 9 },
    { slug: 'aliexpress',   name: 'aliexpress',   displayName: 'AliExpress',    url: 'https://es.aliexpress.com',             logoColor: '#FF6A00', priority: 10 },
    { slug: 'amazon',       name: 'amazon',       displayName: 'Amazon',        url: 'https://www.amazon.com',                logoColor: '#FF9900', priority: 11 },
    { slug: 'hites',        name: 'hites',        displayName: 'Hites',         url: 'https://www.hites.com',                 logoColor: '#F04E23', priority: 12 },
  ]

  console.log('  → Seeding stores...')
  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: {},
      create: {
        slug:        store.slug,
        name:        store.name,
        displayName: store.displayName,
        url:         store.url,
        logoUrl:     `/images/stores/${store.slug}.png`,
        logoColor:   store.logoColor,
        priority:    store.priority,
        isActive:    true,
      },
    })
  }
  console.log(`  ✅ ${stores.length} stores seeded`)

  // ── CATEGORÍAS ────────────────────────────────────────────────────────────
  const rootCategories = [
    { slug: 'tecnologia',      displayName: 'Tecnología',        icon: '💻', sortOrder: 1 },
    { slug: 'electrohogar',    displayName: 'Electrohogar',      icon: '🏠', sortOrder: 2 },
    { slug: 'moda',            displayName: 'Moda',              icon: '👗', sortOrder: 3 },
    { slug: 'deportes',        displayName: 'Deportes',          icon: '⚽', sortOrder: 4 },
    { slug: 'hogar-deco',      displayName: 'Hogar y Deco',      icon: '🛋️', sortOrder: 5 },
    { slug: 'belleza',         displayName: 'Belleza',           icon: '💄', sortOrder: 6 },
    { slug: 'juguetes',        displayName: 'Juguetes',          icon: '🧸', sortOrder: 7 },
    { slug: 'automotriz',      displayName: 'Automotriz',        icon: '🚗', sortOrder: 8 },
    { slug: 'construccion',    displayName: 'Construcción',      icon: '🔨', sortOrder: 9 },
    { slug: 'computacion',     displayName: 'Computación',       icon: '🖥️', sortOrder: 10 },
    { slug: 'celulares',       displayName: 'Celulares',         icon: '📱', sortOrder: 11 },
    { slug: 'gaming',          displayName: 'Gaming',            icon: '🎮', sortOrder: 12 },
  ]

  console.log('  → Seeding categories...')
  for (const cat of rootCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug:        cat.slug,
        name:        cat.slug,
        displayName: cat.displayName,
        icon:        cat.icon,
        level:       0,
        sortOrder:   cat.sortOrder,
        isActive:    true,
      },
    })
  }
  console.log(`  ✅ ${rootCategories.length} categories seeded`)

  // ── USUARIO ADMIN ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@Alemss2026!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@alemss.cl' },
    update: {},
    create: {
      name:          'Admin Alemss',
      email:         'admin@alemss.cl',
      password:      adminPassword,
      role:          UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log('  ✅ Admin user seeded (admin@alemss.cl / Admin@Alemss2026!)')

  console.log('\n✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
