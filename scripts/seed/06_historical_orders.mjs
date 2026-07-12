// Etapa 5 (pulido) — ordenes historicas de los ultimos 6 meses, distribuidas
// entre TODAS las categorias del catalogo, para que los dashboards de admin
// (ventas por categoria, serie de tiempo) y el Data Marketplace tengan datos
// reales en los 3 rangos de fecha (7/30/90 dias) y no solo en "rutas".
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

// Distribucion realista pedida: 40% rutas, 20% hospedaje, 15% traslados,
// 15% eventos, 10% experiencias/paquetes (5% + 5%) sobre ~300 ordenes.
const TOTAL_ORDENES = 300;
const PLAN = {
  ruta: 0.4,
  hospedaje: 0.2,
  traslado: 0.15,
  evento: 0.15,
  experiencia: 0.05,
  paquete: 0.05,
};

const VENTANA_DIAS = 180;
const GARANTIZADOS_ULTIMOS_7_DIAS = 3; // por categoria, para que 7/30/90 dias siempre tengan las 6
const METODOS_PAGO = ["tarjeta", "spei", "wallet"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function fechaHace(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return d.toISOString();
}

function cantidadPara(tipo) {
  if (tipo === "hospedaje") return randomInt(1, 4); // noches
  if (tipo === "paquete") return 1;
  return Math.random() < 0.8 ? 1 : 2;
}

async function main() {
  const { data: yaExiste } = await admin
    .from("pagos")
    .select("id")
    .like("referencia", "seed-hist-%")
    .limit(1);
  if (yaExiste?.length) {
    console.log("-> ordenes historicas: ya existen, se omite (borra las filas con referencia LIKE 'seed-hist-%' para re-sembrar)");
    return;
  }

  const { data: listings, error: listingsError } = await admin
    .from("listings")
    .select("id, tipo, precio_b2c");
  if (listingsError) throw listingsError;

  const { data: paquetes, error: paquetesError } = await admin
    .from("paquetes")
    .select("id, precio_total");
  if (paquetesError) throw paquetesError;

  const { data: cliente, error: clienteError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", "cliente@rutaru.demo")
    .single();
  if (clienteError) throw clienteError;

  const listingsPorTipo = {};
  for (const l of listings ?? []) {
    (listingsPorTipo[l.tipo] ??= []).push(l);
  }

  for (const tipo of Object.keys(PLAN)) {
    if (tipo === "paquete") continue;
    if (!listingsPorTipo[tipo]?.length) {
      throw new Error(`No hay listings activos de tipo "${tipo}" para sembrar ordenes`);
    }
  }
  if (!paquetes?.length) throw new Error("No hay paquetes para sembrar ordenes");

  // Cuantas ordenes por categoria, ajustando el ultimo tipo para que sume exacto TOTAL_ORDENES.
  const tipos = Object.keys(PLAN);
  const conteos = {};
  let asignadas = 0;
  tipos.forEach((tipo, i) => {
    if (i === tipos.length - 1) {
      conteos[tipo] = TOTAL_ORDENES - asignadas;
    } else {
      conteos[tipo] = Math.round(TOTAL_ORDENES * PLAN[tipo]);
      asignadas += conteos[tipo];
    }
  });

  let creadas = 0;
  let errores = 0;

  for (const tipo of tipos) {
    const n = conteos[tipo];
    for (let i = 0; i < n; i++) {
      const dentroDeUltimos7 = i < GARANTIZADOS_ULTIMOS_7_DIAS;
      const diasAtras = dentroDeUltimos7
        ? randomInt(0, 6)
        : randomInt(0, VENTANA_DIAS - 1);
      const createdAt = fechaHace(diasAtras);

      let listingId = null;
      let paqueteId = null;
      let precioUnitario;

      if (tipo === "paquete") {
        const paquete = pick(paquetes);
        paqueteId = paquete.id;
        precioUnitario = Number(paquete.precio_total);
      } else {
        const listing = pick(listingsPorTipo[tipo]);
        listingId = listing.id;
        precioUnitario = Number(listing.precio_b2c);
      }

      const cantidad = cantidadPara(tipo);
      const subtotal = precioUnitario * cantidad;
      const total = subtotal;

      const { data: orden, error: ordenError } = await admin
        .from("ordenes")
        .insert({
          user_id: cliente.id,
          tipo: "b2c",
          subtotal,
          descuento: 0,
          total,
          estado: "pagada",
          metodo_pago: pick(METODOS_PAGO),
          created_at: createdAt,
          updated_at: createdAt,
        })
        .select("id")
        .single();

      if (ordenError || !orden) {
        console.error(`orden ${tipo} #${i}: ${ordenError?.message}`);
        errores += 1;
        continue;
      }

      const { error: itemError } = await admin.from("orden_items").insert({
        orden_id: orden.id,
        listing_id: listingId,
        paquete_id: paqueteId,
        cantidad,
        precio: precioUnitario,
        created_at: createdAt,
      });
      if (itemError) {
        console.error(`orden_item ${tipo} #${i}: ${itemError.message}`);
        errores += 1;
        continue;
      }

      const { error: pagoError } = await admin.from("pagos").insert({
        orden_id: orden.id,
        pasarela: "pioneer_sandbox",
        referencia: `seed-hist-${orden.id.slice(0, 8)}`,
        estado: "aprobado",
        created_at: createdAt,
        updated_at: createdAt,
      });
      if (pagoError) {
        console.error(`pago ${tipo} #${i}: ${pagoError.message}`);
        errores += 1;
        continue;
      }

      creadas += 1;
    }
    console.log(`-> ${tipo}: ${n} ordenes sembradas`);
  }

  console.log(`\nTotal creadas: ${creadas}/${TOTAL_ORDENES} (errores: ${errores})`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
