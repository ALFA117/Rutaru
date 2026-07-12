-- Ronda de calidad visual: el listado publico de /paquetes muestra el
-- nombre de la agencia (agencias.razon_social) via join, pero RLS solo
-- permite SELECT en agencias al dueno o admin -- para visitantes anonimos
-- el join vuelve null y el Badge se ve vacio (un punto sin texto). Mismo
-- patron que listings_publico (0016): vista publica con solo las columnas
-- no sensibles (sin markup_default ni nivel_b2b, que son terminos B2B).

create view public.agencias_publico
with (security_invoker = false) as
select id, razon_social, pais
from public.agencias;

grant select on public.agencias_publico to anon, authenticated;
