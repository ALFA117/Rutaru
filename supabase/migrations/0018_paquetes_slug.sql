-- Etapa 3 / Bloque 3 — paquetes publicables con pagina propia /paquete/[slug]

alter table public.paquetes add column slug text;

update public.paquetes set slug =
  lower(regexp_replace(regexp_replace(titulo, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
  || '-' || substr(id::text, 1, 8)
where slug is null;

alter table public.paquetes alter column slug set not null;
alter table public.paquetes add constraint paquetes_slug_key unique (slug);
