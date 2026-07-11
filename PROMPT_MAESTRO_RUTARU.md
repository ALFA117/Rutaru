# 🧭 PROMPT MAESTRO — PROYECTO RUTARU (Hackathon)

> Copia TODO este documento como primer mensaje a Claude Code.
> Primero ejecuta la skill de diseño: `/ui-ux-pro-max:ui-ux-pro-max`

---

## 1. CONTEXTO DEL PROYECTO

Vas a construir **Rutaru**, una **plataforma global de conexión de inventario turístico y agencias** (marketplace de turismo B2B y B2C). El proyecto es para un **hackathon**, pero debe quedar con arquitectura real para venderse después como producto.

Rutaru hace dos cosas:

1. **Marketplace de viajes (B2C):** venta de tours y rutas de autor, experiencias, hospedaje tipo Airbnb (hoteles, cabañas, estancias), traslados/movilidad (aeropuertos AIFA/AICM, shuttles compartidos, privados), boletaje de eventos (conciertos tipo Corona Capital, ferias, festivales gastronómicos y culturales), y paquetes completos armados por agencias.
2. **Conexión B2B de inventario:** los operadores (dueños de hoteles, tours, transportes, eventos) publican su inventario y las **agencias internacionales** lo compran al mayoreo o lo revenden con markup. Todo el flujo B2B y B2C genera **inteligencia de datos**: la IA captura, estructura y almacena el comportamiento de compra en la base de datos para graficarla en dashboards y **vender esa data agregada/anonimizada a otras empresas** (paquetes de datos).

La página de referencia visual es **https://www.rutaru.com/** — sitio real del cliente. De ahí toma:
- **Identidad:** logo Rutaru, eslogan **"pocas rutas, todas buenas."**, tono editorial/premium en los textos (ej. "Polvo y eternidad: La estructura de la inmersión", "Tlatlauquitepec: El México vertical que no admite mapas", "CANTONA: La Metrópoli de Lava", "LA MERCED: El origen del comercio", "Club shared al AIFA").
- **Contenido real para seeds:** rutas de 1 día y 3 días/2 noches, precios entre $450 MXN (traslado AIFA) y $7,800 MXN (expediciones), fechas, formato "📅 duración / 🗓 fecha".
- **Estética:** minimalista, mucho blanco/negro, fotografía protagonista, tipografía fuerte, tarjetas de rutas con imagen 600x450. Paleta: fondo blanco hueso / negro carbón, con un acento cálido terracota-tierra (inspecciona el sitio y ajusta los hex reales; si no puedes, usa `#111111`, `#FAF7F2`, acento `#C2662D`).
- Contacto: hola@rutaru.com, Instagram/Facebook @rutarumx, WhatsApp.

**IMPORTANTE:** El sitio actual es solo la vitrina WordPress. Tú vas a construir la **plataforma completa nueva** (web app), usando esa identidad visual pero con UI muchísimo más avanzada. Usa la skill `/ui-ux-pro-max:ui-ux-pro-max` en TODO el frontend para que se vea espectacular, nivel producto de Silicon Valley: micro-interacciones, dark/light, dashboards con gráficas animadas, mapas, skeletons, glassmorphism sutil donde aplique.

---

## 2. STACK TÉCNICO OBLIGATORIO

- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts (gráficas) + Framer Motion.
- **Backend / BD:** **Supabase** (Postgres + Auth + Row Level Security + Storage + Edge Functions + Realtime). Toda la conexión de base de datos va por Supabase.
- **IA:** endpoint de LLM (Anthropic API) para chatbot concierge, recomendador y motor de inteligencia de datos.
- **Blockchain (Plan B):** Ethereum **testnet Sepolia**, Solidity + Hardhat, ethers.js/wagmi + RainbowKit para conexión de wallet (MetaMask).
- **Pagos:** pasarela **"Pioneer Pay" en modo sandbox/emulado** (checkout propio que simula tarjeta, SPEI y wallet; genera transacciones ficticias en BD). Diseñada como módulo intercambiable para conectar Stripe/Openpay real después.
- **Páginas ilimitadas (unlimited pages):** arquitectura de rutas dinámicas — cada operador, agencia, ruta, hotel, evento y afiliado genera su propia página pública SEO-friendly (`/ruta/[slug]`, `/hotel/[slug]`, `/operador/[slug]`, `/evento/[slug]`, `/a/[codigo-afiliado]`).

