-- Etapa 2 / Bloque 1 — el operador necesita ver sus propias ventas para su
-- dashboard (ventas/reservas/ocupacion), algo que Etapa 1 no cubria: las
-- politicas de orden_items/ordenes solo consideraban al comprador, no al
-- dueno del listing vendido.

create policy "orden_items_select_operador" on public.orden_items
  for select to authenticated
  using (
    exists (
      select 1 from public.listings l
      join public.operadores o on o.id = l.operador_id
      where l.id = orden_items.listing_id and o.user_id = auth.uid()
    )
  );

create policy "ordenes_select_operador" on public.ordenes
  for select to authenticated
  using (
    exists (
      select 1 from public.orden_items oi
      join public.listings l on l.id = oi.listing_id
      join public.operadores o on o.id = l.operador_id
      where oi.orden_id = ordenes.id and o.user_id = auth.uid()
    )
  );
