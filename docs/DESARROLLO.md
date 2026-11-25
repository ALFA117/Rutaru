# Rutaru: guía de desarrollo

Detalle técnico movido del README. El proyecto está **descontinuado**; esta guía queda como referencia.

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
│   │   ├── wagmi-config.ts                 # config cliente wagmi + Privy (perezosa)
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

Diagrama ER completo y el patrón de RLS en [`ERD.md`](ERD.md). Nota importante de Etapa 3: `listings.precio_neto_b2b` (tarifa neta B2B) **no** es visible vía RLS de fila — se oculta usando la vista `listings_publico` (sin esa columna) para todo consumo público/cliente/afiliado, ya que RLS de Postgres filtra filas, no columnas.

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
ETHERSCAN_API_KEY=              # etherscan.io -> My Profile -> API Keys, para verify de codigo fuente
NEXT_PUBLIC_PRIVY_APP_ID=       # dashboard.privy.io -> app -> App ID
PRIVY_APP_SECRET=               # dashboard.privy.io -> app -> App Secret (nunca exponer client-side)
```

`npm run fund:check` verifica el balance de la wallet de deploy sin exponer la llave. Conexión de wallet vía **Privy** (`@privy-io/react-auth` + `@privy-io/wagmi`) — soporta MetaMask (wallet externa) y login embebido por email/Google, útil para que alguien sin wallet propia pruebe el flujo Web3. Configurado para Sepolia únicamente (`defaultChain`/`supportedChains`).

### 3. Contratos ya desplegados y verificados en Sepolia real

| Contrato | Dirección | Etherscan (código fuente verificado ✅) |
|---|---|---|
| `RutaruTicket` (NFT-ticket) | `0x2eE1d7432DE8E722F5b7597F907aC53b45Ab4aFD` | [ver código ↗](https://sepolia.etherscan.io/address/0x2eE1d7432DE8E722F5b7597F907aC53b45Ab4aFD#code) |
| `RutaruBooking` (escrow) | `0x81B600E7ACE4CEe5D698C39368B615A732d0E9f8` | [ver código ↗](https://sepolia.etherscan.io/address/0x81B600E7ACE4CEe5D698C39368B615A732d0E9f8#code) |
| `RutaruAffiliate` (comisiones) | `0x7A237323C37B1bdf32Af7d759078c98866479a0c` | [ver código ↗](https://sepolia.etherscan.io/address/0x7A237323C37B1bdf32Af7d759078c98866479a0c#code) |

Address+ABI en `src/lib/blockchain/deployments/sepolia.json`. Para re-desplegar: `cd contracts && npx hardhat run scripts/deploy.ts --network sepolia`. Para re-verificar: `cd contracts && npx hardhat verify --network sepolia <address> <constructor-arg>` (requiere `ETHERSCAN_API_KEY`).

### 4. Probar el flujo completo

Con el flag activo y `npm run dev`: conectar wallet (MetaMask o login embebido con email/Google vía Privy) desde el botón del navbar → comprar en `/checkout` con "Pagar con cripto (testnet)" (montos simbólicos de ETH de prueba, no hay conversión real de MXN) → el NFT-ticket se acuña a tu wallet, verificable en `/verificar/[tokenId]` con QR → desde `/operador`, "Marcar completado" libera el escrow al operador (o "Cancelar y reembolsar" devuelve el pago al cliente) → si se usó un código de afiliado, la comisión se paga on-chain automáticamente.

Tests de los 3 contratos: `cd contracts && npx hardhat test` (19 tests).
