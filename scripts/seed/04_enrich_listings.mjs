import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- Ubicacion (texto libre existente) -> pais/estado/ciudad, para los
// selects encadenados del buscador (Bloque 3) y el constructor de paquetes
// (Bloque 5). Solo Mexico por ahora (todo el inventario es nacional).
const GEO = {
  Hidalgo: { pais: "México", estado: "Hidalgo", ciudad: "Pachuca" },
  Puebla: { pais: "México", estado: "Puebla", ciudad: "Puebla" },
  CDMX: { pais: "México", estado: "Ciudad de México", ciudad: "Ciudad de México" },
  "Temoaya, Estado de México": { pais: "México", estado: "Estado de México", ciudad: "Temoaya" },
  "Real del Monte, Hidalgo": { pais: "México", estado: "Hidalgo", ciudad: "Real del Monte" },
  "Milpa Alta, CDMX": { pais: "México", estado: "Ciudad de México", ciudad: "Milpa Alta" },
  "Cantona, Puebla": { pais: "México", estado: "Puebla", ciudad: "Cantona" },
  AIFA: { pais: "México", estado: "Estado de México", ciudad: "Zumpango" },
  AICM: { pais: "México", estado: "Ciudad de México", ciudad: "Ciudad de México" },
  Oaxaca: { pais: "México", estado: "Oaxaca", ciudad: "Oaxaca de Juárez" },
  "Riviera Maya": { pais: "México", estado: "Quintana Roo", ciudad: "Riviera Maya" },
  Aguascalientes: { pais: "México", estado: "Aguascalientes", ciudad: "Aguascalientes" },
  León: { pais: "México", estado: "Guanajuato", ciudad: "León" },
  "Estado de México": { pais: "México", estado: "Estado de México", ciudad: "Teotihuacán" },
};

// Ajustes de ciudad mas especificos para hospedaje en Riviera Maya (mismo
// estado, distinta ciudad segun la propiedad).
const CIUDAD_OVERRIDE = {
  "villa-tulum-selva": "Tulum",
  "depa-playa-carmen": "Playa del Carmen",
  "cabana-bacalar-laguna": "Bacalar",
};

function geoFor(slug, ubicacion) {
  const base = GEO[ubicacion] ?? { pais: "México", estado: null, ciudad: ubicacion ?? null };
  const ciudad = CIUDAD_OVERRIDE[slug] ?? base.ciudad;
  return { pais: base.pais, estado: base.estado, ciudad };
}

const QUE_INCLUYE = {
  ruta: ["Transporte redondo", "Guía certificado", "Entradas y accesos", "Seguro de viajero", "Snack y agua"],
  traslado: ["Chofer profesional", "Vehículo con A/C", "Monitoreo de vuelo", "Agua embotellada", "Asistencia con equipaje"],
  hospedaje: ["Wifi de alta velocidad", "Cocina equipada", "Ropa de cama y toallas", "Check-in flexible", "Atención 24/7"],
  evento: ["Acceso al recinto", "Zona de food trucks", "Seguridad y primeros auxilios", "Casilleros disponibles"],
  experiencia: ["Instructor certificado", "Equipo especializado", "Seguro de actividad", "Fotografías del recorrido"],
};

const CANCELACIONES = {
  ruta: "Cancelación gratuita hasta 48 h antes de la salida. Entre 48 y 24 h, cuota de cancelación de $700 MXN. Después de 24 h no hay reembolso.",
  traslado: "Cancelación gratuita hasta 6 h antes del traslado. Después de ese plazo se cobra el 50% del costo del servicio.",
  hospedaje: "Cancelación gratuita hasta 5 días antes del check-in. Entre 5 y 2 días antes, reembolso del 50%. Menos de 48 h antes, no hay reembolso.",
  evento: "Los boletos no son reembolsables ni transferibles. Si el organizador cancela el evento, se reembolsa el 100%.",
  experiencia: "Cancelación gratuita hasta 48 h antes de la actividad. Entre 48 y 24 h, cuota de cancelación de $700 MXN. Después de 24 h no hay reembolso.",
};

