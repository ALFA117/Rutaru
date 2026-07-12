import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { IMAGENES_POR_SLUG } from "./imagenes-reales.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_PASSWORD = "demo1234";

// Unsplash Source (source.unsplash.com) esta descontinuado (503) al momento de
// escribir esto. Se usa Picsum como placeholder estable, con seed determinista
// por slug para que cada listing tenga imagenes consistentes entre corridas.
function img(seed, n = 1) {
  return Array.from(
    { length: n },
    (_, i) => `https://picsum.photos/seed/${seed}-${i + 1}/800/600`
  );
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Ventana de disponibilidad "viva": las fechas reales publicadas en rutaru.com
// (marzo 2026) ya quedaron en el pasado respecto a hoy; se generan fechas
// futuras en su lugar para que el checkout (Bloque 6) tenga disponibilidad real.
const TODAY = new Date();
function rollingDates(count, stepDays) {
  return Array.from({ length: count }, (_, i) =>
    addDays(TODAY, 7 + i * stepDays)
  );
}

async function ensureUser(email, role, nombre) {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { role, nombre },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function ensureOperador({ userId, tipo, descripcion, logo, slug }) {
  const { data: existing } = await admin
    .from("operadores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("operadores")
    .insert({ user_id: userId, tipo, descripcion, logo, slug })
    .select("id")
    .single();
  if (error) throw new Error(`operador ${slug}: ${error.message}`);
  return data.id;
}

async function ensureAgencia({ userId, razonSocial, pais, nivelB2b, markup }) {
  const { data: existing } = await admin
    .from("agencias")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("agencias")
    .insert({
      user_id: userId,
      razon_social: razonSocial,
      pais,
      nivel_b2b: nivelB2b,
      markup_default: markup,
    })
    .select("id")
    .single();
  if (error) throw new Error(`agencia ${razonSocial}: ${error.message}`);
  return data.id;
}

async function ensureAfiliado({ userId, codigo5, codigo10 }) {
  const { data: existing } = await admin
    .from("afiliados")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("afiliados")
    .insert({
      user_id: userId,
      codigo_5: codigo5,
      codigo_10: codigo10,
      comision_pct: 10,
      saldo: 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(`afiliado ${codigo5}: ${error.message}`);
  return data.id;
}

async function ensureListing(operadorId, listing) {
  const { data: existing } = await admin
    .from("listings")
    .select("id")
    .eq("slug", listing.slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("listings")
    .insert({
      operador_id: operadorId,
      tipo: listing.tipo,
      titulo: listing.titulo,
      slug: listing.slug,
      descripcion: listing.descripcion,
      itinerario: listing.itinerario ?? [],
      precio_b2c: listing.precioB2c,
      precio_neto_b2b: listing.precioNetoB2b ?? null,
      moneda: "MXN",
      duracion: listing.duracion,
      ubicacion: listing.ubicacion,
      imagenes: IMAGENES_POR_SLUG[listing.slug] ?? img(listing.slug, 3),
      cupo: listing.cupo ?? 20,
      activo: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`listing ${listing.slug}: ${error.message}`);
  return data.id;
}

async function seedDisponibilidad(listingId, dates, cupo) {
  const rows = dates.map((fecha) => ({
    listing_id: listingId,
    fecha,
    cupo_disponible: cupo,
  }));
  const { error } = await admin
    .from("disponibilidad")
    .upsert(rows, { onConflict: "listing_id,fecha", ignoreDuplicates: true });
  if (error) throw new Error(`disponibilidad ${listingId}: ${error.message}`);
}

async function ensurePaquete({ agenciaId, titulo, componentes, precioTotal, markupPct }) {
  const { data: existing } = await admin
    .from("paquetes")
    .select("id")
    .eq("agencia_id", agenciaId)
    .eq("titulo", titulo)
    .maybeSingle();
  if (existing) return existing.id;

  const { error } = await admin.from("paquetes").insert({
    agencia_id: agenciaId,
    titulo,
    componentes,
    precio_total: precioTotal,
    markup_pct: markupPct,
  });
  if (error) throw new Error(`paquete ${titulo}: ${error.message}`);
}

// --- Datos (rutas reales tomadas de rutaru.com; hoteles/traslados/eventos
// adicionales ficticios pero realistas, per seccion 6 del spec) ---

const RUTAS = [
  {
    slug: "polvo-y-eternidad",
    titulo: "Polvo y eternidad: La estructura de la inmersión",
    descripcion:
      "En la frontera donde el tiempo se detiene y la geografía se vuelve minimalista.",
    duracion: "3 días / 2 noches",
    ubicacion: "Hidalgo",
    precioB2c: 8500,
    precioNetoB2b: 6800,
  },
  {
    slug: "tlatlauquitepec",
    titulo: "Tlatlauquitepec: El México vertical que no admite mapas",
    descripcion: "Geografía de acceso restringido.",
    duracion: "3 días / 2 noches",
    ubicacion: "Puebla",
    precioB2c: 8900,
    precioNetoB2b: 7100,
  },
  {
    slug: "la-merced",
    titulo: "LA MERCED: El origen del comercio",
    descripcion: "Historia de la primera zona comercial de la ciudad.",
    duracion: "1 día",
    ubicacion: "CDMX",
    precioB2c: 1450,
    precioNetoB2b: 1100,
  },
  {
    slug: "reino-de-las-nubes",
    titulo: "Expedición al Reino de las Nubes",
    descripcion: "Centro Ceremonial Otomí y el arte de Temoaya.",
    duracion: "1 día",
    ubicacion: "Temoaya, Estado de México",
    precioB2c: 7400,
    precioNetoB2b: 5900,
  },
  {
    slug: "cornish",
    titulo: "CORNISH: El legado de la niebla",
    descripcion: "Minería y patrimonio en Real del Monte.",
    duracion: "1 día",
    ubicacion: "Real del Monte, Hidalgo",
    precioB2c: 7800,
    precioNetoB2b: 6200,
  },
  {
    slug: "legado-del-guerrero",
    titulo: "El legado del guerrero",
    descripcion: "Terrazas prehispánicas de Milpa Alta.",
    duracion: "1 día",
    ubicacion: "Milpa Alta, CDMX",
    precioB2c: 7200,
    precioNetoB2b: 5750,
  },
  {
    slug: "sincretismo",
    titulo: "SINCRETISMO: Las llaves de la ciudad oculta",
    descripcion: "Recorrido histórico-cultural.",
    duracion: "1 día",
    ubicacion: "CDMX",
    precioB2c: 3250,
    precioNetoB2b: 2600,
  },
  {
    slug: "cantona",
    titulo: "CANTONA: La Metrópoli de Lava",
    descripcion: "Sitio arqueológico.",
    duracion: "1 día",
    ubicacion: "Cantona, Puebla",
    precioB2c: 3650,
    precioNetoB2b: 2900,
  },
].map((r) => ({ ...r, tipo: "ruta" }));

const TRASLADOS = [
  {
    slug: "club-shared-aifa",
    titulo: "Club shared al AIFA",
    descripcion:
      "Traslado compartido al Aeropuerto Internacional Felipe Ángeles.",
    duracion: "60 minutos",
    ubicacion: "AIFA",
    precioB2c: 450,
    precioNetoB2b: 320,
  },
  {
    slug: "privado-aicm-centro",
    titulo: "Traslado privado AICM - CDMX Centro",
    descripcion: "Traslado privado directo desde el AICM al Centro Histórico.",
    duracion: "45 minutos",
    ubicacion: "AICM",
    precioB2c: 650,
    precioNetoB2b: 480,
  },
  {
    slug: "compartido-aicm-polanco",
    titulo: "Traslado compartido AICM - Polanco",
    descripcion: "Shuttle compartido del AICM a Polanco.",
    duracion: "50 minutos",
    ubicacion: "AICM",
    precioB2c: 380,
    precioNetoB2b: 260,
  },
  {
    slug: "privado-aifa-santa-fe",
    titulo: "Traslado privado AIFA - Santa Fe",
    descripcion: "Traslado privado del AIFA a Santa Fe.",
    duracion: "75 minutos",
    ubicacion: "AIFA",
    precioB2c: 780,
    precioNetoB2b: 590,
  },
  {
    slug: "shuttle-aifa-roma-condesa",
    titulo: "Shuttle compartido AIFA - Roma/Condesa",
    descripcion: "Shuttle compartido del AIFA a Roma/Condesa.",
    duracion: "70 minutos",
    ubicacion: "AIFA",
    precioB2c: 420,
    precioNetoB2b: 300,
  },
  {
    slug: "privado-puebla-cdmx",
    titulo: "Traslado privado Puebla - CDMX",
    descripcion: "Traslado privado entre Puebla y CDMX.",
    duracion: "2 horas",
    ubicacion: "Puebla",
    precioB2c: 1800,
    precioNetoB2b: 1400,
  },
  {
    slug: "compartido-cdmx-puebla",
    titulo: "Traslado compartido CDMX - Puebla",
    descripcion: "Traslado compartido entre CDMX y Puebla.",
    duracion: "2 horas",
    ubicacion: "CDMX",
    precioB2c: 620,
    precioNetoB2b: 460,
  },
  {
    slug: "privado-aicm-coyoacan",
    titulo: "Traslado privado AICM - Coyoacán",
    descripcion: "Traslado privado del AICM a Coyoacán.",
    duracion: "55 minutos",
    ubicacion: "AICM",
    precioB2c: 690,
    precioNetoB2b: 520,
  },
  {
    slug: "shuttle-nocturno-aifa",
    titulo: "Shuttle nocturno AIFA",
    descripcion: "Shuttle compartido nocturno hacia el AIFA.",
    duracion: "65 minutos",
    ubicacion: "AIFA",
    precioB2c: 500,
    precioNetoB2b: 360,
  },
  {
    slug: "ejecutivo-privado-aicm",
    titulo: "Traslado ejecutivo privado AICM",
    descripcion: "Traslado ejecutivo privado desde/hacia el AICM.",
    duracion: "50 minutos",
    ubicacion: "AICM",
    precioB2c: 950,
    precioNetoB2b: 740,
  },
].map((t) => ({ ...t, tipo: "traslado" }));

const HOSPEDAJE = [
  { slug: "loft-roma-norte", titulo: "Loft minimalista en Roma Norte", ubicacion: "CDMX", precioB2c: 1800 },
  { slug: "casa-condesa-jardin", titulo: "Casa con jardín en la Condesa", ubicacion: "CDMX", precioB2c: 2400 },
  { slug: "estudio-polanco", titulo: "Estudio de diseño en Polanco", ubicacion: "CDMX", precioB2c: 1600 },
  { slug: "casa-oaxaca-centro", titulo: "Casa colonial en el Centro de Oaxaca", ubicacion: "Oaxaca", precioB2c: 1350 },
  { slug: "cabana-hierve-el-agua", titulo: "Cabaña frente a Hierve el Agua", ubicacion: "Oaxaca", precioB2c: 1100 },
  { slug: "suite-mezcal-oaxaca", titulo: "Suite boutique ruta del mezcal", ubicacion: "Oaxaca", precioB2c: 1950 },
  { slug: "casona-puebla-centro", titulo: "Casona con azulejos en el Centro de Puebla", ubicacion: "Puebla", precioB2c: 1500 },
  { slug: "loft-angelopolis", titulo: "Loft moderno en Angelópolis", ubicacion: "Puebla", precioB2c: 1700 },
  { slug: "cabana-cholula", titulo: "Cabaña con vista a la Gran Pirámide de Cholula", ubicacion: "Puebla", precioB2c: 1250 },
  { slug: "hacienda-real-del-monte", titulo: "Hacienda restaurada en Real del Monte", ubicacion: "Hidalgo", precioB2c: 2100 },
  { slug: "cabana-huasca", titulo: "Cabaña de montaña en Huasca de Ocampo", ubicacion: "Hidalgo", precioB2c: 1400 },
  { slug: "casa-mineral-del-chico", titulo: "Casa de piedra en Mineral del Chico", ubicacion: "Hidalgo", precioB2c: 1300 },
  { slug: "villa-tulum-selva", titulo: "Villa privada en la selva de Tulum", ubicacion: "Riviera Maya", precioB2c: 4200 },
  { slug: "depa-playa-carmen", titulo: "Departamento frente al mar en Playa del Carmen", ubicacion: "Riviera Maya", precioB2c: 3100 },
  { slug: "cabana-bacalar-laguna", titulo: "Cabaña sobre la Laguna de Bacalar", ubicacion: "Riviera Maya", precioB2c: 2800 },
].map((h) => ({
  ...h,
  tipo: "hospedaje",
  descripcion: `Estancia estilo Airbnb en ${h.ubicacion}.`,
  duracion: "por noche",
  precioNetoB2b: Math.round(h.precioB2c * 0.78),
}));

const EVENTOS = [
  {
    slug: "capital-fest-2026",
    titulo: "Capital Fest 2026",
    ubicacion: "CDMX",
    precioB2c: 2800,
    zonas: [
      { nombre: "General", precio: 2800 },
      { nombre: "VIP", precio: 5200 },
      { nombre: "Palco", precio: 9800 },
    ],
  },
  {
    slug: "feria-san-marcos-ficticia",
    titulo: "Feria de San Marcos (edición ficticia)",
    ubicacion: "Aguascalientes",
    precioB2c: 350,
    zonas: [{ nombre: "Entrada general", precio: 350 }],
  },
  {
    slug: "festival-gastronomico-oaxaca",
    titulo: "Festival Gastronómico de Oaxaca",
    ubicacion: "Oaxaca",
    precioB2c: 600,
    zonas: [{ nombre: "Entrada general", precio: 600 }],
  },
  {
    slug: "festival-cultural-cholula",
    titulo: "Festival Cultural de Cholula",
    ubicacion: "Puebla",
    precioB2c: 450,
    zonas: [{ nombre: "Entrada general", precio: 450 }],
  },
  {
    slug: "noche-de-museos-cdmx",
    titulo: "Noche de Museos CDMX",
    ubicacion: "CDMX",
    precioB2c: 200,
    zonas: [{ nombre: "Entrada general", precio: 200 }],
  },
  {
    slug: "festival-mezcal-oaxaca",
    titulo: "Festival del Mezcal Oaxaca",
    ubicacion: "Oaxaca",
    precioB2c: 700,
    zonas: [
      { nombre: "Entrada general", precio: 700 },
      { nombre: "Cata premium", precio: 1400 },
    ],
  },
  {
    slug: "festival-globos-ficticio",
    titulo: "Festival Internacional del Globo (edición ficticia)",
    ubicacion: "León",
    precioB2c: 900,
    zonas: [{ nombre: "Entrada general", precio: 900 }],
  },
  {
    slug: "concierto-teotihuacan",
    titulo: "Concierto bajo las estrellas — Teotihuacán",
    ubicacion: "Estado de México",
    precioB2c: 1500,
    zonas: [
      { nombre: "General", precio: 1500 },
      { nombre: "Preferente", precio: 2600 },
    ],
  },
].map((e) => ({
  ...e,
  tipo: "evento",
  descripcion: `Evento en ${e.ubicacion}.`,
  duracion: "1 día",
  precioNetoB2b: Math.round(e.precioB2c * 0.8),
  itinerario: [{ zonas: e.zonas }],
}));

async function main() {
  console.log("Creando cuentas de operadores/agencia/afiliados adicionales...");

  const rutasUserId = await ensureUser("operador@rutaru.demo", "operador", "Operador Demo");
  const hotelesUserId = await ensureUser("hoteles@rutaru.demo", "operador", "Hoteles Rutaru");
  const traslsUserId = await ensureUser("traslados@rutaru.demo", "operador", "Traslados Rutaru");
  const eventosUserId = await ensureUser("eventos@rutaru.demo", "operador", "Eventos Rutaru");
  const agenciaUserId = await ensureUser("agencia@rutaru.demo", "agencia", "Agencia Demo");
  const afiliado2UserId = await ensureUser("afiliado2@rutaru.demo", "afiliado", "Afiliado Demo 2");

  const operadorRutas = await ensureOperador({
    userId: rutasUserId,
    tipo: "tour",
    descripcion: "Rutas y tours de autor.",
    slug: "rutaru-tours",
  });
  const operadorHoteles = await ensureOperador({
    userId: hotelesUserId,
    tipo: "hotel",
    descripcion: "Hospedajes estilo Airbnb en todo México.",
    slug: "rutaru-hospedaje",
  });
  const operadorTraslados = await ensureOperador({
    userId: traslsUserId,
    tipo: "transporte",
    descripcion: "Traslados privados y compartidos.",
    slug: "rutaru-traslados",
  });
  const operadorEventos = await ensureOperador({
    userId: eventosUserId,
    tipo: "evento",
    descripcion: "Boletaje de eventos y festivales.",
    slug: "rutaru-eventos",
  });

  const agenciaId = await ensureAgencia({
    userId: agenciaUserId,
    razonSocial: "Rutaru Agencia Demo",
    pais: "MX",
    nivelB2b: "gold",
    markup: 15,
  });

  const afiliadoId1 = await ensureAfiliado({
    userId: (
      await admin.from("profiles").select("id").eq("email", "afiliado@rutaru.demo").single()
    ).data.id,
    codigo5: "RUTA5",
    codigo10: "RUTA10",
  });
  const afiliadoId2 = await ensureAfiliado({
    userId: afiliado2UserId,
    codigo5: "VIAJA5",
    codigo10: "VIAJA10",
  });

  console.log("Sembrando listings...");

  const rutaIds = [];
  for (const r of RUTAS) {
    const id = await ensureListing(operadorRutas, r);
    rutaIds.push({ id, slug: r.slug });
    await seedDisponibilidad(id, rollingDates(8, 10), r.cupo ?? 15);
  }

  const traslsIds = [];
  for (const t of TRASLADOS) {
    const id = await ensureListing(operadorTraslados, t);
    traslsIds.push({ id, slug: t.slug });
    await seedDisponibilidad(id, rollingDates(20, 2), 30);
  }

  const hospedajeIds = [];
  for (const h of HOSPEDAJE) {
    const id = await ensureListing(operadorHoteles, h);
    hospedajeIds.push({ id, slug: h.slug });
    await seedDisponibilidad(id, rollingDates(30, 1), 3);
  }

  const eventoIds = [];
  for (const e of EVENTOS) {
    const id = await ensureListing(operadorEventos, e);
    eventoIds.push({ id, slug: e.slug });
    await seedDisponibilidad(id, rollingDates(3, 20), 200);
  }

  console.log(`Listings: ${rutaIds.length} rutas, ${traslsIds.length} traslados, ${hospedajeIds.length} hospedajes, ${eventoIds.length} eventos.`);

  console.log("Sembrando paquetes de agencia...");

  await ensurePaquete({
    agenciaId,
    titulo: "Oaxaca todo incluido",
    componentes: [
      { listing_id: traslsIds.find((x) => x.slug === "compartido-cdmx-puebla").id },
      { listing_id: hospedajeIds.find((x) => x.slug === "casa-oaxaca-centro").id },
      { listing_id: eventoIds.find((x) => x.slug === "festival-mezcal-oaxaca").id },
    ],
    precioTotal: 4200,
    markupPct: 18,
  });

  await ensurePaquete({
    agenciaId,
    titulo: "Puebla y Cantona express",
    componentes: [
      { listing_id: rutaIds.find((x) => x.slug === "cantona").id },
      { listing_id: hospedajeIds.find((x) => x.slug === "loft-angelopolis").id },
    ],
    precioTotal: 5800,
    markupPct: 15,
  });

  await ensurePaquete({
    agenciaId,
    titulo: "Riviera Maya escape",
    componentes: [
      { listing_id: hospedajeIds.find((x) => x.slug === "villa-tulum-selva").id },
      { listing_id: traslsIds.find((x) => x.slug === "privado-aicm-centro").id },
    ],
    precioTotal: 9500,
    markupPct: 20,
  });

  console.log("Seed de inventario completo.");
  console.log("Codigos de afiliado demo: RUTA5 / RUTA10 (afiliado@rutaru.demo), VIAJA5 / VIAJA10 (afiliado2@rutaru.demo)");
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
