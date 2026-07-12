-- Etapa de pulido pre-pitch: promedio y conteo de resenas expuestos en
-- listings_publico para que las tarjetas del marketplace (no solo el
-- detalle) puedan mostrar el rating sin una query aparte por listing.

drop view public.listings_publico;

create view public.listings_publico
with (security_invoker = false) as
select
  l.id, l.operador_id, l.tipo, l.titulo, l.slug, l.descripcion, l.itinerario,
  l.que_incluye, l.cancelaciones, l.dificultad, l.pais, l.estado, l.ciudad,
  l.precio_b2c, l.moneda, l.duracion, l.ubicacion, l.lat, l.lng, l.imagenes, l.cupo,
  l.activo, l.created_at, l.updated_at,
  r.rating_promedio, r.rating_count
from public.listings l
left join lateral (
  select
    avg(rating)::numeric(3, 2) as rating_promedio,
    count(*)::int as rating_count
  from public.resenas
  where resenas.listing_id = l.id
) r on true
where l.activo = true;

grant select on public.listings_publico to anon, authenticated;
