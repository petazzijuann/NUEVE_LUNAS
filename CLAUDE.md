# Nueve Lunas — Ecommerce Mayorista

Tienda mayorista de ropa y accesorios para bebés y futuras mamás.
Stack: Next.js 16 + Prisma + Supabase + Cloudinary + AstroPay + Telegram Bot.

## Comandos esenciales

```bash
pnpm dev                 # Desarrollo local
pnpm build               # Build de producción
pnpm prisma:migrate      # Migrar base de datos
pnpm prisma:studio       # Explorar DB visualmente
pnpm webhook:register    # Registrar webhook de Telegram
```

## Reglas de negocio mayorista

- **Mínimo 3 unidades** por producto/color al agregar al carrito
- **Pedido mínimo $300.000** validado en cliente y servidor
- **Sin cálculo de envío**: el cliente paga el flete al recibir el paquete
- Productos tienen **solo variantes de color** (sin talles)
- Stock se gestiona por color: `color_variants[].stock`

## Rutas principales

| Ruta                    | Descripción                          |
|-------------------------|--------------------------------------|
| `/`                     | Redirige a `/landing`                |
| `/landing`              | Landing page pública                 |
| `/productos`            | Catálogo de productos                |
| `/producto/[slug]`      | Detalle de producto                  |
| `/carrito`              | Carrito de compras                   |
| `/checkout`             | Formulario de pago                   |
| `/pedido/[id]`          | Estado del pedido                    |
| `/contacto`             | Formulario de contacto               |
| `/admin`                | Dashboard admin (requiere auth)      |
| `/login`                | Login admin                          |

## Paleta de colores

- `--nl-pink: #D70A7B` — rosa primario
- `--nl-blue: #4E9CBE` — azul secundario
- `--nl-white: #FFFFFF` — blanco

## Categorías de productos

`almohadones | mantas | reductores | nidos | cambiadores | colchones | sets | toallon`

## Variables de entorno necesarias

Ver `.env.example` para la lista completa.
Las críticas: `DATABASE_URL`, `SUPABASE_*`, `CLOUDINARY_*`, `ASTROPAY_*`, `CBU`, `ALIAS_CBU`, `TITULAR_CUENTA`, `TELEGRAM_*`

## Deploy en Vercel

1. Conectar repo a Vercel
2. Configurar env vars en dashboard de Vercel
3. Correr migración de Prisma: `pnpm prisma:migrate`
4. Registrar webhook Telegram: `pnpm webhook:register`

## Bot de Telegram

- `/nuevo` — Cargar nuevo producto (guiado por pasos)
- `/metricas` — Ver métricas del mes
- `/ayuda` — Lista de comandos
