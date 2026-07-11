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

## Etapa 2 — Inteligencia (completa)

### Bloque 1 — Dashboard de operador
Ventas totales, reservas, ticket promedio, ocupación, ventas por día (Recharts), top listings. Fix de RLS: `orden_items`/`ordenes` no tenían política para el dueño del listing vendido (solo para el comprador) — migración `0011`, y esa misma migración causó recursión infinita de políticas, arreglada en `0012` con funciones `SECURITY DEFINER`. Paleta categórica de gráficas (`--chart-1..5` + status) revalidada con `dataviz/validate_palette.js` (la de Etapa 1 fallaba lightness/chroma).

### Bloque 2 — Paquetes comprables + dashboard de agencia
`carrito_items` ahora soporta paquetes (antes solo listings). Ventas de paquetes, órdenes B2C, top paquetes. RLS de agencia con funciones `SECURITY DEFINER` desde el inicio (sin recursión esta vez).

### Bloque 3 — Dashboard de admin
Funnel de conversión, ventas por categoría/destino, top afiliados. Sin cambios de RLS (admin ya tenía override completo desde Etapa 1).

### Bloque 4 — Dashboard de afiliado
Clics, conversiones, tasa de conversión, ventas atribuidas, comisiones (total/pendientes). Nueva política RLS para que el afiliado vea los clics de su código (visitantes anónimos, sin `user_id` propio) vía función `SECURITY DEFINER`.

### Bloque 5 — Dashboard de cliente + recomendador
Mis viajes (historial real de órdenes). "Para ti": recomendador basado en reglas sobre el tracking del cliente (no usa IA), excluye lo ya visto/comprado.

### Bloque 6 — Motor de insights con IA
`lib/ai/provider.ts`: capa de abstracción (`generateInsight`/`chat`) con **Gemini** (`@google/genai`, modelo `gemini-flash-latest`) como proveedor actual. `AI_MODE=live|mock` con fallback automático a datos mock si Gemini falla. Insights generados a partir de datos reales agregados (ventas por categoría/destino, funnel, top afiliados), guardados en `ai_insights`, visibles en el dashboard de admin. Sin Docker disponible, se implementó como Route Handler (no Supabase Edge Function real).

### Bloque 7 — Chatbot concierge "Ruta"
Widget flotante en toda la app. Recibe el catálogo real de listings/paquetes como contexto y solo recomienda de ahí, con links directos verificados. Rechaza honestamente lo que no está en catálogo en vez de inventar.

### Bloque 8 — Módulo de afiliados completo
Regenerar `codigo_5`/`codigo_10` desde el dashboard, solicitud de pago de comisiones pendientes (`afiliados.pago_solicitado_at`).

---

## Etapa 3 — B2B + Data Marketplace (completa)

### Bloque 1 — Catálogo B2B con tarifa neta + separación real por columna
RLS de Postgres filtra filas, no columnas: `listings.precio_neto_b2b` no se podía ocultar de clientes/afiliados mientras la tabla tuviera una política pública. Fix: migración `0016` retira el acceso público a `listings` y crea la vista `listings_publico` (sin esa columna) para todo consumo público/cliente/afiliado/chatbot/recomendador; la tabla base queda solo para agencia/admin/operador dueño. `/agencia/catalogo` muestra tarifa neta y margen potencial. Verificado explícitamente con sesión real de los 5 roles + anónimo.

### Bloque 2 — Compra de allotments B2B
`/agencia/comprar`: fecha real (de `disponibilidad`) + cantidad de cupos, descuento por volumen (10+: 5%, 20+: 10%), descuenta disponibilidad real, orden tipo `b2b` con estados cotizado→confirmado→pagado (`/agencia/ordenes/[ordenId]`) vía Pioneer sandbox. Única política RLS nueva: agencia puede actualizar disponibilidad de listings ajenos (migración `0017`).

### Bloque 3 — Constructor de paquetes mejorado + `/paquete/[slug]`
Migración `0018` agrega `slug` único a paquetes. `/agencia/paquetes/nuevo`: combina componentes reales cross-categoría (traslado+hotel+tour+evento) desde el catálogo B2B, markup % y precio calculado en vivo. Página pública propia por paquete.

### Bloque 4 — Dashboard de agencia ampliado
Márgenes por paquete, órdenes B2B con estado, allotments comprados vs. vendidos en el mercado (todos los canales). Fix: ese último dato requiere leer órdenes de otros usuarios — se usa el cliente admin solo para el conteo agregado, nunca expone qué cliente compró qué.

### Bloque 5 — Constructor de paquetes de datos (admin)
`/admin/datos/nuevo`: métricas reales (ventas por destino, demografía de compradores por ciudad/país, tendencias por temporada, funnel de conversión) calculadas en vivo, preview con Recharts. `demografia` usa el cliente admin (agregado por conteo, nunca PII individual).

### Bloque 6 — Export CSV/JSON agregado y anonimizado
`api/data-packages/[id]/download` aplana el preview a filas metrica/categoría/valor — nunca nombres, correos ni IDs.

### Bloque 7 — Página pública `/datos` + compra simulada
`scripts/seed/03_data_packages.mjs` crea 3 paquetes reales (el spec de Etapa 1 los había diferido aquí). Migración `0019` agrega lectura pública de `data_packages` (solo publicado/vendido). Compra simulada por empresa ficticia vía cliente admin (acción acotada, no abre UPDATE público).

### Bloque 8 — Resumen ejecutivo con Gemini
Reutiliza `lib/ai/provider.ts` para escribir la descripción comercial de cada paquete de datos a partir de su preview real.

### Bloque 9 — Consentimiento de datos
`profiles.consiente_datos_agregados` (migración `0020`, default `true`), visible y editable en `/registro` (checkbox), `/checkout` (texto informativo) y `/cliente` (toggle).

---

## Checklist de criterios de aceptación (sección 9 del spec)

- [x] Repo con estructura de carpetas clara, `.env.example`, migraciones SQL, seeds.
- [ ] Contratos con tests de Hardhat — **Etapa 4** (Plan B blockchain).
- [x] Los 5 logins demo funcionan y cada rol ve solo lo suyo (RLS probado en las 3 etapas, incluida la tarifa neta B2B en Etapa 3).
- [x] Flujo demostrable: cliente busca → aplica código de afiliado 10% → paga en Pioneer sandbox → orden creada → comisión al afiliado → tracking registrado → insight aparece en dashboard del admin (verificado end-to-end).
- [ ] NFT-ticket en Sepolia con link a Etherscan — **Etapa 4** (Plan B).
- [x] Data Marketplace con 3+ paquetes de datos con gráficas de preview — 4 paquetes reales en `/datos`, con export CSV/JSON y resumen ejecutivo con IA.
- [x] UI con identidad de rutaru.com, eslogan "pocas rutas, todas buenas.", responsive, diseñada con `ui-ux-pro-max`.
- [x] README con arquitectura, diagrama ER, guía de faucets Sepolia y roadmap por etapas.
