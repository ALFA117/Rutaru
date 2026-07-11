-- Etapa 3 / Bloque 1 — separar la tarifa neta B2B (listings.precio_neto_b2b)
-- del catalogo publico. RLS de Postgres filtra FILAS, no COLUMNAS: mientras
-- exista una politica "select true" en la tabla base para anon/authenticated,
-- cualquiera que consulte listings directo via REST ve todas las columnas,
-- incluida la tarifa neta. La unica forma correcta de ocultar una columna
-- es no exponerla en absoluto a esos roles: se retira el acceso publico a
-- la tabla base y se crea una vista sin esa columna para todo consumo
-- publico/cliente/afiliado.

drop policy if exists "listings_select_public" on public.listings;

create view public.listings_publico
with (security_invoker = false) as
select
  id, operador_id, tipo, titulo, slug, descripcion, itinerario,
  precio_b2c, moneda, duracion, ubicacion, lat, lng, imagenes, cupo,
  activo, created_at, updated_at
from public.listings
where activo = true;

grant select on public.listings_publico to anon, authenticated;

-- Acceso a la tabla base (con tarifa neta) solo para quien la necesita:
-- agencia/admin (catalogo B2B) y el propio operador (su inventario).
create policy "listings_select_agencia_admin" on public.listings
  for select to authenticated
  using (public.get_user_role(auth.uid()) in ('agencia', 'admin'));

create policy "listings_select_operador_own" on public.listings
  for select to authenticated
  using (
    exists (
      select 1 from public.operadores o
      where o.id = listings.operador_id and o.user_id = auth.uid()
    )
  );
