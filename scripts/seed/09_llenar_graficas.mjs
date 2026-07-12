// Pulido pre-pitch: las graficas del dashboard admin (funnel, heatmap de
// actividad, top afiliados) se veian muy vacias -- events_tracking solo
// tenia 318 filas reales (generadas organicamente durante pruebas), y
// comisiones_afiliado solo 7 (unique por orden_id, asi que no se puede
// duplicar sobre las mismas ordenes). Este script agrega volumen sintetico
// realista, no reemplaza nada existente.
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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Mas trafico en horas de comida/tarde-noche, casi nada de madrugada --
// asi el heatmap se ve como el de un sitio real en vez de ruido uniforme.
const PESO_HORA = [
  1, 1, 1, 1, 1, 2, 3, 5, 7, 8, 9, 10, 12, 11, 9, 8, 9, 11, 13, 14, 12, 9, 6, 3,
];
function horaAzar() {
  const total = PESO_HORA.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let h = 0; h < 24; h++) {
    r -= PESO_HORA[h];
    if (r <= 0) return h;
  }
  return 12;
}

function fechaAzarUltimos(dias) {
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - dias);
  const t = desde.getTime() + Math.random() * (hoy.getTime() - desde.getTime());
  const d = new Date(t);
  d.setHours(horaAzar(), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
  return d;
}

// Fecha de viaje futura (para el metadata.fecha de add_to_cart, no el
// timestamp del evento en si).
function fechaViajeFutura() {
  const hoy = new Date();
  const dias = 1 + Math.floor(Math.random() * 45);
  const d = new Date(hoy);
  d.setDate(hoy.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const DISPOSITIVOS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0",
];
const CIUDADES = ["CDMX", "Puebla", "Guadalajara", "Monterrey", "Oaxaca", "Querétaro", null, null];

const { data: listings } = await admin.from("listings").select("id, slug, tipo").eq("activo", true);
const { data: perfiles } = await admin.from("profiles").select("id");
const TIPOS = ["ruta", "hospedaje", "traslado", "evento", "experiencia"];

console.log(`Catalogo: ${listings.length} listings, ${perfiles.length} perfiles.`);

// ---- 1) events_tracking: 2500 eventos sinteticos en los ultimos 60 dias ----
const TOTAL_EVENTOS = 2500;
const filas = [];
for (let i = 0; i < TOTAL_EVENTOS; i++) {
  const r = Math.random();
  const sessionId = crypto.randomUUID();
  const userId = Math.random() < 0.55 ? pick(perfiles).id : null; // ~45% anonimo, como trafico real
  const dispositivo = pick(DISPOSITIVOS);
  const ciudad = pick(CIUDADES);
  const createdAt = fechaAzarUltimos(60).toISOString();

  let tipoEvento;
  let entidad;
  let metadata = {};

  if (r < 0.55) {
    tipoEvento = "page_view";
    const listing = pick(listings);
    entidad = listing.slug;
    metadata = { tipo: listing.tipo };
  } else if (r < 0.75) {
    tipoEvento = "search";
    entidad = pick(TIPOS);
    metadata = { destino: pick(CIUDADES.filter(Boolean)) };
  } else if (r < 0.85) {
    // "click" real solo se genera en /a/[codigo] (redirect de referido) con
    // entidad=codigo de afiliado -- el dashboard de afiliado filtra por eso.
    tipoEvento = "click";
    entidad = pick(["RUTA5", "RUTA10", "VIAJA5", "VIAJA10"]);
    metadata = { valido: true };
  } else if (r < 0.95) {
    tipoEvento = "add_to_cart";
    const listing = pick(listings);
    entidad = listing.id;
    metadata = { fecha: fechaViajeFutura(), cantidad: 1 + Math.floor(Math.random() * 2) };
  } else if (r < 0.98) {
    tipoEvento = "code_applied";
    entidad = pick(["RUTA5", "RUTA10", "VIAJA5", "VIAJA10"]);
  } else {
    tipoEvento = "purchase";
    entidad = crypto.randomUUID();
    metadata = { tipo: pick(TIPOS), total: 500 + Math.floor(Math.random() * 7000) };
  }

  filas.push({
    user_id: userId,
    session_id: sessionId,
    tipo_evento: tipoEvento,
    entidad,
    metadata,
    dispositivo,
    ciudad,
    created_at: createdAt,
  });
}

let insertados = 0;
for (let i = 0; i < filas.length; i += 500) {
  const lote = filas.slice(i, i + 500);
  const { error } = await admin.from("events_tracking").insert(lote);
  if (error) throw new Error(`events_tracking lote ${i}: ${error.message}`);
  insertados += lote.length;
}
console.log(`events_tracking: ${insertados} filas insertadas.`);

// ---- 2) comisiones_afiliado: atribuir mas ordenes pagadas existentes ----
const { data: afiliados } = await admin.from("afiliados").select("id, comision_pct");
const { data: ordenesPagadas } = await admin
  .from("ordenes")
  .select("id, total, created_at")
  .eq("estado", "pagada");
const { data: comisionesExistentes } = await admin.from("comisiones_afiliado").select("orden_id");
const yaAtribuidas = new Set((comisionesExistentes ?? []).map((c) => c.orden_id));

const candidatas = (ordenesPagadas ?? []).filter((o) => !yaAtribuidas.has(o.id));
const aAtribuir = candidatas
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(60, Math.floor(candidatas.length * 0.45)));

const nuevasComisiones = aAtribuir.map((orden) => {
  const afiliado = pick(afiliados);
  const pct = Number(afiliado.comision_pct) / 100;
  return {
    afiliado_id: afiliado.id,
    orden_id: orden.id,
    monto: Math.round(orden.total * pct * 100) / 100,
    estado: Math.random() < 0.6 ? "pagada" : "pendiente",
    created_at: orden.created_at,
  };
});

if (nuevasComisiones.length > 0) {
  const { error } = await admin.from("comisiones_afiliado").insert(nuevasComisiones);
  if (error) throw new Error(`comisiones_afiliado: ${error.message}`);
}
console.log(`comisiones_afiliado: ${nuevasComisiones.length} filas nuevas (de ${candidatas.length} ordenes candidatas).`);

console.log("Listo.");
