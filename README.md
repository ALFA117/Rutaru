# Rutaru

> pocas rutas, todas buenas.

Marketplace turístico B2B/B2C (rutas, hospedaje, traslados, eventos, paquetes de agencia) con un motor de inteligencia de datos como diferenciador. Ver `PROMPT_MAESTRO_RUTARU.md` para el spec completo del producto.

**Estado:** Etapas 1 (Esqueleto), 2 (Inteligencia), 3 (B2B + Data Marketplace) y 4 (Blockchain Plan B) completas. Roadmap público en `/roadmap`. Ver `CHANGELOG.md` para el detalle de cada bloque.

**🚀 Producción (para pruebas del equipo):** https://rutaru.vercel.app — blockchain apagado (`NEXT_PUBLIC_BLOCKCHAIN_ENABLED=false`), la app funciona igual que en local (Plan A). El Plan B (blockchain) solo se demuestra en local con el flag encendido — ver la sección de Web3 más abajo. Entra desde `/login` con el panel de cuentas demo (botón "Entrar como..." por rol) y sigue la [guía de pruebas](https://rutaru.vercel.app/guia-de-pruebas) para el recorrido sugerido por rol.

## Demo del pitch (3 minutos)

1. **Plan A en producción (≈90s):** abre https://rutaru.vercel.app, entra como Cliente con un clic, compra una ruta aplicando el código de afiliado `RUTA10` (10% de descuento) con Pioneer Pay sandbox, muestra la confirmación con folio. Entra como Admin, muestra el dashboard de insights con IA y `/datos` (Data Marketplace).
2. **Plan B en local (≈90s):** con `NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true` y `npm run dev`, conecta MetaMask (Sepolia) con el botón del navbar, compra con "Pagar con cripto (testnet)", muestra el NFT-ticket recién acuñado en `/verificar/[tokenId]` y su link a Etherscan, luego el dashboard de operador liberando el escrow ("Marcar completado") con la transacción real en Etherscan.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts + Framer Motion
- **Backend/BD:** Supabase (Postgres + Auth + RLS + Storage + Edge Functions + Realtime)
- **IA:** Google Gemini (`@google/genai`, modelo `gemini-flash-latest`) vía `lib/ai/provider.ts` — capa de abstracción intercambiable a otro proveedor. `AI_MODE=live|mock` con fallback automático a datos mock si Gemini falla.
- **Pagos:** Pioneer Pay (pasarela sandbox/emulada, siempre aprueba en Etapa 1)
- **Blockchain (Plan B):** Ethereum Sepolia — 3 contratos (`RutaruTicket` NFT, `RutaruBooking` escrow, `RutaruAffiliate` comisiones) vía `ethers.js` + Hardhat 3, frontend con `wagmi`/RainbowKit. Feature flag `NEXT_PUBLIC_BLOCKCHAIN_ENABLED` (`false` en producción — Plan A intacto)

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
│   ├── blockchain/
│   │   ├── config.ts                       # montos ETH simbolicos, helpers de Etherscan
│   │   ├── provider.ts                     # ethers.js server-only (mint, escrow, comision, consentimiento)
│   │   ├── wagmi-config.ts                 # config cliente wagmi/RainbowKit (perezosa)
│   │   ├── dashboard-actions.ts            # completar/cancelar reserva, wallet de operador/afiliado
│   │   └── deployments/sepolia.json        # address+ABI de los 3 contratos desplegados
│   ├── data/{listings,categorias,cart,orders,detail-href,
│   │         dashboard-operador,dashboard-operador-blockchain,dashboard-agencia,dashboard-admin,
│   │         dashboard-afiliado,dashboard-cliente,recommendations,
│   │         insights,chatbot-catalogo,catalogo-b2b,b2b-orders,
│   │         data-packages,data-packages-metrics,data-packages-export}.ts
│   ├── tracking/track.ts
│   └── pioneer-pay/sandbox.ts
├── proxy.ts                 # refresco de sesión + cookie de tracking (Next 16: reemplaza middleware.ts)
└── config/{site,flags}.ts

