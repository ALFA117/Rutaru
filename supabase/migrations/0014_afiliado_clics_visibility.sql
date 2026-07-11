-- Etapa 2 / Bloque 4 — el afiliado necesita ver los clics de su propio
-- codigo en events_tracking, pero esos eventos casi siempre son de
-- visitantes anonimos (user_id null), no del afiliado mismo, asi que la
-- politica "propio user_id" de Etapa 1 no le daba acceso.

create or replace function public.afiliado_owns_codigo(p_entidad text, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.afiliados a
    where a.user_id = p_user_id and (a.codigo_5 = p_entidad or a.codigo_10 = p_entidad)
  );
$$;

create policy "events_tracking_select_afiliado" on public.events_tracking
  for select to authenticated
  using (public.afiliado_owns_codigo(entidad, auth.uid()));
