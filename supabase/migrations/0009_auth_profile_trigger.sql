-- Etapa 1 / Bloque 2 — trigger que crea el profile al registrarse en auth.users
-- El rol se toma de raw_user_meta_data.role (fijado por el signup o por el script
-- de seed de usuarios demo via Admin API); por defecto 'cliente'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nombre, email, telefono)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'cliente'),
    new.raw_user_meta_data->>'nombre',
    new.email,
    new.raw_user_meta_data->>'telefono'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
