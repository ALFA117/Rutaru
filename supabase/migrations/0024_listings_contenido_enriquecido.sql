-- Nueva ronda / Bloque 1 — columnas de contenido enriquecido para las
-- paginas de detalle: que incluye, politica de cancelacion, dificultad,
-- y desglose de ubicacion (pais/estado/ciudad) para selects encadenados
-- (buscador del home y constructor de paquetes). `itinerario` (jsonb, ya
-- existente) se reutiliza sin cambio de columna: pasa de contener solo
-- `[{zonas:[...]}]` (eventos) a un objeto `{pasos:[...], zonas:[...]}` —
-- cambio de forma a nivel de aplicacion, no de esquema.

alter table public.listings
  add column que_incluye text[] not null default '{}',
  add column cancelaciones text,
  add column dificultad text,
  add column pais text,
  add column estado text,
  add column ciudad text;

drop view public.listings_publico;

create view public.listings_publico
with (security_invoker = false) as
select
  id, operador_id, tipo, titulo, slug, descripcion, itinerario,
  que_incluye, cancelaciones, dificultad, pais, estado, ciudad,
  precio_b2c, moneda, duracion, ubicacion, lat, lng, imagenes, cupo,
  activo, created_at, updated_at
from public.listings
where activo = true;

grant select on public.listings_publico to anon, authenticated;
