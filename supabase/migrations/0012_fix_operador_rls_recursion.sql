-- Etapa 2 / Bloque 1 — fix: las politicas agregadas en 0011 causaban
-- "infinite recursion detected in policy for relation ordenes": la politica
-- de ordenes consultaba orden_items, y la de orden_items consultaba ordenes.
-- Se reemplazan por funciones SECURITY DEFINER (mismo patron que
-- get_user_role) que no vuelven a disparar RLS al evaluarse.

drop policy if exists "orden_items_select_operador" on public.orden_items;
drop policy if exists "ordenes_select_operador" on public.ordenes;

create or replace function public.operador_owns_listing(p_listing_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.listings l
    join public.operadores o on o.id = l.operador_id
    where l.id = p_listing_id and o.user_id = p_user_id
  );
$$;

create or replace function public.operador_owns_orden(p_orden_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.orden_items oi
    join public.listings l on l.id = oi.listing_id
    join public.operadores o on o.id = l.operador_id
    where oi.orden_id = p_orden_id and o.user_id = p_user_id
  );
$$;

create policy "orden_items_select_operador" on public.orden_items
  for select to authenticated
  using (public.operador_owns_listing(orden_items.listing_id, auth.uid()));

create policy "ordenes_select_operador" on public.ordenes
  for select to authenticated
  using (public.operador_owns_orden(ordenes.id, auth.uid()));
