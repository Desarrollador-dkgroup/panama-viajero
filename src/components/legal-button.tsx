"use client";

import { useRouter } from "next/navigation";

// Reserva la navegación legal hasta publicar las páginas correspondientes
export function LegalButton({ href, children, disabled = true }: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="legal-button"
      disabled={disabled}
      title={disabled ? "Página legal pendiente de configurar" : undefined}
      onClick={() => router.push(href)}
    >
      {children}
    </button>
  );
}
