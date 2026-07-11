-- Etapa 1 / Bloque 2 — funciones y triggers compartidos

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'operadores', 'agencias', 'afiliados',
    'listings', 'paquetes', 'carritos', 'ordenes', 'pagos', 'data_packages'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;

-- SECURITY DEFINER: evita recursion de RLS al consultar profiles desde otras politicas.
create or replace function public.get_user_role(user_id uuid)
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = user_id;
$$;
