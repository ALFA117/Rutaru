import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCartItems, cartItemPrice, cartItemTitle } from "@/lib/data/cart";
import { CheckoutForm } from "./checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FALLBACK_WALLET } from "@/lib/blockchain/config";
import { formatCurrency } from "@/lib/format";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getCartItems(user.id);
  if (items.length === 0) redirect("/carrito");

  const { data: profile } = await supabase
    .from("profiles")
    .select("consiente_datos_agregados")
    .eq("id", user.id)
    .single();

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * cartItemPrice(item),
    0
  );

  // Simplificacion de demo: el escrow on-chain solo soporta una wallet
  // receptora por reserva, asi que se usa el operador del primer item del
  // carrito (o la wallet del backend si el operador no configuro la suya).
  const operadorWallet = items[0]?.listings?.operadores?.wallet_address ?? FALLBACK_WALLET;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="mb-6 font-heading text-3xl">Checkout</h1>
        <CheckoutForm operadorWallet={operadorWallet} />
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Tu orden</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {cartItemTitle(item)} × {item.cantidad}
              </span>
              <span className="tabular-nums">
                {formatCurrency(item.cantidad * cartItemPrice(item))}
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-heading text-lg">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            El descuento del código de afiliado se aplica al confirmar el pago.
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.consiente_datos_agregados ? (
              <>
                Tu actividad en Rutaru se usa de forma agregada y anónima para
                nuestro Data Marketplace.
              </>
            ) : (
              <>
                No compartes tus datos de forma agregada — tu compra igual se
                procesa con normalidad.
              </>
            )}{" "}
            <Link href="/cliente" className="underline">
              Administra esto en tu cuenta
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
