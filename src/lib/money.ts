// Formato de dinero sin "use client", para usarlo también en componentes del servidor.
export function formatMoney(cents: number | null): string {
  if (cents == null) return "";
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
