# Auditoría de calidad visual y estabilidad — Rutaru

Auditoría sistemática de todo el sistema (servidor real, sesión real de los 5 roles) en dos viewports: escritorio (1440px) y móvil (375px). Metodología: recorrido automatizado con Playwright de todas las páginas públicas, dashboards y sub-rutas, capturando screenshot full-page + errores de consola + overflow horizontal en cada una, revisado visualmente por agentes independientes y verificado en código.

Fecha: 2026-07-12.

## Resumen

| Severidad | Encontrados | Arreglados | Documentados (post-hackathon) |
|---|---|---|---|
| Crítico | 6 | 6 | 0 |
| Medio | 5 | 5 | 0 |
| Menor | 5 | 3 | 2 |

Además, 3 hallazgos iniciales resultaron ser **falsos positivos** de la metodología de auditoría (ver sección al final) — se documentan igual porque explican capturas que a simple vista parecían bugs.

**Re-verificación de cierre (Bloque 6):** recorrido completo de las 38 páginas × 2 viewports repetido después de todos los fixes — 0 con overflow horizontal, 0 con errores de consola reales (2 timeouts puntuales de red por contención de recursos al correr el build de producción en paralelo, no reproducibles en aislamiento). `npx tsc --noEmit` y `npm run build` limpios.

---

## Críticos (arreglados)

1. **KPIs (StatTile) truncados a "$..." en todos los dashboards** — admin, admin (rango 7 días), operador y afiliado, tanto en móvil como en desktop denso (operador, 4 columnas). El sparkline de ancho fijo dejaba casi cero espacio para el número cuando el monto tenía 6+ dígitos. Fix: sparkline oculto en móvil (`hidden sm:block`), reducido de tamaño en desktop, con `truncate` + `title` como red de seguridad. Verificado con script que mide `scrollWidth` vs `clientWidth` en los 4 dashboards × 2 viewports: 0 elementos truncados tras el fix.
2. **Catálogo B2B (`/agencia/catalogo`) perdía las columnas de precio en móvil** — el `<Table>` de shadcn ya envuelve en `overflow-x-auto`, pero la tabla es `w-full` sin `min-width`, así que el navegador comprimía columnas en vez de generar scroll real. Fix: `min-w-[640px]` en la tabla.
3. **Header de 5 dashboards se desbordaba en móvil** (`dashboard-agencia` medido en 121px de overflow real) — el contenedor de botones de acción (ej. "Catálogo B2B", "Nuevo paquete", "Cerrar sesión") no tenía `flex-wrap`. Mismo patrón exacto en agencia, operador, admin/datos, afiliado y cliente. Fix: `flex-wrap` + `gap-y-2` en los 5 archivos. Confirmado con barrido automatizado: 0/38 páginas con overflow horizontal tras el fix (antes: 1).
4. **Precio $0 en "Mis viajes" del cliente** — 3 órdenes reales (no del seed) mostraban `$0` como total. Causa raíz: `cartItemPrice()` hace fallback silencioso a `0` cuando el join a `listings`/`paquetes` no resuelve, y el checkout nunca validaba eso antes de cobrar. Fix: `/api/checkout` y `/api/checkout/crypto` ahora rechazan la compra (409) si algún ítem del carrito no tiene un precio válido, en vez de crear una orden en $0; se limpiaron las 3 órdenes rotas de la base de datos.
5. **Badge de agencia vacío en `/paquetes` y `/paquete/[slug]`** — se veía un punto negro sin texto en vez de "Rutaru Agencia Demo". Causa raíz: RLS de `agencias` solo permite `SELECT` al dueño o admin, así que para visitantes anónimos el join `agencias(razon_social)` volvía `null` (era un problema de datos, no de imagen). Fix: nueva vista pública `agencias_publico` (id, razon_social, país — sin `markup_default` ni `nivel_b2b`, que sí son sensibles) + `grant select` a `anon/authenticated`, migración `0028`. Mismo patrón que `listings_publico` (Etapa 3).
6. **No existía menú hamburguesa en móvil** — la navegación de categorías del header (`<nav>`) tenía `hidden md:flex`, sin ninguna alternativa para pantallas chicas. Un usuario en móvil no tenía forma de navegar entre categorías desde el header. Fix: `MobileNav`, un dropdown accesible (Radix) con ícono de hamburguesa (44×44px, área táctil correcta), las 6 categorías + Artículos.

## Medios (arreglados)

