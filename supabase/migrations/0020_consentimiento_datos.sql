-- Etapa 3 / Bloque 9 — consentimiento para el uso agregado/anonimizado
-- de los datos del usuario (Data Marketplace). Flag en el perfil,
-- default true (igual que el resto de la plataforma, los datos ya se
-- venden solo agregados/anonimizados sin excepcion; este flag es la
-- señal explicita de consentimiento mostrada al usuario).

alter table public.profiles
  add column consiente_datos_agregados boolean not null default true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nombre, email, telefono, consiente_datos_agregados)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'cliente'),
    new.raw_user_meta_data->>'nombre',
    new.email,
    new.raw_user_meta_data->>'telefono',
    coalesce((new.raw_user_meta_data->>'consiente_datos_agregados')::boolean, true)
  );
  return new;
end;
$$;