// --- Rutas: itinerario editorial hora por hora, escrito a mano en el tono
// de rutaru.com (referencia: pagina real de Cantona). ---
const RUTAS_ITINERARIO = {
  "polvo-y-eternidad": {
    dificultad: "Moderada",
    pasos: [
      { hora: "06:30", titulo: "Punto de encuentro", descripcion: "Salida desde el punto de reunión en CDMX rumbo al altiplano hidalguense." },
      { hora: "09:00", titulo: "Primer contacto con el paisaje", descripcion: "Llegada a la región semidesértica: la luz cambia y el tiempo empieza a comportarse distinto." },
      { hora: "12:00", titulo: "Inmersión guiada", descripcion: "Recorrido a pie por la estructura geológica que da nombre a la ruta, con paradas para observación y fotografía." },
      { hora: "15:00", titulo: "Comida de la región", descripcion: "Alimentos típicos del altiplano, incluidos en el precio." },
      { hora: "18:00", titulo: "Noche 1 — hospedaje", descripcion: "Check-in en el alojamiento de la ruta, cena libre." },
      { hora: "09:00 (día 2)", titulo: "Segundo día de exploración", descripcion: "Continuación del recorrido hacia los puntos menos accesibles de la zona." },
      { hora: "17:00 (día 3)", titulo: "Regreso", descripcion: "Salida de vuelta a CDMX, llegada estimada al anochecer." },
    ],
  },
  tlatlauquitepec: {
    dificultad: "Retadora",
    pasos: [
      { hora: "06:00", titulo: "Salida hacia la sierra", descripcion: "Traslado desde CDMX/Puebla hacia la sierra nororiental, terreno que no admite mapas convencionales." },
      { hora: "10:30", titulo: "Ascenso inicial", descripcion: "Primer tramo de ascenso entre niebla y vegetación de montaña." },
      { hora: "13:30", titulo: "Mirador vertical", descripcion: "Llegada al punto más alto del día — vistas de la sierra que sólo existen fuera de temporada de turismo masivo." },
      { hora: "16:00", titulo: "Descenso y hospedaje", descripcion: "Descenso guiado y check-in en el punto de pernocta." },
      { hora: "09:00 (día 2)", titulo: "Segunda jornada", descripcion: "Recorrido por las zonas de acceso restringido que dan identidad a la ruta." },
      { hora: "17:00 (día 3)", titulo: "Cierre y regreso", descripcion: "Última exploración de la mañana y traslado de vuelta." },
    ],
  },
  "la-merced": {
    dificultad: "Fácil",
    pasos: [
      { hora: "09:00", titulo: "Punto de encuentro", descripcion: "Reunión en el Centro Histórico, a unos pasos del mercado." },
      { hora: "09:30", titulo: "Origen del comercio", descripcion: "Recorrido histórico por el nacimiento de la primera zona comercial de la ciudad." },
      { hora: "11:00", titulo: "Mercado en vivo", descripcion: "Caminata guiada entre los pasillos activos de La Merced, con paradas para probar producto local." },
      { hora: "13:00", titulo: "Cierre de la ruta", descripcion: "Punto final y recomendaciones para seguir explorando por cuenta propia." },
    ],
  },
  "reino-de-las-nubes": {
    dificultad: "Fácil",
    pasos: [
      { hora: "07:00", titulo: "Salida estratégica", descripcion: "Salida temprana desde CDMX hacia Temoaya, antes de que suba la niebla." },
      { hora: "09:30", titulo: "Centro Ceremonial Otomí", descripcion: "Visita guiada al centro ceremonial, con explicación de su simbolismo y arquitectura." },
      { hora: "12:00", titulo: "Taller textil otomí", descripcion: "Encuentro con artesanas locales y demostración del arte textil de la región." },
      { hora: "14:30", titulo: "Comida y regreso", descripcion: "Comida incluida y traslado de vuelta a CDMX." },
    ],
  },
  cornish: {
    dificultad: "Moderada",
    pasos: [
      { hora: "07:30", titulo: "Salida hacia Real del Monte", descripcion: "Traslado desde CDMX hacia el pueblo minero, cuna de la comunidad cornish en México." },
      { hora: "10:00", titulo: "Patrimonio minero", descripcion: "Recorrido por los túneles y estructuras que dejó la minería británica del siglo XIX." },
      { hora: "12:30", titulo: "Pastes y legado", descripcion: "Parada gastronómica para probar el paste, herencia directa de la comunidad cornish." },
      { hora: "15:00", titulo: "Cierre y regreso", descripcion: "Último tramo del recorrido y traslado de vuelta a CDMX." },
    ],
  },
  "legado-del-guerrero": {
    dificultad: "Moderada",
    pasos: [
      { hora: "07:00", titulo: "Salida hacia Milpa Alta", descripcion: "Traslado hacia las terrazas prehispánicas al sur de la ciudad." },
      { hora: "09:30", titulo: "Terrazas y milpa", descripcion: "Caminata guiada por el sistema de terrazas agrícolas y su relación con el paisaje ceremonial." },
      { hora: "12:30", titulo: "Comida campesina", descripcion: "Alimentos preparados con producto de la propia región." },
      { hora: "15:00", titulo: "Regreso", descripcion: "Traslado de vuelta a CDMX." },
    ],
  },
  sincretismo: {
    dificultad: "Fácil",
    pasos: [
      { hora: "09:00", titulo: "Punto de encuentro", descripcion: "Reunión en el Centro Histórico de la CDMX." },
      { hora: "09:30", titulo: "Las llaves de la ciudad oculta", descripcion: "Recorrido histórico-cultural por capas de la ciudad que rara vez se cruzan en un mismo recorrido." },
      { hora: "12:00", titulo: "Sincretismo religioso", descripcion: "Visita a puntos donde conviven tradiciones prehispánicas y coloniales." },
      { hora: "14:00", titulo: "Cierre", descripcion: "Fin del recorrido y recomendaciones para continuar por cuenta propia." },
    ],
  },
  cantona: {
    dificultad: "Moderada",
    pasos: [
      { hora: "07:00", titulo: "Salida estratégica", descripcion: "Salida desde el punto de encuentro rumbo a la metrópoli de lava, antes de que suba el calor." },
      { hora: "09:30", titulo: "Llegada y contexto", descripcion: "Introducción a Cantona: una ciudad construida enteramente sobre roca volcánica, sin calles trazadas en línea recta." },
      { hora: "10:30", titulo: "Recorrido por las calzadas", descripcion: "Caminata guiada por el sistema de calzadas y juegos de pelota — Cantona conserva 27, más que cualquier otro sitio de Mesoamérica." },
      { hora: "13:00", titulo: "Miradores y acrópolis", descripcion: "Ascenso a los puntos altos del sitio para dimensionar la extensión real de la ciudad de lava." },
      { hora: "15:00", titulo: "Comida y cierre", descripcion: "Comida regional incluida y traslado de regreso." },
    ],
  },
};

