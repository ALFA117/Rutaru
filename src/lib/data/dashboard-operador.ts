import { createClient } from "@/lib/supabase/server";

export async function getOperadorDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: operador } = await supabase
    .from("operadores")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!operador) return null;

  const { data: listings } = await supabase
    .from("listings")
    .select("id, titulo, precio_b2c, tipo")
    .eq("operador_id", operador.id);

  const listingIds = (listings ?? []).map((l) => l.id);

  if (listingIds.length === 0) {
    return {
      operador,
      listings: [],
      ventas: [],
      totales: emptyTotales(),
      topListings: [],
      reservasProximas: [],
    };
  }

  const { data: ventas } = await supabase
    .from("orden_items")
    .select("cantidad, precio, listing_id, ordenes!inner(estado, created_at)")
    .in("listing_id", listingIds)
    .eq("ordenes.estado", "pagada");

  const { data: disponibilidad } = await supabase
    .from("disponibilidad")
    .select("cupo_disponible, listing_id")
    .in("listing_id", listingIds)
    .gte("fecha", new Date().toISOString().slice(0, 10));

  const totalVentas = (ventas ?? []).reduce(
    (acc, v) => acc + v.cantidad * v.precio,
    0
  );
  const totalReservas = (ventas ?? []).reduce((acc, v) => acc + v.cantidad, 0);
  const cupoDisponible = (disponibilidad ?? []).reduce(
    (acc, d) => acc + d.cupo_disponible,
    0
  );
  const ocupacionPct =
    cupoDisponible + totalReservas > 0
      ? Math.round((totalReservas / (cupoDisponible + totalReservas)) * 100)
      : 0;

  const ventasPorDia = new Map<string, number>();
  for (const v of ventas ?? []) {
    const fecha = (v.ordenes as unknown as { created_at: string }).created_at.slice(
      0,
      10
    );
    ventasPorDia.set(fecha, (ventasPorDia.get(fecha) ?? 0) + v.cantidad * v.precio);
  }
  const serieVentas = [...ventasPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, monto]) => ({ fecha, monto }));

  const ventasPorListing = new Map<string, number>();
  for (const v of ventas ?? []) {
    if (!v.listing_id) continue;
    ventasPorListing.set(
      v.listing_id,
      (ventasPorListing.get(v.listing_id) ?? 0) + v.cantidad
    );
  }
  const topListings = [...ventasPorListing.entries()]
    .map(([listingId, reservas]) => ({
      titulo:
        listings?.find((l) => l.id === listingId)?.titulo ?? "Listing",
      reservas,
    }))
    .sort((a, b) => b.reservas - a.reservas)
    .slice(0, 5);

  const { data: reservasProximas } = await supabase
    .from("orden_items")
    .select("id, cantidad, fecha_servicio, listings(titulo), ordenes!inner(estado, created_at)")
    .in("listing_id", listingIds)
    .not("fecha_servicio", "is", null)
    .gte("fecha_servicio", new Date().toISOString().slice(0, 10))
    .in("ordenes.estado", ["pagada", "confirmada", "completada"])
    .order("fecha_servicio", { ascending: true })
    .limit(10);

  return {
    operador,
    listings: listings ?? [],
    ventas: serieVentas,
    totales: {
      totalVentas,
      totalReservas,
      ocupacionPct,
      ticketPromedio: totalReservas > 0 ? Math.round(totalVentas / totalReservas) : 0,
    },
    topListings,
    reservasProximas: reservasProximas ?? [],
  };
}

function emptyTotales() {
  return { totalVentas: 0, totalReservas: 0, ocupacionPct: 0, ticketPromedio: 0 };
}
