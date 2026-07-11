-- Etapa 2 / Bloque 8 — modulo de afiliados completo: solicitud de pago
-- de comisiones. Un timestamp simple por afiliado (solicita el pago de
-- todo su saldo pendiente); el flujo de pago real (marcar comisiones
-- como 'pagada') queda para herramientas de admin en una etapa futura.

alter table public.afiliados
  add column pago_solicitado_at timestamptz;
