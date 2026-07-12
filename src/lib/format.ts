const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function extracto(texto: string | null | undefined, maxLen = 155) {
  if (!texto) return undefined;
  const limpio = texto.trim();
  if (limpio.length <= maxLen) return limpio;
  return `${limpio.slice(0, maxLen - 1).trimEnd()}…`;
}
