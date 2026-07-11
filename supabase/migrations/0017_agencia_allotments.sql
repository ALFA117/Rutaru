-- Etapa 3 / Bloque 2 — la agencia necesita descontar disponibilidad real
-- al comprar bloques/allotments de cualquier listing (no solo los propios,
-- a diferencia del operador). Insert/update de ordenes/orden_items/pagos
-- ya funcionan via las politicas de "dueno" de Etapa 1 (la agencia es el
-- user_id de su propia orden b2b); lo unico que faltaba es poder
-- actualizar disponibilidad.cupo_disponible de listings ajenos.

create policy "disponibilidad_update_agencia" on public.disponibilidad
  for update to authenticated
  using (public.get_user_role(auth.uid()) = 'agencia')
  with check (public.get_user_role(auth.uid()) = 'agencia');
