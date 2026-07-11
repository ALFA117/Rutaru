-- Etapa 1 / Bloque 2 — comercio: carritos, ordenes, pagos, comisiones

create table public.carritos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carrito_items (
  id uuid primary key default gen_random_uuid(),
  carrito_id uuid not null references public.carritos (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  cantidad integer not null default 1 check (cantidad > 0),
  created_at timestamptz not null default now()
);

create table public.ordenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  tipo public.orden_tipo not null default 'b2c',
  subtotal numeric(12, 2) not null,
  descuento numeric(12, 2) not null default 0,
  codigo_afiliado text,
  total numeric(12, 2) not null,
  estado public.orden_estado not null default 'pendiente',
  metodo_pago text,
  tx_hash_blockchain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orden_items (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete restrict,
  paquete_id uuid references public.paquetes (id) on delete restrict,
  cantidad integer not null default 1 check (cantidad > 0),
  fecha_servicio date,
  precio numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint orden_items_listing_xor_paquete check (
    (listing_id is not null and paquete_id is null)
    or (listing_id is null and paquete_id is not null)
  )
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes (id) on delete cascade,
  pasarela text not null default 'pioneer_sandbox',
  referencia text,
  estado public.pago_estado not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comisiones_afiliado (
  id uuid primary key default gen_random_uuid(),
  afiliado_id uuid not null references public.afiliados (id) on delete cascade,
  orden_id uuid not null references public.ordenes (id) on delete cascade,
  monto numeric(12, 2) not null,
  estado public.comision_estado not null default 'pendiente',
  created_at timestamptz not null default now(),
  unique (orden_id)
);

create index carrito_items_carrito_id_idx on public.carrito_items (carrito_id);
create index carrito_items_listing_id_idx on public.carrito_items (listing_id);
create index ordenes_user_id_idx on public.ordenes (user_id);
create index orden_items_orden_id_idx on public.orden_items (orden_id);
create index pagos_orden_id_idx on public.pagos (orden_id);
create index comisiones_afiliado_afiliado_id_idx on public.comisiones_afiliado (afiliado_id);
