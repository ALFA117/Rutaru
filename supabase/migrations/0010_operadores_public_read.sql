-- Etapa 1 / Bloque 5 — fix: /operador/[slug] es pagina publica SEO-friendly
-- (seccion 2 del spec) pero operadores solo tenia SELECT para dueno/admin.
-- Se agrega lectura publica (los campos de operadores no son sensibles;
-- la tarifa neta B2B vive en listings.precio_neto_b2b, no aqui).

create policy "operadores_select_public" on public.operadores
  for select to anon, authenticated
  using (true);