---

## 3. LOS 5 ROLES DEL SISTEMA (Auth de Supabase con roles)

Crea login/registro con Supabase Auth y una tabla `profiles` con campo `role`. Cada rol tiene su propio dashboard y permisos vía RLS:

1. **`operador`** — Dueño del negocio (hotel, tour, transporte, evento). Publica y gestiona su inventario, precios B2C y precios B2B (tarifa neta para agencias), disponibilidad/calendario, reservas recibidas, ingresos.
2. **`agencia`** — Agencia Internacional de viajes. Compra inventario B2B al mayoreo, arma **paquetes** (ej. "Tour a Oaxaca todo incluido": traslado + hotel + tours + boletos), les pone markup y los revende B2C. El cliente solo paga y la agencia se encarga de todo.
3. **`admin`** — **Operador Turístico Internacional** (super-admin). Ve TODA la data de TODOS los usuarios: dashboards globales, recolección de datos, gestión de usuarios, aprobación de operadores/agencias, y el **módulo de venta de paquetes de datos** (Data Marketplace) donde arma y "vende" datasets agregados a empresas.
4. **`afiliado`** — Influencers. Cada uno genera **códigos de descuento del 5% y 10%**. Cuando un cliente compra con su código, el cliente recibe el descuento y el afiliado gana **comisión** por haber traído la venta. Dashboard con: clics, conversiones, ventas atribuidas, comisiones acumuladas, link/QR de su página `/a/[codigo]`.
5. **`cliente`** — Cliente final (el "conejillo de indias"). Compra todo: rutas, hoteles, traslados, boletos, paquetes de agencia. **Cada acción suya alimenta el recolector de datos**: búsquedas, vistas, clics, carrito, wishlist, compras, dispositivo, ciudad, rango de gasto.

Crea **5 usuarios demo pre-cargados** (uno por rol) con credenciales visibles en la pantalla de login para el pitch del hackathon, ej: `operador@rutaru.demo / demo1234`, etc.

---

## 4. MÓDULOS FUNCIONALES

### 4.1 Marketplace público
- Home inspirada en rutaru.com (hero, rutas destacadas, traslados, eventos, hospedajes).
- Categorías: **Rutas y Tours · Hospedaje (estilo Airbnb) · Traslados y Movilidad · Eventos y Boletaje · Paquetes de Agencia · Experiencias**.
- Búsqueda con filtros (destino, fecha, precio, duración, categoría), mapa, página de detalle con galería, itinerario día por día, disponibilidad, reseñas, botón reservar.
- Checkout con carrito multi-producto, campo de **código de afiliado** (aplica 5% o 10%), pasarela Pioneer sandbox, confirmación con folio y (Plan B) ticket NFT.

### 4.2 Portal B2B
- Catálogo de inventario con **tarifa neta** solo visible para agencias.
- Compra de bloques/allotments (ej. 20 lugares del tour Cantona).
- Constructor de paquetes de la agencia (drag & drop de componentes + markup %).
- Órdenes B2B, estados (cotizado, confirmado, pagado).

### 4.3 Motor de Inteligencia de Datos (corazón del proyecto)
- **Tabla `events_tracking`**: registra TODO (page_view, search, click, add_to_cart, purchase, code_applied…) con metadata JSONB.
- **Pipeline de IA**: Edge Function que periódicamente lee el tracking y genera **insights** (segmentos de clientes, destinos en tendencia, elasticidad de precio, perfil demográfico, predicción de demanda) guardados en `ai_insights`.
- **Dashboard del admin** con gráficas: ventas por categoría/destino/canal, funnel de conversión, heatmap de demanda por fecha, top afiliados, LTV por segmento.
- **Data Marketplace (venta de datos)**: el admin arma **paquetes de datos** (ej. "Tendencias de viaje CDMX Q3 2026 — $15,000 MXN/mes") con preview de gráficas, dataset anonimizado descargable (CSV/JSON) y flujo de "compra" simulado por empresas. Incluir sección de consentimiento/privacidad (los datos se venden agregados y anonimizados).

