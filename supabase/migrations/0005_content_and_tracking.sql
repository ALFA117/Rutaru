-- Etapa 1 / Bloque 2 — contenido y tracking: resenas, events_tracking

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create table public.events_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  session_id text not null,
  tipo_evento text not null check (
    tipo_evento in (
      'page_view',
      'search',
      'click',
      'add_to_cart',
      'purchase',
      'code_applied'
    )
  ),
  entidad text,
  metadata jsonb not null default '{}'::jsonb,
  dispositivo text,
  ciudad text,
  created_at timestamptz not null default now()
);

create index resenas_listing_id_idx on public.resenas (listing_id);
create index events_tracking_session_id_idx on public.events_tracking (session_id);
create index events_tracking_user_id_idx on public.events_tracking (user_id);
create index events_tracking_tipo_evento_idx on public.events_tracking (tipo_evento);
create index events_tracking_created_at_idx on public.events_tracking (created_at);
