-- Etapa 4 (Plan B - Blockchain) — columnas necesarias para ligar los 3
-- contratos desplegados en Sepolia con los datos de negocio en Supabase.
-- Las politicas RLS existentes de UPDATE (dueno propio o admin) en
-- profiles/afiliados/operadores ya cubren estas columnas nuevas porque
-- RLS filtra filas, no columnas (mismo patron documentado en Etapa 3).

alter table public.afiliados
  add column wallet_address text;

alter table public.operadores
  add column wallet_address text;

alter table public.comisiones_afiliado
  add column tx_hash text;

alter table public.profiles
  add column consentimiento_hash text,
  add column consentimiento_tx_hash text;
