-- Etapa 1 / Bloque 2 — RLS en las 15 tablas, usando 6 plantillas reutilizables:
-- 1) admin-override universal, 2) dueno directo, 3) lectura publica / escritura de dueno,
-- 4) hijo de fila propia, 5) insert abierto / lectura restringida, 6) admin-only puro.

alter table public.profiles enable row level security;
alter table public.operadores enable row level security;
alter table public.agencias enable row level security;
alter table public.afiliados enable row level security;
alter table public.listings enable row level security;
alter table public.disponibilidad enable row level security;
alter table public.paquetes enable row level security;
alter table public.carritos enable row level security;
alter table public.carrito_items enable row level security;
alter table public.ordenes enable row level security;
alter table public.orden_items enable row level security;
alter table public.pagos enable row level security;
alter table public.comisiones_afiliado enable row level security;
alter table public.resenas enable row level security;
alter table public.events_tracking enable row level security;
alter table public.ai_insights enable row level security;
alter table public.data_packages enable row level security;
alter table public.nft_tickets enable row level security;

-- 2) profiles: dueno directo (id = auth.uid())
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

-- 2) operadores / agencias / afiliados: dueno directo
create policy "operadores_select_own_or_admin" on public.operadores
  for select to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "operadores_insert_own" on public.operadores
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "operadores_update_own_or_admin" on public.operadores
  for update to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "operadores_delete_admin" on public.operadores
  for delete to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "agencias_select_own_or_admin" on public.agencias
  for select to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "agencias_insert_own" on public.agencias
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "agencias_update_own_or_admin" on public.agencias
  for update to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "agencias_delete_admin" on public.agencias
  for delete to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

create policy "afiliados_select_own_or_admin" on public.afiliados
  for select to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "afiliados_insert_own" on public.afiliados
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "afiliados_update_own_or_admin" on public.afiliados
  for update to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "afiliados_delete_admin" on public.afiliados
  for delete to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

-- 3) listings / disponibilidad / paquetes: lectura publica, escritura de dueno
create policy "listings_select_public" on public.listings
  for select to anon, authenticated
  using (true);
create policy "listings_write_own_or_admin" on public.listings
  for all to authenticated
  using (
    exists (select 1 from public.operadores o where o.id = listings.operador_id and o.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  )
  with check (
    exists (select 1 from public.operadores o where o.id = listings.operador_id and o.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );

create policy "disponibilidad_select_public" on public.disponibilidad
  for select to anon, authenticated
  using (true);
create policy "disponibilidad_write_own_or_admin" on public.disponibilidad
  for all to authenticated
  using (
    exists (
      select 1 from public.listings l
      join public.operadores o on o.id = l.operador_id
      where l.id = disponibilidad.listing_id and o.user_id = auth.uid()
    )
    or public.get_user_role(auth.uid()) = 'admin'
  )
  with check (
    exists (
      select 1 from public.listings l
      join public.operadores o on o.id = l.operador_id
      where l.id = disponibilidad.listing_id and o.user_id = auth.uid()
    )
    or public.get_user_role(auth.uid()) = 'admin'
  );

create policy "paquetes_select_public" on public.paquetes
  for select to anon, authenticated
  using (true);
create policy "paquetes_write_own_or_admin" on public.paquetes
  for all to authenticated
  using (
    exists (select 1 from public.agencias a where a.id = paquetes.agencia_id and a.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  )
  with check (
    exists (select 1 from public.agencias a where a.id = paquetes.agencia_id and a.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );

-- 2) carritos: dueno directo
create policy "carritos_all_own_or_admin" on public.carritos
  for all to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin')
  with check (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

-- 4) carrito_items: hijo de carritos
create policy "carrito_items_all_own_or_admin" on public.carrito_items
  for all to authenticated
  using (
    exists (select 1 from public.carritos c where c.id = carrito_items.carrito_id and c.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  )
  with check (
    exists (select 1 from public.carritos c where c.id = carrito_items.carrito_id and c.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );

-- 2) ordenes: dueno directo
create policy "ordenes_select_own_or_admin" on public.ordenes
  for select to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "ordenes_insert_own" on public.ordenes
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "ordenes_update_own_or_admin" on public.ordenes
  for update to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

-- 4) orden_items: hijo de ordenes
create policy "orden_items_select_own_or_admin" on public.orden_items
  for select to authenticated
  using (
    exists (select 1 from public.ordenes o where o.id = orden_items.orden_id and o.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );
create policy "orden_items_insert_own" on public.orden_items
  for insert to authenticated
  with check (
    exists (select 1 from public.ordenes o where o.id = orden_items.orden_id and o.user_id = auth.uid())
  );
create policy "orden_items_write_admin" on public.orden_items
  for update to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');
create policy "orden_items_delete_admin" on public.orden_items
  for delete to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

-- 4) pagos: hijo de ordenes
create policy "pagos_select_own_or_admin" on public.pagos
  for select to authenticated
  using (
    exists (select 1 from public.ordenes o where o.id = pagos.orden_id and o.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );
create policy "pagos_insert_own" on public.pagos
  for insert to authenticated
  with check (
    exists (select 1 from public.ordenes o where o.id = pagos.orden_id and o.user_id = auth.uid())
  );
create policy "pagos_update_admin" on public.pagos
  for update to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

-- 4) comisiones_afiliado: hijo de afiliados (lectura), insert ligado al checkout
create policy "comisiones_select_own_or_admin" on public.comisiones_afiliado
  for select to authenticated
  using (
    exists (select 1 from public.afiliados af where af.id = comisiones_afiliado.afiliado_id and af.user_id = auth.uid())
    or public.get_user_role(auth.uid()) = 'admin'
  );
create policy "comisiones_insert_authenticated" on public.comisiones_afiliado
  for insert to authenticated
  with check (true);
create policy "comisiones_update_admin" on public.comisiones_afiliado
  for update to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

-- 3) resenas: lectura publica, escritura de dueno
create policy "resenas_select_public" on public.resenas
  for select to anon, authenticated
  using (true);
create policy "resenas_insert_own" on public.resenas
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "resenas_update_own_or_admin" on public.resenas
  for update to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');
create policy "resenas_delete_own_or_admin" on public.resenas
  for delete to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

-- 5) events_tracking: insert abierto (anon incluido), lectura restringida
create policy "events_tracking_insert_open" on public.events_tracking
  for insert to anon, authenticated
  with check (true);
create policy "events_tracking_select_own_or_admin" on public.events_tracking
  for select to authenticated
  using (user_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

-- 6) admin-only puro: ai_insights, data_packages, nft_tickets
create policy "ai_insights_admin_only" on public.ai_insights
  for all to authenticated
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "data_packages_admin_only" on public.data_packages
  for all to authenticated
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');

create policy "nft_tickets_admin_only" on public.nft_tickets
  for all to authenticated
  using (public.get_user_role(auth.uid()) = 'admin')
  with check (public.get_user_role(auth.uid()) = 'admin');
