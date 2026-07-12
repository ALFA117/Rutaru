-- Nueva ronda / Bloque 5 — constructor de paquetes rediseñado: fechas de
-- viaje del paquete y ubicacion (para mostrar en /paquete/[slug] y filtrar
-- por pais/estado/ciudad en el constructor).

alter table public.paquetes
  add column fecha_inicio date,
  add column fecha_fin date,
  add column pais text,
  add column estado text,
  add column ciudad text;
