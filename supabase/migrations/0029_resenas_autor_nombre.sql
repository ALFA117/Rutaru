-- Etapa de pulido pre-pitch: nombre visible del autor de la resena.
-- Las resenas siguen ligadas via user_id a un profile real (constraint unique
-- listing_id+user_id se mantiene), pero la tarjeta/detalle muestra este nombre
-- en vez de resolver el nombre del profile (evita joins y respeta que varias
-- cuentas demo no representan personas reales).
alter table public.resenas add column autor_nombre text;
