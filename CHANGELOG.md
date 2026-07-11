# Changelog

## Etapa 1 — Esqueleto (completa)

### Bloque 1 — Scaffold + Supabase + repo remoto
Next.js 16 (App Router) + TS + Tailwind v4 + shadcn/ui (Nova) + Recharts + Framer Motion. Paleta e identidad de Rutaru (light/dark, Playfair Display + Inter). Clientes Supabase (`client`/`server`/`admin`) + `proxy.ts`. Repo inicializado y pusheado a GitHub.

### Bloque 2 — Esquema de BD completo + RLS
18 tablas (migraciones `0001`-`0009`), 6 plantillas de RLS reutilizables, triggers (`updated_at`, `get_user_role`, `handle_new_user`). Aplicadas contra Supabase cloud vía Session Pooler (sin Docker) con `scripts/db/migrate.mjs`. Tipos de `database.types.ts` escritos a mano por la misma razón.

### Bloque 3 — Auth de 5 roles + routing por rol
`/login` (credenciales demo visibles) y `/registro`. `requireRole()` protege los 5 dashboards placeholder. `scripts/seed/02_demo_users.mjs` crea los 5 usuarios demo.

### Bloque 4 — Seed de inventario real
8 rutas reales de rutaru.com, 10 traslados, 15 hospedajes, 8 eventos, 3 paquetes de agencia, 2 afiliados. Idempotente.

### Bloque 5 — Marketplace público navegable
Home, categorías con filtros, páginas de detalle (ruta/hotel/evento), perfil público de operador, atribución de afiliado (`/a/[codigo]`). Fix: migración `0010` agrega lectura pública a `operadores` (hueco de RLS del Bloque 2).

### Bloque 6 — Checkout sandbox (Pioneer Pay) + órdenes
Carrito persistido, código de afiliado (5%/10%), pasarela Pioneer sandbox (siempre aprueba), `api/checkout` crea orden + items + pago + comisión, página de confirmación con folio.

### Bloque 7 — Tracking básico
`events_tracking` conectado a los flujos existentes: `page_view`, `search`, `click`, `add_to_cart`, `purchase`, `code_applied`, vía cookie `rutaru_sid` (incluye visitantes anónimos).

### Bloque 8 — Cierre de Etapa 1
README (arquitectura, ER, roadmap, guía de faucets Sepolia), `/roadmap` público, este changelog.

---

## Checklist de criterios de aceptación (sección 9 del spec)

- [x] Repo con estructura de carpetas clara, `.env.example`, migraciones SQL, seeds.
- [ ] Contratos con tests de Hardhat — **Etapa 4** (Plan B blockchain).
- [x] Los 5 logins demo funcionan y cada rol ve solo lo suyo (RLS probado — ver Bloque 3/6).
- [x] Flujo demostrable: cliente busca → aplica código de afiliado 10% → paga en Pioneer sandbox → orden creada → comisión al afiliado → tracking registrado (verificado end-to-end en Bloque 6/7).
- [ ] Insight aparece en dashboard del admin — **Etapa 2** (motor de insights de IA).
- [ ] NFT-ticket en Sepolia con link a Etherscan — **Etapa 4** (Plan B).
- [ ] Data Marketplace con 3 paquetes de datos con gráficas de preview — **Etapa 2/3** (tabla `data_packages` existe, sin poblar aún).
- [x] UI con identidad de rutaru.com, eslogan "pocas rutas, todas buenas.", responsive, diseñada con `ui-ux-pro-max`.
- [x] README con arquitectura, diagrama ER, guía de faucets Sepolia y roadmap por etapas.