### 4.4 Afiliados
- Generación de códigos únicos (5% y 10%), tracking de atribución por link/código, tabla de comisiones, solicitud de pago de comisiones.

### 4.5 IA visible al usuario
- **Chatbot concierge** ("Ruta, tu asistente de viaje"): recomienda rutas según presupuesto/fechas/intereses, arma itinerarios, responde dudas.
- **Recomendador** "Para ti" basado en el tracking del cliente.
- **Pricing inteligente** sugerido al operador (demanda vs. precio).

---

## 5. ESQUEMA DE BASE DE DATOS (Supabase / Postgres)

Crea migraciones SQL con estas tablas (con RLS por rol):

`profiles` (id→auth.users, role, nombre, email, telefono, avatar, empresa, pais, ciudad, verificado)
`operadores` (perfil de negocio: tipo [hotel|tour|transporte|evento], descripcion, logo, slug)
`agencias` (razón social, país, nivel B2B, markup_default)
`afiliados` (user_id, codigo_5, codigo_10, comision_pct, saldo)
`listings` (inventario maestro: operador_id, tipo, titulo, slug, descripcion, itinerario JSONB, precio_b2c, precio_neto_b2b, moneda, duracion, ubicacion, lat/lng, imagenes[], cupo, activo)
`disponibilidad` (listing_id, fecha, cupo_disponible, precio_override)
`paquetes` (agencia_id, titulo, componentes JSONB [listing_ids], precio_total, markup_pct)
`carritos` / `carrito_items`
`ordenes` (user_id, tipo b2b|b2c, subtotal, descuento, codigo_afiliado, total, estado, metodo_pago, tx_hash_blockchain nullable)
`orden_items` (orden_id, listing_id|paquete_id, cantidad, fecha_servicio, precio)
`pagos` (orden_id, pasarela 'pioneer_sandbox', referencia, estado)
`comisiones_afiliado` (afiliado_id, orden_id, monto, estado)
`resenas` (listing_id, user_id, rating, comentario)
`events_tracking` (user_id nullable, session_id, tipo_evento, entidad, metadata JSONB, dispositivo, ciudad, created_at)
`ai_insights` (tipo, titulo, resumen, data JSONB, generado_por 'claude', periodo)
`data_packages` (titulo, descripcion, precio, preview JSONB, dataset_url, comprador_empresa nullable, estado)
`nft_tickets` (Plan B: orden_item_id, contract_address, token_id, tx_hash, wallet)

---

## 6. DATOS SEMILLA (todo ficticio pero realista)

Genera un seed masivo en `seed.sql` / script:
- **Las 8 rutas reales de rutaru.com** como listings (Polvo y eternidad 3d/2n; Tlatlauquitepec 3d/2n; La Merced $1,450; Otomí-Temoaya $7,400; Cornish Real del Monte $7,800; Milpa Alta $7,200; Sincretismo $3,250; Cantona $3,650; traslado Club Shared AIFA $450).
- **+15 hoteles/estancias** estilo Airbnb (CDMX, Oaxaca, Puebla, Hidalgo, Riviera Maya) con precios/noche, amenidades, fotos placeholder (usa Unsplash de paisajes mexicanos).
- **+10 traslados** (AIFA, AICM, Puebla, privado/compartido).
- **+8 eventos** con boletaje (festival tipo Corona Capital "Capital Fest 2026", Feria de San Marcos ficticia, festivales gastronómicos) con zonas y precios por zona.
- **5 usuarios demo** (uno por rol) + **~200 clientes ficticios** con perfiles demográficos variados (edad, ciudad, ingreso estimado, intereses).
- **~1,500 eventos de tracking + ~300 órdenes históricas** distribuidas en 6 meses para que TODAS las gráficas y los insights de IA se vean vivos desde el minuto uno.
- 2 afiliados con ventas atribuidas, 3 paquetes de agencia, 3 paquetes de datos publicados en el Data Marketplace.

---

## 7. LOS DOS PLANES (construye AMBOS, mismo repo, feature flag)

### 🅰️ PLAN A — "Rutaru AI" (versión para la competencia/hackathon)
Todo lo anterior **sin blockchain**. El diferenciador es la IA: chatbot concierge, recomendador, motor de insights, Data Marketplace. Pagos 100% sandbox. Este es el demo pulido para los jueces.