// --- Traslados: plantilla de 3 pasos (pickup / transito / llegada). ---
function itinerarioTraslado(t) {
  return {
    pasos: [
      { hora: "T-15 min", titulo: "Punto de encuentro", descripcion: `Monitoreo de vuelo y espera en el punto acordado en ${t.ubicacion}.` },
      { hora: "T+0", titulo: "En camino", descripcion: `Traslado directo, duración estimada de ${t.duracion}.` },
      { hora: "T+" + t.duracion, titulo: "Llegada", descripcion: "Descenso y asistencia con equipaje en el destino." },
    ],
  };
}

// --- Hospedaje: plantilla check-in / estancia / check-out. ---
function itinerarioHospedaje(h) {
  return {
    pasos: [
      { hora: "15:00", titulo: "Check-in", descripcion: `Llegada y entrega de llaves en ${h.titulo}.` },
      { hora: "Durante tu estancia", titulo: "Disfruta el espacio", descripcion: "Wifi, cocina equipada y atención directa por si necesitas algo." },
      { hora: "12:00", titulo: "Check-out", descripcion: "Salida y entrega de llaves — limpieza a cargo del anfitrión." },
    ],
  };
}

// --- Eventos: agenda simple del dia, se combina con las zonas ya existentes. ---
function itinerarioEvento(e) {
  return {
    pasos: [
      { hora: "12:00", titulo: "Apertura de puertas", descripcion: "Acceso al recinto y zona de food trucks." },
      { hora: "16:00", titulo: "Arranca la programación", descripcion: "Inicio de las actividades/presentaciones principales." },
      { hora: "23:00", titulo: "Cierre", descripcion: "Fin de la jornada." },
    ],
    zonas: e.zonas,
  };
}

async function actualizarListing(slug, patch) {
  const { error } = await admin.from("listings").update(patch).eq("slug", slug);
  if (error) throw new Error(`update ${slug}: ${error.message}`);
}

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

