"use client";

import { useEffect, useState } from "react";
import type { DestinationRecord } from "@/lib/destinations";

// Carga los destinos del panel desde el navegador.
export function useDestinations() {
  const [items, setItems] = useState<DestinationRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/destinations", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los destinos.");
        const result = (await response.json()) as { destinations: DestinationRecord[] };
        setItems(result.destinations);
        setStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return { items, status };
}
