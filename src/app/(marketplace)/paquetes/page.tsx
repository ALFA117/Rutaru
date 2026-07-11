import { getPaquetes } from "@/lib/data/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function PaquetesPage() {
  const paquetes = await getPaquetes();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-heading text-3xl">Paquetes de Agencia</h1>

      {paquetes.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Aún no hay paquetes publicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {p.agencias?.razon_social}
                </Badge>
                <CardTitle className="font-heading text-xl">
                  {p.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {currency.format(p.precio_total)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(p.componentes) ? p.componentes.length : 0}{" "}
                  componentes incluidos
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
