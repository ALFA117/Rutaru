-- Etapa 1 / Bloque 2 — inventario: listings, disponibilidad, paquetes

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operadores (id) on delete cascade,
  tipo public.listing_tipo not null,
  titulo text not null,
  slug text not null unique,
  descripcion text,
  itinerario jsonb not null default '[]'::jsonb,
  precio_b2c numeric(12, 2) not null,
  precio_neto_b2b numeric(12, 2),
  moneda text not null default 'MXN',
  duracion text,
  ubicacion text,
  lat double precision,
  lng double precision,
  imagenes text[] not null default '{}',
  cupo integer,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disponibilidad (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  fecha date not null,
  cupo_disponible integer not null,
  precio_override numeric(12, 2),
  created_at timestamptz not null default now(),
  unique (listing_id, fecha)
);

create table public.paquetes (
  id uuid primary key default gen_random_uuid(),
  agencia_id uuid not null references public.agencias (id) on delete cascade,
  titulo text not null,
  componentes jsonb not null default '[]'::jsonb,
  precio_total numeric(12, 2) not null,
  markup_pct numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_operador_id_idx on public.listings (operador_id);
create index listings_tipo_idx on public.listings (tipo);
create index disponibilidad_listing_id_idx on public.disponibilidad (listing_id);
create index paquetes_agencia_id_idx on public.paquetes (agencia_id);