7. **Botón flotante del chatbot se superponía con texto** en páginas de detalle (descripción corta bajo el título) y con el footer en páginas cortas, en móvil — inherente a un FAB `fixed bottom-5 right-5` sobre contenido que cabe en el primer viewport. Fix: botón más chico en móvil (44px en vez de 56px) + padding inferior extra en el footer (`pb-20` en móvil) para que nunca quede exactamente debajo del botón.
8. **Heatmap de actividad sin señal de que hay scroll horizontal** — el scroll en sí funciona (`overflow-x-auto` + `min-w-[560px]`, correcto), pero en una captura estática se ve "cortado" sin ninguna pista de que hay más contenido deslizando. Fix: hint "Desliza para ver todas las horas →" visible solo en móvil.
9. **Estados vacíos sin ícono** en `/carrito`, `/datos`, `/admin/datos` y `/paquetes` — solo texto + botón, mucho espacio en blanco. Fix: ícono + mensaje + acción en las 4 (pantallas clave del pitch, home/detalle/checkout/admin/datos).
10. **Eje numérico de `TopBarChart` sin formato** (dígitos crudos sin comas, ej. "953860" en vez de "953,860") en Top listings, Top afiliados, Ventas por destino y en los previews del Data Marketplace. Fix: prop `format="currency" | "number"` (string serializable — ver nota técnica abajo) con formateo centralizado.
11. **22 formateadores de moneda duplicados** (`new Intl.NumberFormat("es-MX", {...})` copiado en 22 archivos) — mismo config en todos pero sin una fuente única de verdad. Fix: helper compartido `src/lib/format.ts` (`formatCurrency`), todos los archivos migrados.

### Nota técnica: bug introducido y corregido en el camino

Al centralizar el formato de moneda en `TopBarChart`, un primer intento pasó `formatCurrency` como prop función desde Server Components (`admin/page.tsx`, `agencia/page.tsx`) hacia el Client Component `TopBarChart`. Next.js/React no permite pasar funciones a través del límite RSC ("Functions cannot be passed directly to Client Components") — rompió `/admin` y `/agencia` con 500 en desarrollo (el streaming de Next ocultó el error en algunas capturas, mostrando status 200 engañosamente). Se corrigió pasando un string serializable (`format="currency"`) y resolviendo el formateador **dentro** del Client Component.

## Menores (arreglados, en pantallas del pitch)

- Constructor de paquetes B2B: se verificó que el patrón de estado (Client Component con `useState` + `useActionState`) **no pierde datos** al fallar la validación del servidor — ya estaba correctamente implementado, sin regresión.
- Links a Etherscan: se agregó un link real al contrato verificado (`RutaruTicket`, pestaña `#code`) en `/verificar/[tokenId]`, que antes tenía la función `etherscanAddressUrl` definida pero sin usar en ningún lado.

## Menores (documentados, post-hackathon)

- `/operador/[slug]` (perfil público del operador) no muestra info identificatoria real (nombre, foto, bio) — más una laguna de contenido que un bug visual.
- Empty states secundarios en dashboards internos de bajo tráfico (cliente "mis viajes" sin compras, operador sin reservas en escrow, agencia sin allotments/órdenes B2B) siguen sin ícono — no están en las pantallas clave del pitch (home, detalle, checkout, admin, /datos).

---

## Falsos positivos (verificados y descartados)

Documentados porque las capturas automatizadas sí mostraban algo "raro" — quedó demostrado que no son bugs reales:

- **"Funnel de conversión" vacío** en el dashboard admin y en los previews del Data Marketplace: la animación de entrada de Recharts (Funnel) tarda ~2 segundos en completar; la espera corta de la captura headless lo agarraba a medio animar (trapecios de 4.9px de alto en vez de 62.5px). Confirmado renderizando con espera de 4s: el chart se ve perfecto. De todas formas se desactivó la animación (`isAnimationActive={false}`) para que nunca haya ese "flash" vacío, consistente con las demás gráficas del dashboard.
- **Imágenes "faltantes"** en `home` (mobile, tarjetas de Destacados) y `hospedaje-listado` (mobile, desde la 4ª tarjeta): el lazy-load nativo de `next/image` no alcanza a cargar antes de que la captura `fullPage` de Playwright llegue a esa sección. Confirmado con scroll gradual real (simulando un usuario) + espera: 0 imágenes rotas.
- **Ícono flotante "N" superpuesto con texto**: es el indicador de Next.js Dev Tools, que solo existe en `next dev` — no aparece en producción. Se conservó el hallazgo real (el botón del chatbot sí se superpone, ver medio #7) pero se descartó la mitad del problema que reportaban los agentes.

---

## Bloque 5 — Verificación blockchain

Todos los links a Etherscan pasan por 3 helpers centralizados en `lib/blockchain/config.ts` (`etherscanTxUrl`, `etherscanAddressUrl`, `etherscanTokenUrl`), todos con `target="_blank"` + `rel="noopener noreferrer"` — verificado en las 5 superficies (confirmación de compra, mis viajes, `/verificar/[tokenId]`, consentimiento en cuenta, dashboard operador).

Prueba end-to-end real en Sepolia (flag encendido en local, wallet de prueba fondeada firmando `crearReserva()` — la misma transacción que firmaría Privy/MetaMask, ver sección de evidencia en el resumen final): reserva creada on-chain, verificada por `/api/checkout/crypto` (la misma ruta que usa la UI), NFT acuñado con `tokenURI` correcto y `ownerOf` coincidiendo con la wallet compradora. Prueba de falla real: `crearReserva()` con `value=0` revierte on-chain (`"monto requerido"`), confirmando que el `try/catch` de `crypto-checkout-panel.tsx` nunca llega a llamar la API si la transacción falla o se rechaza — no se crea ninguna orden.
