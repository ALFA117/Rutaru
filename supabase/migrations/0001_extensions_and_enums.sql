-- Etapa 1 / Bloque 2 — extensiones y tipos enum compartidos

create extension if not exists "pgcrypto" with schema public;

create type public.user_role as enum (
  'operador',
  'agencia',
  'admin',
  'afiliado',
  'cliente'
);

create type public.listing_tipo as enum (
  'ruta',
  'hospedaje',
  'traslado',
  'evento',
  'experiencia'
);

create type public.orden_tipo as enum ('b2b', 'b2c');

create type public.orden_estado as enum (
  'pendiente',
  'confirmada',
  'pagada',
  'cancelada',
  'completada'
);

create type public.pago_estado as enum ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

create type public.comision_estado as enum ('pendiente', 'pagada');

create type public.data_package_estado as enum ('borrador', 'publicado', 'vendido');