### 🅱️ PLAN B — "Rutaru AI + Blockchain" (versión para vender el producto)
Todo el Plan A **más** capa Web3 sobre **Ethereum Sepolia (testnet)**:
1. **Smart contract `RutaruBooking.sol`** (escrow): el pago del cliente queda en escrow y se libera al operador al completarse el servicio; reembolso automático si se cancela.
2. **Smart contract `RutaruTicket.sol` (ERC-721)**: cada boleto de evento/reserva se acuña como **NFT-ticket** verificable con QR (anti-reventa y anti-falsificación).
3. **`RutaruAffiliate.sol`**: comisiones de afiliados pagadas on-chain automáticamente al confirmarse la venta (split de pagos).
4. **Registro de consentimiento de datos on-chain**: hash del consentimiento del usuario para la venta de su data anonimizada (trazabilidad y confianza para compradores de datos).
5. Conexión de wallet con MetaMask/RainbowKit, red Sepolia, y todos los `tx_hash` guardados en Supabase y linkeados a **sepolia.etherscan.io**.
6. **Faucet de testnet:** documenta en el README cómo fondear: Google Cloud Web3 Faucet (cloud.google.com/application/web3/faucet/ethereum/sepolia), Alchemy Sepolia Faucet (sepoliafaucet.com) y el faucet de Chainlink (faucets.chain.link) como respaldo. Incluye script `npm run fund:check` que verifica balance de la wallet de deploy.

Implementa un **feature flag `NEXT_PUBLIC_BLOCKCHAIN_ENABLED`** para encender/apagar la capa Web3 y demostrar ambos planes con el mismo código.

---

## 8. DESARROLLO POR ETAPAS (el proyecto evoluciona por fases — documéntalo en el README y en una página `/roadmap` pública)

- **Etapa 1 — Esqueleto (hackathon MVP):** setup Next+Supabase, auth 5 roles, esquema BD completo, seeds, marketplace navegable, checkout sandbox, tracking básico.
- **Etapa 2 — Inteligencia:** dashboards por rol, motor de insights con IA, chatbot concierge, recomendador, módulo de afiliados completo.
- **Etapa 3 — B2B + Data Marketplace:** portal de agencias, constructor de paquetes, tarifas netas, venta de paquetes de datos.
- **Etapa 4 — Blockchain (Plan B):** contratos en Sepolia, NFT tickets, escrow, comisiones on-chain, consentimiento de datos.
- **Etapa 5 — Producción (post-hackathon):** pasarela real (Stripe/Openpay), KYC de operadores, multi-idioma/multi-moneda, mainnet, apps móviles.

Al terminar cada etapa deja el sistema funcionando end-to-end (demo-able), commits limpios y un `CHANGELOG.md`.

---

## 9. ENTREGABLES Y CRITERIOS DE ACEPTACIÓN

1. Repo con estructura de carpetas clara, `.env.example`, migraciones SQL de Supabase, seeds, contratos con tests de Hardhat.
2. Los 5 logins demo funcionan y cada rol ve SOLO lo suyo (RLS probado).
3. Flujo completo demostrable: cliente busca → aplica código de influencer 10% → paga en Pioneer sandbox → orden creada → comisión al afiliado → tracking registrado → insight aparece en dashboard del admin → (Plan B) NFT-ticket en Sepolia con link a Etherscan.
4. Data Marketplace con al menos 3 paquetes de datos con gráficas de preview.
5. UI espectacular con `/ui-ux-pro-max:ui-ux-pro-max`, responsive, con la identidad de rutaru.com y el eslogan "pocas rutas, todas buenas."
6. README con arquitectura, diagrama ER, guía de faucets Sepolia, y el roadmap por etapas.

## 10. REGLAS
- Todos los datos de personas, pagos y ventas de datos son **100% ficticios/emulados**.
- Antes de programar, muéstrame: (a) el plan de arquitectura, (b) el diagrama ER, (c) el mapa de pantallas por rol. Espera mi OK y luego construye etapa por etapa.
- Si algo es ambiguo, pregúntame en lugar de asumir.

**Empieza ahora con la Etapa 1.**
