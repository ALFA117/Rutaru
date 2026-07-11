export type MetodoPago = "tarjeta" | "spei" | "wallet";

/**
 * Pasarela "Pioneer Pay" sandbox/emulada (seccion 2 del spec). Un unico flujo
 * simplificado que siempre aprueba, pensado para el demo de Etapa 1 —
 * diseñado como modulo intercambiable para conectar Stripe/Openpay despues.
 */
export async function chargeSandbox(metodo: MetodoPago, montoMxn: number) {
  const referencia = `pioneer_${metodo}_${Date.now().toString(36)}`;
  return {
    estado: "aprobado" as const,
    referencia,
    metodo,
    montoMxn,
  };
}
