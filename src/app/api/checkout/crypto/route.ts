import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCartItems, clearCart, cartItemPrice } from "@/lib/data/cart";
import { track } from "@/lib/tracking/track";
import {
  verificarReservaCreada,
  mintTicket,
  pagarComision,
} from "@/lib/blockchain/provider";
import { COMISION_MONTO_ETH } from "@/lib/blockchain/config";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const ordenId = String(body.ordenId ?? "");
  const txHash = String(body.txHash ?? "");
  const walletCliente = String(body.walletCliente ?? "");
  const codigoAfiliado = String(body.codigoAfiliado ?? "").trim();

  if (!ordenId || !txHash || !walletCliente) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const items = await getCartItems(user.id);
  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  let reserva;
  try {
    reserva = await verificarReservaCreada(txHash);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo verificar la transacción" },
      { status: 400 }
    );
  }

  if (reserva.folio !== ordenId) {
    return NextResponse.json({ error: "El folio on-chain no coincide" }, { status: 400 });
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * cartItemPrice(item),
    0
  );

  const admin = createAdminClient();

  let descuentoPct = 0;
  let afiliadoId: string | null = null;
  let afiliadoComisionPct = 0;
  let afiliadoWallet: string | null = null;

  if (codigoAfiliado) {
    const { data: afiliado } = await admin
      .from("afiliados")
      .select("id, codigo_5, codigo_10, comision_pct, wallet_address")
      .or(`codigo_5.eq.${codigoAfiliado},codigo_10.eq.${codigoAfiliado}`)
      .maybeSingle();

    if (afiliado) {
      afiliadoId = afiliado.id;
      afiliadoComisionPct = afiliado.comision_pct;
      afiliadoWallet = afiliado.wallet_address;
      descuentoPct = afiliado.codigo_10 === codigoAfiliado ? 10 : 5;
      await track({ tipoEvento: "code_applied", entidad: codigoAfiliado });
    }
  }

  const descuento = Math.round(subtotal * (descuentoPct / 100));
  const total = subtotal - descuento;

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .insert({
      id: ordenId,
      user_id: user.id,
      tipo: "b2c",
      subtotal,
      descuento,
      codigo_afiliado: codigoAfiliado || null,
      total,
      estado: "confirmada",
      metodo_pago: "cripto_sepolia",
      tx_hash_blockchain: txHash,
      reserva_id_blockchain: Number(reserva.reservaId),
    })
    .select("id")
    .single();

  if (ordenError || !orden) {
    return NextResponse.json(
      { error: ordenError?.message ?? "No se pudo crear la orden" },
      { status: 500 }
    );
  }

  const ordenItemsInsert = items.map((item) => ({
    orden_id: orden.id,
    listing_id: item.listing_id,
    paquete_id: item.paquete_id,
    cantidad: item.cantidad,
    precio: cartItemPrice(item),
  }));

  const { data: ordenItems, error: itemsError } = await supabase
    .from("orden_items")
    .insert(ordenItemsInsert)
    .select("id, listing_id, listings(titulo, tipo)");
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  await supabase.from("pagos").insert({
    orden_id: orden.id,
    pasarela: "sepolia_testnet",
    referencia: txHash,
    estado: "aprobado",
  });

  for (const item of ordenItems ?? []) {
    const metadata = {
      name: `Rutaru ticket — ${item.listings?.titulo ?? "reserva"}`,
      description: `Folio ${ordenId}`,
      attributes: [
        { trait_type: "folio", value: ordenId },
        { trait_type: "listing", value: item.listings?.titulo ?? "" },
        { trait_type: "tipo", value: item.listings?.tipo ?? "" },
      ],
    };
    const metadataURI = `data:application/json;base64,${Buffer.from(
      JSON.stringify(metadata)
    ).toString("base64")}`;

    try {
      const minted = await mintTicket(walletCliente, ordenId, metadataURI);
      await admin.from("nft_tickets").insert({
        orden_item_id: item.id,
        contract_address: minted.contractAddress,
        token_id: Number(minted.tokenId),
        tx_hash: minted.txHash,
        wallet: walletCliente,
      });
    } catch (error) {
      console.error("Error minteando NFT ticket:", error);
    }
  }

  if (afiliadoId && afiliadoWallet) {
    try {
      const { txHash: comisionTxHash } = await pagarComision(
        afiliadoWallet,
        ordenId,
        COMISION_MONTO_ETH
      );
      const montoComision = Math.round(total * (afiliadoComisionPct / 100));
      await admin.from("comisiones_afiliado").insert({
        afiliado_id: afiliadoId,
        orden_id: orden.id,
        monto: montoComision,
        estado: "pagada",
        tx_hash: comisionTxHash,
      });
    } catch (error) {
      console.error("Error pagando comisión on-chain:", error);
    }
  } else if (afiliadoId) {
    await admin.from("comisiones_afiliado").insert({
      afiliado_id: afiliadoId,
      orden_id: orden.id,
      monto: Math.round(total * (afiliadoComisionPct / 100)),
      estado: "pendiente",
    });
  }

  await clearCart(user.id);

  await track({
    tipoEvento: "purchase",
    entidad: orden.id,
    metadata: { total, tipo: "b2c", metodoPago: "cripto_sepolia" },
  });

  return NextResponse.json({ ordenId: orden.id });
}
