-- Etapa de pulido pre-pitch: /operador/[slug] mostraba `descripcion` (una
-- tagline, ej. "Rutas y tours de autor.") como si fuera el nombre, porque
-- operadores no tenia un campo de nombre propio y profiles.nombre no es
-- legible por anon (RLS). Se denormaliza aqui en vez de crear una vista
-- publica nueva, mismo espiritu que listings_publico/agencias_publico pero
-- mas simple: operadores ya tiene "operadores_select_public".
alter table public.operadores add column nombre text;
