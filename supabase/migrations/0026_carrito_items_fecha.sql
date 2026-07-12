-- Nueva ronda / Bloque 4 — el widget de reserva con calendario necesita
-- persistir la fecha elegida desde el carrito hasta la orden.

alter table public.carrito_items
  add column fecha_servicio date;
