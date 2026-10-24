"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CatalogLoading } from "@/components/app/catalog-status";
import { exchangeCode } from "@/lib/auth-actions";

// Canjea el código de los enlaces del correo (confirmación y recuperación) y sigue a `next`.
function Confirm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const next = params.get("next") ?? "/cuenta";
    if (!code) return router.replace(next);
    exchangeCode(code)
      .then(({ error: failure }) => (failure ? setError(failure.message) : router.replace(next)))
      .catch((failure: unknown) =>
        setError(failure instanceof Error ? failure.message : "Enlace no válido."));
  }, [params, router]);

  return error
    ? <p style={{ padding: 24, color: "var(--text-muted)" }}>No pudimos validar el enlace: {error}</p>
    : <CatalogLoading />;
}

export default function ConfirmPage() {
  return <Suspense><Confirm /></Suspense>;
}
