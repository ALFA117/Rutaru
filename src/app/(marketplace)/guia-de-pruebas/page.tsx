import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_USERS, DEMO_PASSWORD } from "@/lib/auth/demo-users";

type Paso = { texto: string; href?: string };

const FLUJOS: { role: string; email: string; resumen: string; pasos: Paso[] }[] = [
  {
    role: "Cliente",
    email: "cliente@rutaru.demo",
    resumen: "Comprar con código de afiliado y ver el historial de viajes.",
    pasos: [
      { texto: "Entra a /rutas y elige cualquier ruta", href: "/rutas" },
      { texto: "Agrégala al carrito", href: "/carrito" },
      {
        texto: "En /checkout, aplica el código de afiliado RUTA10 (10% de descuento)",
        href: "/checkout",
      },
      { texto: "Paga con Pioneer Pay (sandbox, siempre aprueba)" },
      {
        texto: "Revisa la confirmación con folio y el historial en /cliente (Mis viajes)",
        href: "/cliente",
      },
    ],
  },
  {
    role: "Agencia",
    email: "agencia@rutaru.demo",
    resumen: "Comprar un allotment B2B y armar un paquete cross-categoría.",
    pasos: [
      {
        texto: "Revisa el catálogo B2B con tarifa neta en /agencia/catalogo",
        href: "/agencia/catalogo",
      },
      {
        texto: "Compra un allotment (cupos con descuento por volumen) en /agencia/comprar",
        href: "/agencia/comprar",
      },
      {
        texto: "Arma un paquete combinando traslado + hotel + tour + evento en /agencia/paquetes/nuevo",
        href: "/agencia/paquetes/nuevo",
      },
      {
        texto: "Revisa márgenes y órdenes en el dashboard /agencia",
        href: "/agencia",
      },
    ],
  },
  {
    role: "Operador",
    email: "operador@rutaru.demo",
    resumen: "Ver reservas, ventas y ocupación de su inventario.",
    pasos: [
      {
        texto: "Dashboard /operador: ventas totales, reservas, ticket promedio, ocupación, top listings",
        href: "/operador",
      },
    ],
  },
  {
    role: "Afiliado",
    email: "afiliado@rutaru.demo",
    resumen: "Ver clics, conversiones y comisiones generadas por su código.",
    pasos: [
      {
        texto: "Dashboard /afiliado: clics, tasa de conversión, ventas atribuidas, comisiones pendientes/pagadas",
        href: "/afiliado",
      },
      { texto: "Regenerar código o solicitar pago de comisiones desde el mismo panel" },
    ],
  },
  {
    role: "Admin",
    email: "admin@rutaru.demo",
    resumen: "Ver insights con IA y el Data Marketplace.",
    pasos: [
      {
        texto: "Dashboard /admin: funnel de conversión, ventas por categoría/destino, top afiliados, insights con Gemini",
        href: "/admin",
      },
      {
        texto: "Data Marketplace interno en /admin/datos (armar/exportar paquetes de datos)",
        href: "/admin/datos",
      },
      {
        texto: "Página pública del Data Marketplace en /datos",
        href: "/datos",
      },
    ],
  },
];

export default function GuiaDePruebasPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="mb-2 font-heading text-3xl">Guía de pruebas</h1>
      <p className="mb-10 text-muted-foreground">
        Recorrido sugerido para probar Rutaru con cada uno de los 5 roles.
        Entra desde <Link href="/login" className="underline">/login</Link>{" "}
        con un clic usando el panel de cuentas demo (contraseña{" "}
        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
          {DEMO_PASSWORD}
        </code>{" "}
        para las 5).
      </p>

      <div className="flex flex-col gap-8">
        {FLUJOS.map((flujo) => {
          const demo = DEMO_USERS.find((u) => u.email === flujo.email);
          return (
            <Card key={flujo.email}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="font-heading text-xl">
                    {flujo.role}
                  </CardTitle>
                  {demo && <Badge variant="secondary">{demo.email}</Badge>}
                </div>
                <CardDescription>{flujo.resumen}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-2 text-sm">
                  {flujo.pasos.map((paso, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      {paso.href ? (
                        <Link href={paso.href} className="underline">
                          {paso.texto}
                        </Link>
                      ) : (
                        <span>{paso.texto}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
