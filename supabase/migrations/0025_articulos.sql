-- Nueva ronda / Bloque 2 — sistema de articulos (blog editorial).
-- listing_id nullable: un articulo puede o no estar ligado a un producto.

create table public.articulos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  extracto text,
  contenido text not null,
  imagen text,
  categoria text,
  listing_id uuid references public.listings (id) on delete set null,
  autor text,
  publicado_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articulos_listing_id_idx on public.articulos (listing_id);
create index articulos_publicado_at_idx on public.articulos (publicado_at desc);

create trigger set_updated_at
  before update on public.articulos
  for each row execute function public.set_updated_at();

alter table public.articulos enable row level security;

-- Lectura publica (es contenido editorial, sin datos sensibles).
create policy "articulos_select_public" on public.articulos
  for select to anon, authenticated
  using (true);

-- Escritura solo admin/operador.
create policy "articulos_write_admin_operador" on public.articulos
  for all to authenticated
  using (public.get_user_role(auth.uid()) in ('admin', 'operador'))
  with check (public.get_user_role(auth.uid()) in ('admin', 'operador'));
