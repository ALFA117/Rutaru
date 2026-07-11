# Rutaru

> pocas rutas, todas buenas.

Marketplace turístico B2B/B2C (rutas, hospedaje, traslados, eventos, paquetes de agencia) con un motor de inteligencia de datos como diferenciador. Ver `PROMPT_MAESTRO_RUTARU.md` para el spec completo del producto.

**Estado:** Etapas 1 (Esqueleto), 2 (Inteligencia) y 3 (B2B + Data Marketplace) completas. Roadmap público en `/roadmap`. Ver `CHANGELOG.md` para el detalle de cada bloque.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts + Framer Motion
- **Backend/BD:** Supabase (Postgres + Auth + RLS + Storage + Edge Functions + Realtime)
- **IA:** Google Gemini (`@google/genai`, modelo `gemini-flash-latest`) vía `lib/ai/provider.ts` — capa de abstracción intercambiable a otro proveedor. `AI_MODE=live|mock` con fallback automático a datos mock si Gemini falla.
- **Pagos:** Pioneer Pay (pasarela sandbox/emulada, siempre aprueba en Etapa 1)
- **Blockchain (Plan B):** Ethereum Sepolia — feature flag `NEXT_PUBLIC_BLOCKCHAIN_ENABLED` (Etapa 4, no implementado aún)

## Arquitectura

```
src/
├── app/
│   ├── (marketplace)/       # home, categorías, detalle, carrito, checkout, roadmap,
│   │                        # paquete/[slug], datos (Data Marketplace público)
│   ├── (auth)/login|registro/
│   ├── (dashboard)/{operador,agencia,admin,afiliado,cliente}/    # dashboards reales
│   │   ├── agencia/{catalogo,comprar,ordenes/[ordenId],paquetes/nuevo}/
│   │   └── admin/datos/{,/nuevo}
│   └── api/{checkout,tracking,chat,insights/generate,data-packages/[id]/download}/
├── components/{ui,marketplace,layout,dashboard,chatbot,b2b,data-marketplace}/
├── lib/
│   ├── supabase/{client,server,admin}.ts   # admin.ts = service role, server-only
│   ├── auth/{roles,guards,actions}.ts
│   ├── afiliado/actions.ts                 # regenerar codigo, solicitar pago
│   ├── perfil/actions.ts                   # consentimiento de datos agregados
│   ├── cart/actions.ts
│   ├── b2b/{allotments,actions,paquetes,actions-paquetes}.ts
│   ├── data-marketplace/{actions,compra-actions,resumen-actions}.ts
│   ├── ai/provider.ts                      # abstraccion IA (Gemini + mock)
│   ├── data/{listings,categorias,cart,orders,detail-href,
│   │         dashboard-operador,dashboard-agencia,dashboard-admin,
│   │         dashboard-afiliado,dashboard-cliente,recommendations,
│   │         insights,chatbot-catalogo,catalogo-b2b,b2b-orders,
│   │         data-packages,data-packages-metrics,data-packages-export}.ts
│   ├── tracking/track.ts
│   └── pioneer-pay/sandbox.ts
├── proxy.ts                 # refresco de sesión + cookie de tracking (Next 16: reemplaza middleware.ts)
└── config/{site,flags}.ts

supabase/migrations/          # 0001-0020, ver docs/ERD.md
scripts/
├── db/migrate.mjs            # aplica migraciones sin Docker (session pooler)
└── seed/{01_inventory,02_demo_users,03_data_packages}.mjs
```

Diagrama ER completo y el patrón de RLS en [`docs/ERD.md`](docs/ERD.md). Nota importante de Etapa 3: `listings.precio_neto_b2b` (tarifa neta B2B) **no** es visible vía RLS de fila — se oculta usando la vista `listings_publico` (sin esa columna) para todo consumo público/cliente/afiliado, ya que RLS de Postgres filtra filas, no columnas.

## Los 5 roles

`operador` · `agencia` · `admin` · `afiliado` · `cliente` — cada uno con dashboard real (Recharts, datos en vivo) protegido por `requireRole()` + RLS. Usuarios demo (mismo password para los 5):

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
npm run seed:data-packages   # 3 paquetes de datos reales para /datos
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
2. **Inteligencia** (completa) — dashboards por rol, insights con Gemini, chatbot concierge, recomendador, módulo de afiliados.
3. **B2B + Data Marketplace** (completa) — catálogo con tarifa neta, allotments, paquetes cross-categoría, Data Marketplace (4 paquetes reales, export CSV/JSON, resumen con IA), consentimiento de datos.
4. **Blockchain (Plan B)** — contratos Sepolia, NFT-tickets, escrow, comisiones on-chain.
5. **Producción** — pasarela real, KYC, multi-idioma/moneda, mainnet, apps móviles.

## Guía de faucets Sepolia (referencia para Etapa 4)

Documentado ahora para no perderlo de vista cuando se implemente la capa blockchain (Plan B); no aplica todavía en Etapa 1.

Para fondear la wallet de deploy en la testnet Sepolia:

- **Google Cloud Web3 Faucet** — https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Alchemy Sepolia Faucet** — https://sepoliafaucet.com
- **Chainlink Faucet** (respaldo) — https://faucets.chain.link

Cuando se implemente Etapa 4, agregar aquí el script `npm run fund:check` que verifica el balance de la wallet de deploy.
