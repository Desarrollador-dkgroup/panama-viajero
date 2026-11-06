// Formato de dinero sin "use client", para usarlo también en componentes del servidor.
// Siempre dos decimales: $100.00, $22.61.

// Importe en dólares (no centavos).
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  return `$${amount.toFixed(2)}`;
}

// Importe en centavos.
export function formatMoney(cents: number | null): string {
  if (cents == null) return "";
  return formatPrice(cents / 100);
}
