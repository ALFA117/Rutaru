import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAgenciaDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: agencia } = await supabase
    .from("agencias")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!agencia) return null;

  const { data: paquetes } = await supabase
    .from("paquetes")
    .select("id, titulo, precio_total, markup_pct")
    .eq("agencia_id", agencia.id);

  const paqueteIds = (paquetes ?? []).map((p) => p.id);

  const margenesPorPaquete = (paquetes ?? []).map((p) => {
    const costoNeto = p.precio_total / (1 + p.markup_pct / 100);
    const margen = p.precio_total - costoNeto;
    return { titulo: p.titulo, margen: Math.round(margen) };
  });

  const { data: ordenesB2B } = await supabase
    .from("ordenes")
    .select("id, total, estado, created_at, orden_items(cantidad, listing_id, listings(titulo))")
    .eq("user_id", userId)
    .eq("tipo", "b2b")
    .order("created_at", { ascending: false });

  const allotments: {
    listingId: string;
    titulo: string;
    comprados: number;
    vendidosMercado: number;
  }[] = [];
  const cuposPorListing = new Map<string, { titulo: string; cantidad: number }>();
  for (const orden of ordenesB2B ?? []) {
    for (const item of orden.orden_items ?? []) {
      if (!item.listing_id) continue;
      const prev = cuposPorListing.get(item.listing_id);
      cuposPorListing.set(item.listing_id, {
        titulo: item.listings?.titulo ?? "Listing",
        cantidad: (prev?.cantidad ?? 0) + item.cantidad,
      });
    }
  }
  if (cuposPorListing.size > 0) {
    const listingIds = [...cuposPorListing.keys()];
    // Requiere leer ordenes/orden_items de otros usuarios (ventas de
    // mercado, no solo las propias) — RLS de Etapa 1 no le da esto a
    // agencia (correctamente, no deberia ver el detalle de ordenes
    // ajenas). Se usa el cliente admin solo para este conteo agregado
    // (nunca se expone que cliente compro que).
    const admin = createAdminClient();
    const { data: ventasMercado } = await admin
      .from("orden_items")
      .select("listing_id, cantidad, ordenes!inner(estado, tipo)")
      .in("listing_id", listingIds)
      .eq("ordenes.estado", "pagada")
      .eq("ordenes.tipo", "b2c");
    const vendidoPorListing = new Map<string, number>();
    for (const v of ventasMercado ?? []) {
      if (!v.listing_id) continue;
      vendidoPorListing.set(
        v.listing_id,
        (vendidoPorListing.get(v.listing_id) ?? 0) + v.cantidad
      );
    }
    for (const [listingId, info] of cuposPorListing.entries()) {
      allotments.push({
        listingId,
        titulo: info.titulo,
        comprados: info.cantidad,
        vendidosMercado: vendidoPorListing.get(listingId) ?? 0,
      });
    }
  }

  if (paqueteIds.length === 0) {
    return {
      agencia,
      paquetes: [],
      ventas: [],
      ordenes: [],
      margenesPorPaquete: [],
      ordenesB2B: ordenesB2B ?? [],
      allotments,
      totales: emptyTotales(),
    };
  }

  const { data: ventas } = await supabase
    .from("orden_items")
    .select(
      "cantidad, precio, paquete_id, orden_id, ordenes!inner(estado, created_at)"
    )
    .in("paquete_id", paqueteIds)
    .eq("ordenes.estado", "pagada");

  const totalVentas = (ventas ?? []).reduce(
    (acc, v) => acc + v.cantidad * v.precio,
    0
  );
  const totalOrdenes = new Set((ventas ?? []).map((v) => v.orden_id)).size;

  const ventasPorDia = new Map<string, number>();
  for (const v of ventas ?? []) {
    const fecha = (
      v.ordenes as unknown as { created_at: string }
    ).created_at.slice(0, 10);
    ventasPorDia.set(fecha, (ventasPorDia.get(fecha) ?? 0) + v.cantidad * v.precio);
  }
  const serieVentas = [...ventasPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));

  const ventasPorPaquete = new Map<string, number>();
  for (const v of ventas ?? []) {
    if (!v.paquete_id) continue;
    ventasPorPaquete.set(
      v.paquete_id,
      (ventasPorPaquete.get(v.paquete_id) ?? 0) + v.cantidad * v.precio
    );
  }
  const topPaquetes = [...ventasPorPaquete.entries()]
    .map(([paqueteId, monto]) => ({
      titulo: paquetes?.find((p) => p.id === paqueteId)?.titulo ?? "Paquete",
      monto,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5);

  return {
    agencia,
    paquetes: paquetes ?? [],
    ventas: serieVentas,
    topPaquetes,
    margenesPorPaquete,
    ordenesB2B: ordenesB2B ?? [],
    allotments,
    totales: {
      totalVentas,
      totalOrdenes,
      ticketPromedio: totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0,
    },
  };
}

function emptyTotales() {
  return { totalVentas: 0, totalOrdenes: 0, ticketPromedio: 0 };
}
