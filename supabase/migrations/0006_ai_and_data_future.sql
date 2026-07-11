-- Etapa 1 / Bloque 2 — esquema completo para etapas futuras (sin uso aun en Etapa 1)
-- ai_insights y data_packages: Etapa 2/3. nft_tickets: Etapa 4 (Plan B blockchain).

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titulo text not null,
  resumen text,
  data jsonb not null default '{}'::jsonb,
  generado_por text not null default 'claude',
  periodo text,
  created_at timestamptz not null default now()
);

create table public.data_packages (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  precio numeric(12, 2) not null,
  preview jsonb not null default '{}'::jsonb,
  dataset_url text,
  comprador_empresa text,
  estado public.data_package_estado not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nft_tickets (
  id uuid primary key default gen_random_uuid(),
  orden_item_id uuid not null unique references public.orden_items (id) on delete cascade,
  contract_address text,
  token_id bigint,
  tx_hash text,
  wallet text,
  created_at timestamptz not null default now()
);
