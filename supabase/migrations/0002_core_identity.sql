-- Etapa 1 / Bloque 2 — identidad: profiles, operadores, agencias, afiliados

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'cliente',
  nombre text,
  email text,
  telefono text,
  avatar text,
  empresa text,
  pais text,
  ciudad text,
  verificado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operadores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  tipo text not null check (tipo in ('hotel', 'tour', 'transporte', 'evento')),
  descripcion text,
  logo text,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  razon_social text not null,
  pais text,
  nivel_b2b text,
  markup_default numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.afiliados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  codigo_5 text not null unique,
  codigo_10 text not null unique,
  comision_pct numeric(5, 2) not null default 10,
  saldo numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index operadores_user_id_idx on public.operadores (user_id);
create index agencias_user_id_idx on public.agencias (user_id);
create index afiliados_user_id_idx on public.afiliados (user_id);
