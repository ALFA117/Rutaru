import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCartItems, clearCart } from "@/lib/data/cart";
import { chargeSandbox, type MetodoPago } from "@/lib/pioneer-pay/sandbox";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const codigoAfiliado = String(body.codigoAfiliado ?? "").trim();
  const metodoPago = (body.metodoPago as MetodoPago) ?? "tarjeta";

  const items = await getCartItems(user.id);
  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * (item.listings?.precio_b2c ?? 0),
    0
  );

  let descuentoPct = 0;
  let afiliadoId: string | null = null;
  let afiliadoComisionPct = 0;

  if (codigoAfiliado) {
    // afiliados no tiene lectura publica/autenticada por RLS; validacion
    // server-only via cliente admin (mismo patron que /a/[codigo]).
    const admin = createAdminClient();
    const { data: afiliado } = await admin
      .from("afiliados")
      .select("id, codigo_5, codigo_10, comision_pct")
      .or(`codigo_5.eq.${codigoAfiliado},codigo_10.eq.${codigoAfiliado}`)
      .maybeSingle();

    if (afiliado) {
      afiliadoId = afiliado.id;
      afiliadoComisionPct = afiliado.comision_pct;
      descuentoPct = afiliado.codigo_10 === codigoAfiliado ? 10 : 5;
    }
  }

  const descuento = Math.round(subtotal * (descuentoPct / 100));
  const total = subtotal - descuento;

  const cargo = await chargeSandbox(metodoPago, total);

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .insert({
      user_id: user.id,
      tipo: "b2c",
      subtotal,
      descuento,
      codigo_afiliado: codigoAfiliado || null,
      total,
      estado: "pagada",
      metodo_pago: metodoPago,
    })
    .select("id")
    .single();

  if (ordenError || !orden) {
    return NextResponse.json(
      { error: ordenError?.message ?? "No se pudo crear la orden" },
      { status: 500 }
    );
  }

  const ordenItems = items.map((item) => ({
    orden_id: orden.id,
    listing_id: item.listing_id,
    cantidad: item.cantidad,
    precio: item.listings?.precio_b2c ?? 0,
  }));

  const { error: itemsError } = await supabase
    .from("orden_items")
    .insert(ordenItems);
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: pagoError } = await supabase.from("pagos").insert({
    orden_id: orden.id,
    pasarela: "pioneer_sandbox",
    referencia: cargo.referencia,
    estado: "aprobado",
  });
  if (pagoError) {
    return NextResponse.json({ error: pagoError.message }, { status: 500 });
  }

  if (afiliadoId) {
    const monto = Math.round(total * (afiliadoComisionPct / 100));
    await supabase.from("comisiones_afiliado").insert({
      afiliado_id: afiliadoId,
      orden_id: orden.id,
      monto,
      estado: "pendiente",
    });
  }

  await clearCart(user.id);

  return NextResponse.json({ ordenId: orden.id });
}
