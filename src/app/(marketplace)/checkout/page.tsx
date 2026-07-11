import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCartItems } from "@/lib/data/cart";
import { CheckoutForm } from "./checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getCartItems(user.id);
  if (items.length === 0) redirect("/carrito");

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * (item.listings?.precio_b2c ?? 0),
    0
  );

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="mb-6 font-heading text-3xl">Checkout</h1>
        <CheckoutForm />
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Tu orden</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.listings?.titulo} × {item.cantidad}
              </span>
              <span className="tabular-nums">
                {currency.format(item.cantidad * (item.listings?.precio_b2c ?? 0))}
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-heading text-lg">
            <span>Subtotal</span>
            <span className="tabular-nums">{currency.format(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            El descuento del código de afiliado se aplica al confirmar el pago.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
