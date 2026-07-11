import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCartItems } from "@/lib/data/cart";
import { removeFromCartAction } from "@/lib/cart/actions";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function CarritoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getCartItems(user.id);
  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * (item.listings?.precio_b2c ?? 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-heading text-3xl">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 py-16">
          <p className="text-muted-foreground">Tu carrito está vacío.</p>
          <Button asChild>
            <Link href="/rutas">Explorar rutas</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{item.listings?.titulo}</p>
                <p className="text-sm text-muted-foreground">
                  Cantidad: {item.cantidad}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="tabular-nums font-medium">
                  {currency.format(
                    item.cantidad * (item.listings?.precio_b2c ?? 0)
                  )}
                </span>
                <form action={removeFromCartAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <Button variant="ghost" size="sm" type="submit">
                    Quitar
                  </Button>
                </form>
              </div>
            </div>
          ))}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-heading text-xl">Subtotal</span>
            <span className="font-heading text-xl tabular-nums">
              {currency.format(subtotal)}
            </span>
          </div>

          <Button asChild size="lg" className="mt-2">
            <Link href="/checkout">Ir a pagar</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
