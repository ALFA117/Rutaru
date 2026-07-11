import { requireRole } from "@/lib/auth/guards";
import { getCatalogoB2B } from "@/lib/data/catalogo-b2b";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function CatalogoB2BPage() {
  await requireRole("agencia");
  const catalogo = await getCatalogoB2B();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-heading text-3xl">Catálogo B2B</h1>
      <p className="mb-8 text-muted-foreground">
        Tarifa neta y margen potencial por listing. Esta información es
        exclusiva para agencias — no la ven clientes ni afiliados.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio público</TableHead>
              <TableHead className="text-right">Tarifa neta</TableHead>
              <TableHead className="text-right">Margen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogo.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.titulo}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {l.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {currency.format(l.precio_b2c)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {currency.format(l.precio_neto_b2b)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-accent">
                  {currency.format(l.margen)} ({l.margenPct}%)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