const TODAY = new Date();
function rollingDates(count, stepDays) {
  return Array.from({ length: count }, (_, i) => addDays(TODAY, 7 + i * stepDays));
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
    password: "demo1234",
    email_confirm: true,
    user_metadata: { role, nombre },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function ensureOperador({ userId, tipo, descripcion, slug }) {
  const { data: existing } = await admin
    .from("operadores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await admin
    .from("operadores")
    .insert({ user_id: userId, tipo, descripcion, slug })
    .select("id")
    .single();
  if (error) throw new Error(`operador ${slug}: ${error.message}`);
  return data.id;
}

async function ensureExperienciaListing(operadorId, e) {
  const { data: existing } = await admin
    .from("listings")
    .select("id")
    .eq("slug", e.slug)
    .maybeSingle();
  if (existing) return existing.id;

  const geo = geoFor(e.slug, e.ubicacion);
  const { data, error } = await admin
    .from("listings")
    .insert({
      operador_id: operadorId,
      tipo: "experiencia",
      titulo: e.titulo,
      slug: e.slug,
      descripcion: e.descripcion,
      itinerario: { pasos: e.pasos },
      que_incluye: QUE_INCLUYE.experiencia,
      cancelaciones: CANCELACIONES.experiencia,
      dificultad: e.dificultad,
      ...geo,
      precio_b2c: e.precioB2c,
      precio_neto_b2b: Math.round(e.precioB2c * 0.78),
      moneda: "MXN",
      duracion: e.duracion,
      ubicacion: e.ubicacion,
      imagenes: img(e.slug, 3),
      cupo: e.cupo ?? 12,
      activo: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`experiencia ${e.slug}: ${error.message}`);
  return data.id;
}

async function seedDisponibilidad(listingId, dates, cupo) {
  const rows = dates.map((fecha) => ({ listing_id: listingId, fecha, cupo_disponible: cupo }));
  const { error } = await admin
    .from("disponibilidad")
    .upsert(rows, { onConflict: "listing_id,fecha", ignoreDuplicates: true });
  if (error) throw new Error(`disponibilidad ${listingId}: ${error.message}`);
}

const EXPERIENCIAS = [
  {
    slug: "taller-mezcal-oaxaca",
    titulo: "Taller de cata de mezcal en palenque tradicional",
    descripcion: "Un palenque familiar, tres generaciones de maestros mezcaleros y un recorrido sensorial completo.",
    ubicacion: "Oaxaca",
    duracion: "4 horas",
    precioB2c: 1450,
    dificultad: "Fácil",
    pasos: [
      { hora: "10:00", titulo: "Llegada al palenque", descripcion: "Recepción por la familia mezcalera y contexto histórico del oficio." },
      { hora: "10:30", titulo: "Del agave al mezcal", descripcion: "Recorrido por el proceso completo: horno, molino, fermentación y destilación." },
      { hora: "12:30", titulo: "Cata guiada", descripcion: "Degustación de al menos 5 variedades, con maridaje ligero." },
      { hora: "14:00", titulo: "Cierre", descripcion: "Tiempo libre para compra directa en el palenque." },
    ],
  },
  {
    slug: "rapel-barrancas-huasca",
    titulo: "Rapel en las barrancas de Huasca de Ocampo",
    descripcion: "Descenso guiado en las formaciones basálticas de Hidalgo, con equipo certificado.",
    ubicacion: "Real del Monte, Hidalgo",
    duracion: "5 horas",
    precioB2c: 1850,
    dificultad: "Retadora",
    pasos: [
      { hora: "08:00", titulo: "Briefing de seguridad", descripcion: "Explicación de la técnica y ajuste de equipo certificado." },
      { hora: "09:00", titulo: "Primer descenso", descripcion: "Rapel guiado en la primera barranca, con instructor por cada 2 participantes." },
      { hora: "12:00", titulo: "Segunda barranca", descripcion: "Descenso en la formación más alta del recorrido." },
      { hora: "13:30", titulo: "Cierre y comida", descripcion: "Comida regional incluida al finalizar la actividad." },
    ],
  },
  {
    slug: "taller-textil-otomi-temoaya",
    titulo: "Taller de telar de cintura con artesanas otomíes",
    descripcion: "Aprende la técnica textil otomí directamente de las manos que la mantienen viva.",
    ubicacion: "Temoaya, Estado de México",
    duracion: "3 horas",
    precioB2c: 980,
    dificultad: "Fácil",
    pasos: [
      { hora: "11:00", titulo: "Bienvenida", descripcion: "Presentación del taller familiar y su historia textil." },
      { hora: "11:30", titulo: "Técnica de telar de cintura", descripcion: "Práctica guiada paso a paso con materiales incluidos." },
      { hora: "13:30", titulo: "Cierre", descripcion: "Cada participante se lleva su propia pieza tejida." },
    ],
  },
  {
    slug: "clase-cocina-oaxaquena",
    titulo: "Clase de cocina oaxaqueña de mercado a mesa",
    descripcion: "Compra en el mercado local y cocina un mole desde cero con una cocinera tradicional.",
    ubicacion: "Oaxaca",
    duracion: "4.5 horas",
    precioB2c: 1600,
    dificultad: "Fácil",
    pasos: [
      { hora: "09:00", titulo: "Recorrido de mercado", descripcion: "Compra guiada de ingredientes frescos en el mercado local." },
      { hora: "10:30", titulo: "Manos a la obra", descripcion: "Preparación de mole desde cero, con explicación de cada paso." },
      { hora: "13:00", titulo: "A la mesa", descripcion: "Comida del platillo preparado, acompañado de mezcal." },
    ],
  },
  {
    slug: "avistamiento-estrellas-cantona",
    titulo: "Avistamiento de estrellas en Cantona",
    descripcion: "Una noche de cielo abierto sobre la metrópoli de lava, con telescopios y guía astronómico.",
    ubicacion: "Cantona, Puebla",
    duracion: "3 horas",
    precioB2c: 1100,
    dificultad: "Fácil",
    pasos: [
      { hora: "19:00", titulo: "Llegada al sitio", descripcion: "Instalación de telescopios antes de que caiga la noche por completo." },
      { hora: "20:00", titulo: "Recorrido celeste", descripcion: "Observación guiada de constelaciones y objetos de cielo profundo." },
      { hora: "22:00", titulo: "Cierre", descripcion: "Cierre de la actividad y traslado de regreso." },
    ],
  },
];

async function main() {
  console.log("Enriqueciendo rutas...");
  const rutasUbicaciones = {
    "polvo-y-eternidad": "Hidalgo",
    tlatlauquitepec: "Puebla",
    "la-merced": "CDMX",
    "reino-de-las-nubes": "Temoaya, Estado de México",
    cornish: "Real del Monte, Hidalgo",
    "legado-del-guerrero": "Milpa Alta, CDMX",
    sincretismo: "CDMX",
    cantona: "Cantona, Puebla",
  };
  for (const [slug, contenido] of Object.entries(RUTAS_ITINERARIO)) {
    const ubicacion = rutasUbicaciones[slug];
    const geo = geoFor(slug, ubicacion);
    await actualizarListing(slug, {
      itinerario: { pasos: contenido.pasos },
      que_incluye: QUE_INCLUYE.ruta,
      cancelaciones: CANCELACIONES.ruta,
      dificultad: contenido.dificultad,
      ...geo,
    });
  }

  console.log("Enriqueciendo traslados...");
  const traslados = [
    { slug: "club-shared-aifa", ubicacion: "AIFA", duracion: "60 minutos" },
    { slug: "privado-aicm-centro", ubicacion: "AICM", duracion: "45 minutos" },
    { slug: "compartido-aicm-polanco", ubicacion: "AICM", duracion: "50 minutos" },
    { slug: "privado-aifa-santa-fe", ubicacion: "AIFA", duracion: "75 minutos" },
    { slug: "shuttle-aifa-roma-condesa", ubicacion: "AIFA", duracion: "70 minutos" },
    { slug: "privado-puebla-cdmx", ubicacion: "Puebla", duracion: "2 horas" },
    { slug: "compartido-cdmx-puebla", ubicacion: "CDMX", duracion: "2 horas" },
    { slug: "privado-aicm-coyoacan", ubicacion: "AICM", duracion: "55 minutos" },
    { slug: "shuttle-nocturno-aifa", ubicacion: "AIFA", duracion: "65 minutos" },
    { slug: "ejecutivo-privado-aicm", ubicacion: "AICM", duracion: "50 minutos" },
  ];
  for (const t of traslados) {
    const geo = geoFor(t.slug, t.ubicacion);
    await actualizarListing(t.slug, {
      itinerario: itinerarioTraslado(t),
      que_incluye: QUE_INCLUYE.traslado,
      cancelaciones: CANCELACIONES.traslado,
      dificultad: null,
      ...geo,
    });
  }

  console.log("Enriqueciendo hospedaje...");
  const hospedajes = [
    { slug: "loft-roma-norte", titulo: "Loft minimalista en Roma Norte", ubicacion: "CDMX" },
    { slug: "casa-condesa-jardin", titulo: "Casa con jardín en la Condesa", ubicacion: "CDMX" },
    { slug: "estudio-polanco", titulo: "Estudio de diseño en Polanco", ubicacion: "CDMX" },
    { slug: "casa-oaxaca-centro", titulo: "Casa colonial en el Centro de Oaxaca", ubicacion: "Oaxaca" },
    { slug: "cabana-hierve-el-agua", titulo: "Cabaña frente a Hierve el Agua", ubicacion: "Oaxaca" },
    { slug: "suite-mezcal-oaxaca", titulo: "Suite boutique ruta del mezcal", ubicacion: "Oaxaca" },
    { slug: "casona-puebla-centro", titulo: "Casona con azulejos en el Centro de Puebla", ubicacion: "Puebla" },
    { slug: "loft-angelopolis", titulo: "Loft moderno en Angelópolis", ubicacion: "Puebla" },
    { slug: "cabana-cholula", titulo: "Cabaña con vista a la Gran Pirámide de Cholula", ubicacion: "Puebla" },
    { slug: "hacienda-real-del-monte", titulo: "Hacienda restaurada en Real del Monte", ubicacion: "Hidalgo" },
    { slug: "cabana-huasca", titulo: "Cabaña de montaña en Huasca de Ocampo", ubicacion: "Hidalgo" },
    { slug: "casa-mineral-del-chico", titulo: "Casa de piedra en Mineral del Chico", ubicacion: "Hidalgo" },
    { slug: "villa-tulum-selva", titulo: "Villa privada en la selva de Tulum", ubicacion: "Riviera Maya" },
    { slug: "depa-playa-carmen", titulo: "Departamento frente al mar en Playa del Carmen", ubicacion: "Riviera Maya" },
    { slug: "cabana-bacalar-laguna", titulo: "Cabaña sobre la Laguna de Bacalar", ubicacion: "Riviera Maya" },
  ];
  for (const h of hospedajes) {
    const geo = geoFor(h.slug, h.ubicacion);
    await actualizarListing(h.slug, {
      itinerario: itinerarioHospedaje(h),
      que_incluye: QUE_INCLUYE.hospedaje,
      cancelaciones: CANCELACIONES.hospedaje,
      dificultad: null,
      ...geo,
    });
  }

  console.log("Enriqueciendo eventos...");
  const eventos = [
    { slug: "capital-fest-2026", ubicacion: "CDMX", zonas: [{ nombre: "General", precio: 2800 }, { nombre: "VIP", precio: 5200 }, { nombre: "Palco", precio: 9800 }] },
    { slug: "feria-san-marcos-ficticia", ubicacion: "Aguascalientes", zonas: [{ nombre: "Entrada general", precio: 350 }] },
    { slug: "festival-gastronomico-oaxaca", ubicacion: "Oaxaca", zonas: [{ nombre: "Entrada general", precio: 600 }] },
    { slug: "festival-cultural-cholula", ubicacion: "Puebla", zonas: [{ nombre: "Entrada general", precio: 450 }] },
    { slug: "noche-de-museos-cdmx", ubicacion: "CDMX", zonas: [{ nombre: "Entrada general", precio: 200 }] },
    { slug: "festival-mezcal-oaxaca", ubicacion: "Oaxaca", zonas: [{ nombre: "Entrada general", precio: 700 }, { nombre: "Cata premium", precio: 1400 }] },
    { slug: "festival-globos-ficticio", ubicacion: "León", zonas: [{ nombre: "Entrada general", precio: 900 }] },
    { slug: "concierto-teotihuacan", ubicacion: "Estado de México", zonas: [{ nombre: "General", precio: 1500 }, { nombre: "Preferente", precio: 2600 }] },
  ];
  for (const e of eventos) {
    const geo = geoFor(e.slug, e.ubicacion);
    await actualizarListing(e.slug, {
      itinerario: itinerarioEvento(e),
      que_incluye: QUE_INCLUYE.evento,
      cancelaciones: CANCELACIONES.evento,
      dificultad: null,
      ...geo,
    });
  }

  console.log("Sembrando experiencias...");
  const experienciasUserId = await ensureUser(
    "experiencias@rutaru.demo",
    "operador",
    "Experiencias Rutaru"
  );
  const operadorExperiencias = await ensureOperador({
    userId: experienciasUserId,
    tipo: "tour",
    descripcion: "Experiencias y actividades únicas.",
    slug: "rutaru-experiencias",
  });
  for (const e of EXPERIENCIAS) {
    const id = await ensureExperienciaListing(operadorExperiencias, e);
    await seedDisponibilidad(id, rollingDates(10, 5), 12);
  }
  console.log(`Experiencias: ${EXPERIENCIAS.length}.`);

  console.log("Enriquecimiento de listings completo.");
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
