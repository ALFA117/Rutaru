-- Etapa 3 / Bloque 7 — /datos es pagina publica del Data Marketplace.
-- data_packages era admin-only puro desde Etapa 1; se agrega lectura
-- publica solo para paquetes publicados/vendidos (nunca borradores).
-- La compra simulada sigue pasando por el cliente admin server-only
-- (accion acotada, no se abre UPDATE publico sobre la tabla).

create policy "data_packages_select_public" on public.data_packages
  for select to anon, authenticated
  using (estado in ('publicado', 'vendido'));
