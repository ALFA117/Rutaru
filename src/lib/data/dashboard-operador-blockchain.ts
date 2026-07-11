import { createClient } from "@/lib/supabase/server";

export async function getReservasBlockchainPendientes(operadorId: string) {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("operador_id", operadorId);
  const listingIds = (listings ?? []).map((l) => l.id);
  if (listingIds.length === 0) return [];

  const { data: ordenItems } = await supabase
    .from("orden_items")
    .select(
      "orden_id, listings(titulo), ordenes!inner(id, estado, reserva_id_blockchain, tx_hash_blockchain, created_at)"
    )
    .in("listing_id", listingIds)
    .eq("ordenes.estado", "confirmada")
    .not("ordenes.reserva_id_blockchain", "is", null);

  const porOrden = new Map<
    string,
    {
      ordenId: string;
      reservaId: number;
      txHash: string;
      createdAt: string;
      listings: string[];
    }
  >();

  for (const item of ordenItems ?? []) {
    const orden = item.ordenes as unknown as {
      id: string;
      reserva_id_blockchain: number;
      tx_hash_blockchain: string;
      created_at: string;
    };
    const existing = porOrden.get(orden.id);
    if (existing) {
      existing.listings.push(item.listings?.titulo ?? "");
    } else {
      porOrden.set(orden.id, {
        ordenId: orden.id,
        reservaId: orden.reserva_id_blockchain,
        txHash: orden.tx_hash_blockchain,
        createdAt: orden.created_at,
        listings: [item.listings?.titulo ?? ""],
      });
    }
  }

  return [...porOrden.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
