-- Etapa 4 — liga la orden con el id de la reserva dentro de RutaruBooking
-- (necesario para completarServicio/cancelarReserva desde los dashboards).

alter table public.ordenes
  add column reserva_id_blockchain bigint;
