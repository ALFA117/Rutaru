"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function CheckoutForm() {
  const router = useRouter();
  const [codigoAfiliado, setCodigoAfiliado] = useState("");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigoAfiliado, metodoPago }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar el pago");
      setLoading(false);
      return;
    }

    router.push(`/checkout/confirmacion/${data.ordenId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="codigo">Código de afiliado (opcional)</Label>
        <Input
          id="codigo"
          placeholder="Ej. RUTA10"
          value={codigoAfiliado}
          onChange={(e) => setCodigoAfiliado(e.target.value.toUpperCase())}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Método de pago — Pioneer Pay (sandbox)</Label>
        <Tabs value={metodoPago} onValueChange={setMetodoPago}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tarjeta">Tarjeta</TabsTrigger>
            <TabsTrigger value="spei">SPEI</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="tarjeta" className="text-sm text-muted-foreground">
            Simulación de pago con tarjeta — sandbox, sin datos reales.
          </TabsContent>
          <TabsContent value="spei" className="text-sm text-muted-foreground">
            Simulación de transferencia SPEI — sandbox, sin datos reales.
          </TabsContent>
          <TabsContent value="wallet" className="text-sm text-muted-foreground">
            Simulación de pago con wallet — sandbox, sin datos reales.
          </TabsContent>
        </Tabs>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Procesando…" : "Pagar"}
      </Button>
    </form>
  );
}