supabase/migrations/          # 0001-0023, ver docs/ERD.md
scripts/
├── db/migrate.mjs            # aplica migraciones sin Docker (session pooler)
├── blockchain/fund-check.mjs # verifica balance de la wallet de deploy
└── seed/{01_inventory,02_demo_users,03_data_packages}.mjs

contracts/                    # sub-proyecto Hardhat 3 independiente (propio package.json)
├── contracts/{RutaruTicket,RutaruBooking,RutaruAffiliate}.sol
├── test/{RutaruTicket,RutaruBooking,RutaruAffiliate}.test.ts   # 19 tests
├── scripts/deploy.ts
└── hardhat.config.ts
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

(También visibles en la pantalla de `/login`, con botón "Entrar como..." de un clic para cada uno. Recorrido de pruebas sugerido por rol en [`/guia-de-pruebas`](https://rutaru.vercel.app/guia-de-pruebas).)

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
4. **Blockchain (Plan B)** (completa) — 3 contratos en Sepolia real (NFT-ticket, escrow, comisiones), conexión de wallet, checkout con cripto, consentimiento anclado on-chain — todo detrás de un feature flag apagado por defecto.
5. **Producción** — pasarela real, KYC, multi-idioma/moneda, mainnet, apps móviles.

## Blockchain (Plan B) — setup Web3

Todo detrás de `NEXT_PUBLIC_BLOCKCHAIN_ENABLED` (`false` por defecto — Plan A intacto para jueces/equipo). Para probar el Plan B en local:

### 1. Fondear una wallet de desarrollo con ETH de Sepolia

- **Google Cloud Web3 Faucet** — https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Alchemy Sepolia Faucet** — https://sepoliafaucet.com
- **Chainlink Faucet** (respaldo) — https://faucets.chain.link

### 2. Variables de entorno (`.env.local`, nunca commitear)

```bash
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true
DEPLOYER_PRIVATE_KEY=          # llave privada de la wallet fondeada
SEPOLIA_RPC_URL=                # Alchemy (alchemy.com, free tier) recomendado
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # gratis en cloud.reown.com, requerido por RainbowKit
```

`npm run fund:check` verifica el balance de la wallet de deploy sin exponer la llave.

### 3. Contratos ya desplegados en Sepolia real

| Contrato | Dirección | Etherscan |
|---|---|---|
| `RutaruTicket` (NFT-ticket) | `0x2eE1d7432DE8E722F5b7597F907aC53b45Ab4aFD` | [ver ↗](https://sepolia.etherscan.io/address/0x2eE1d7432DE8E722F5b7597F907aC53b45Ab4aFD) |
| `RutaruBooking` (escrow) | `0x81B600E7ACE4CEe5D698C39368B615A732d0E9f8` | [ver ↗](https://sepolia.etherscan.io/address/0x81B600E7ACE4CEe5D698C39368B615A732d0E9f8) |
| `RutaruAffiliate` (comisiones) | `0x7A237323C37B1bdf32Af7d759078c98866479a0c` | [ver ↗](https://sepolia.etherscan.io/address/0x7A237323C37B1bdf32Af7d759078c98866479a0c) |

Address+ABI en `src/lib/blockchain/deployments/sepolia.json`. Para re-desplegar: `cd contracts && npx hardhat run scripts/deploy.ts --network sepolia`.

### 4. Probar el flujo completo

Con el flag activo y `npm run dev`: conectar MetaMask (red Sepolia) desde el botón del navbar → comprar en `/checkout` con "Pagar con cripto (testnet)" (montos simbólicos de ETH de prueba, no hay conversión real de MXN) → el NFT-ticket se acuña a tu wallet, verificable en `/verificar/[tokenId]` con QR → desde `/operador`, "Marcar completado" libera el escrow al operador (o "Cancelar y reembolsar" devuelve el pago al cliente) → si se usó un código de afiliado, la comisión se paga on-chain automáticamente.

Tests de los 3 contratos: `cd contracts && npx hardhat test` (19 tests).
