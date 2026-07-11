export function calcularDescuentoVolumenPct(cantidad: number) {
  if (cantidad >= 20) return 10;
  if (cantidad >= 10) return 5;
  return 0;
}
