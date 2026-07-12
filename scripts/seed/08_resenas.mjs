import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NOMBRES = [
  "María Fernanda López",
  "José Luis Hernández",
  "Guadalupe Ramírez",
  "Carlos Alberto Torres",
  "Ana Sofía Martínez",
  "Jesús Gómez",
  "Diana Laura Flores",
  "Ricardo Sánchez",
  "Itzel Morales",
  "Alejandro Cruz",
  "Mónica Reyes",
  "Fernando Jiménez",
  "Paola Castillo",
  "Emiliano Vázquez",
  "Karla Domínguez",
  "Rodrigo Ortiz",
  "Ximena Guerrero",
  "Luis Enrique Mendoza",
  "Valeria Aguilar",
  "Miguel Ángel Rojas",
];

const COMENTARIOS = {
  ruta: [
    "El guía sabía muchísimo, se sintió como clase de historia pero divertida.",
    "El recorrido va bastante rápido en algunas partes, pero valió cada peso.",
    "Nos recogieron puntual y el itinerario se cumplió tal cual lo prometían.",
    "Un poco de calor a medio día, pero las paradas para sombra ayudan.",
    "La comida incluida estuvo mejor de lo que esperaba, repetiría sin dudar.",
    "Grupo pequeño, se sintió personalizado y no como tour masivo.",
  ],
  hospedaje: [
    "Muy limpio y tal cual las fotos, el checkin fue súper fácil.",
    "Ubicación excelente, a pie de todo lo importante de la zona.",
    "El anfitrión respondió rápido cuando tuvimos dudas del acceso.",
    "Cama cómoda y silencioso pese a estar cerca del centro.",
    "Faltó un poco de agua caliente la primera noche, luego se resolvió.",
    "Perfecto para pareja, la terraza fue lo mejor de la estancia.",
  ],
  traslado: [
    "Conductor puntual y la van iba impecable, viaje tranquilo.",
    "Buena comunicación por WhatsApp antes de recogernos en el aeropuerto.",
    "El compartido tardó un poco más por las otras paradas, pero cumplió.",
    "Precio justo comparado con lo que cobran afuera de la terminal.",
    "Todo en orden, el chofer conocía bien las rutas y evitó tráfico.",
    "Unidad cómoda, buen aire acondicionado para el trayecto largo.",
  ],
  evento: [
    "Buen ambiente, la logística de acceso fue más rápida de lo que esperaba.",
    "El lineup valió la pena, aunque el sonido en la zona trasera fallaba un poco.",
    "Compraría boleto de nuevo el próximo año, muy bien organizado.",
    "Faltaron más opciones de comida, pero el evento en sí estuvo genial.",
    "Excelente para ir en grupo, encontramos lugar sin problema.",
    "El horario se respetó y el cierre no se alargó de más.",
  ],
  experiencia: [
    "Actividad muy bien explicada, el instructor tuvo mucha paciencia.",
    "Ideal si vas primera vez, no necesitas experiencia previa.",
    "Duró un poco menos de lo anunciado pero la calidad compensó.",
    "Nos regalaron tips que no esperábamos, se nota que conocen el oficio.",
    "Grupo reducido, se sintió muy personal la experiencia completa.",
    "Un poco caro para lo que dura, pero la calidad es innegable.",
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fechaAzarUltimos4Meses() {
  const hoy = new Date();
  const hace4Meses = new Date(hoy);
  hace4Meses.setMonth(hoy.getMonth() - 4);
  const t = hace4Meses.getTime() + Math.random() * (hoy.getTime() - hace4Meses.getTime());
  return new Date(t).toISOString();
}

function ratingAzar() {
  // Mayoria 4-5, ocasional 3 (~15%).
  const r = Math.random();
  if (r < 0.15) return 3;
  return Math.random() < 0.5 ? 4 : 5;
}

const { data: perfiles, error: errPerfiles } = await admin.from("profiles").select("id");
if (errPerfiles) throw errPerfiles;
const perfilIds = perfiles.map((p) => p.id);

const { data: listings, error: errListings } = await admin
  .from("listings")
  .select("id, slug, tipo");
if (errListings) throw errListings;

const { data: existentes, error: errExistentes } = await admin
  .from("resenas")
  .select("listing_id");
if (errExistentes) throw errExistentes;
const conResenas = new Set(existentes.map((r) => r.listing_id));

let totalInsertadas = 0;
let listingsSembrados = 0;

for (const listing of listings) {
  if (conResenas.has(listing.id)) continue; // idempotente: no duplicar en re-runs

  const n = 3 + Math.floor(Math.random() * 4); // 3-6
  const usuarios = shuffle(perfilIds).slice(0, n);
  const nombres = shuffle(NOMBRES).slice(0, n);
  const comentarios = shuffle(COMENTARIOS[listing.tipo] ?? COMENTARIOS.ruta).slice(0, n);

  const filas = usuarios.map((user_id, i) => ({
    listing_id: listing.id,
    user_id,
    rating: ratingAzar(),
    comentario: comentarios[i % comentarios.length],
    autor_nombre: nombres[i],
    created_at: fechaAzarUltimos4Meses(),
  }));

  const { error } = await admin.from("resenas").insert(filas);
  if (error) {
    console.error(`ERROR ${listing.slug}: ${error.message}`);
    continue;
  }
  totalInsertadas += filas.length;
  listingsSembrados++;
}

console.log(`Reseñas insertadas: ${totalInsertadas} en ${listingsSembrados} listings.`);
console.log(`Listings ya tenían reseñas (omitidos): ${conResenas.size}`);
