# Rutaru

> pocas rutas, todas buenas.

Marketplace turístico B2B/B2C (rutas, hospedaje, traslados, eventos, paquetes de agencia) con un motor de inteligencia de datos como diferenciador. Ver `PROMPT_MAESTRO_RUTARU.md` para el spec completo del producto.

**Estado:** Etapa 1 (Esqueleto) completa. Roadmap público en `/roadmap`. Ver `CHANGELOG.md` para el detalle de cada bloque.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts + Framer Motion
- **Backend/BD:** Supabase (Postgres + Auth + RLS + Storage + Edge Functions + Realtime)
- **IA:** Anthropic API (Etapa 2 — chatbot concierge, motor de insights; no usada aún)
- **Pagos:** Pioneer Pay (pasarela sandbox/emulada, siempre aprueba en Etapa 1)
- **Blockchain (Plan B):** Ethereum Sepolia — feature flag `NEXT_PUBLIC_BLOCKCHAIN_ENABLED` (Etapa 4, no implementado aún)

## Arquitectura

```
src/
├── app/
│   ├── (marketplace)/       # home, categorías, detalle, carrito, checkout, roadmap
│   ├── (auth)/login|registro/
│   ├── (dashboard)/{operador,agencia,admin,afiliado,cliente}/
│   └── api/{checkout,tracking}/
├── components/{ui,marketplace,layout,dashboard}/
├── lib/
│   ├── supabase/{client,server,admin}.ts   # admin.ts = service role, server-only
│   ├── auth/{roles,guards,actions}.ts
│   ├── cart/actions.ts
│   ├── data/{listings,categorias,cart,orders,detail-href}.ts
│   ├── tracking/track.ts
│   └── pioneer-pay/sandbox.ts
├── proxy.ts                 # refresco de sesión + cookie de tracking (Next 16: reemplaza middleware.ts)
└── config/{site,flags}.ts

supabase/migrations/          # 0001-0010, ver docs/ERD.md
scripts/
├── db/migrate.mjs            # aplica migraciones sin Docker (session pooler)
└── seed/{01_inventory,02_demo_users}.mjs
```

Diagrama ER completo y el patrón de RLS (6 plantillas reutilizables en las 18 tablas): ver [`docs/ERD.md`](docs/ERD.md).

## Los 5 roles

`operador` · `agencia` · `admin` · `afiliado` · `cliente` — cada uno con dashboard propio (placeholders hasta Etapa 2) protegido por `requireRole()` + RLS. Usuarios demo (mismo password para los 5):

| Rol | Email | Password |
|---|---|---|
| Operador | `operador@rutaru.demo` | `demo1234` |
| Agencia | `agencia@rutaru.demo` | `demo1234` |
| Admin | `admin@rutaru.demo` | `demo1234` |
| Afiliado | `afiliado@rutaru.demo` | `demo1234` |
| Cliente | `cliente@rutaru.demo` | `demo1234` |

(También visibles en la pantalla de `/login`.)

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar con las keys del proyecto Supabase
npm run db:migrate           # aplica supabase/migrations/ (incremental, sin Docker)
npm run seed:inventory       # 8 rutas, 10 traslados, 15 hospedajes, 8 eventos, paquetes, afiliados
npm run seed:demo-users      # crea los 5 usuarios demo si no existen
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Notas sobre el entorno sin Docker

Esta máquina no tiene Docker/Podman, así que `supabase link`/`db push`/`gen types` (que corren un contenedor `postgres-meta`) no se pudieron usar:

- Las migraciones se aplican con `scripts/db/migrate.mjs` directo al **Session Pooler** (IPv4) de Supabase, usando `SUPABASE_DB_HOST/PORT/USER/PASSWORD/NAME` de `.env.local`. Es incremental (tabla `_migrations_applied`), seguro correrlo varias veces.
- `src/types/database.types.ts` está escrito a mano reflejando el esquema exacto de las migraciones. Regenerar con `supabase gen types --linked` si en el futuro hay Docker disponible.

## Roadmap por etapas

Ver la página pública [`/roadmap`](http://localhost:3000/roadmap) y el detalle técnico en `CHANGELOG.md`.

1. **Esqueleto** (completa) — auth, esquema BD, seeds, marketplace, checkout sandbox, tracking básico.
2. **Inteligencia** — dashboards, insights IA, chatbot, afiliados.
3. **B2B + Data Marketplace** — portal de agencias, paquetes, venta de datos.
4. **Blockchain (Plan B)** — contratos Sepolia, NFT-tickets, escrow, comisiones on-chain.
5. **Producción** — pasarela real, KYC, multi-idioma/moneda, mainnet, apps móviles.

## Guía de faucets Sepolia (referencia para Etapa 4)

Documentado ahora para no perderlo de vista cuando se implemente la capa blockchain (Plan B); no aplica todavía en Etapa 1.

Para fondear la wallet de deploy en la testnet Sepolia:

- **Google Cloud Web3 Faucet** — https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Alchemy Sepolia Faucet** — https://sepoliafaucet.com
- **Chainlink Faucet** (respaldo) — https://faucets.chain.link

Cuando se implemente Etapa 4, agregar aquí el script `npm run fund:check` que verifica el balance de la wallet de deploy.
