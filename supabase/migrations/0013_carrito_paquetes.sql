-- Etapa 2 / Bloque 2 — permite agregar paquetes de agencia al carrito
-- (hasta ahora solo listings individuales). Mismo patron xor que orden_items.

alter table public.carrito_items
  add column paquete_id uuid references public.paquetes (id) on delete cascade;

alter table public.carrito_items
  alter column listing_id drop not null;

alter table public.carrito_items
  add constraint carrito_items_listing_xor_paquete check (
    (listing_id is not null and paquete_id is null)
    or (listing_id is null and paquete_id is not null)
  );

create index carrito_items_paquete_id_idx on public.carrito_items (paquete_id);

-- Visibilidad de agencia sobre sus propias ventas B2C de paquetes, mismo
-- patron SECURITY DEFINER que operador_owns_listing/operador_owns_orden
-- (evita la recursion de politicas entre ordenes y orden_items).

create or replace function public.agencia_owns_paquete(p_paquete_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.paquetes p
    join public.agencias a on a.id = p.agencia_id
    where p.id = p_paquete_id and a.user_id = p_user_id
  );
$$;

create or replace function public.agencia_owns_orden(p_orden_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.orden_items oi
    join public.paquetes p on p.id = oi.paquete_id
    join public.agencias a on a.id = p.agencia_id
    where oi.orden_id = p_orden_id and a.user_id = p_user_id
  );
$$;

create policy "orden_items_select_agencia" on public.orden_items
  for select to authenticated
  using (public.agencia_owns_paquete(orden_items.paquete_id, auth.uid()));

create policy "ordenes_select_agencia" on public.ordenes
  for select to authenticated
  using (public.agencia_owns_orden(ordenes.id, auth.uid()));
