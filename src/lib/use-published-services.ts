"use client";

import { useEffect, useState } from "react";
import type { CatalogService } from "@/data/catalog";

type ServiceRow = {
  id: string;
  slug: string | null;
  name: string;
  search_description: string;
  associated_site_names?: string[];
  tourist_sites?: { name: string } | null;
  cached_price_from_cents: number | null;
  base_price_cents: number | null;
  rating_avg: number | null;
  destination_province_id: string | null;
  service_photos: Array<{
    storage_path: string;
    is_cover: boolean;
    position: number;
  }> | null;
};

// Consulta servicios publicados y distingue carga, errores y resultados vacíos.
export function usePublishedServices(category: string) {
  const [items, setItems] = useState<CatalogService[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    // Normaliza los registros sin añadir servicios ni atributos de ejemplo.
    const load = async () => {
      const response = await fetch(`/api/services?category=${encodeURIComponent(category)}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) throw new Error("No se pudieron cargar los servicios.");

      const result = (await response.json()) as { services: ServiceRow[] };
      const services = result.services.map((service) => {
        // Ordena las fotografías para conservar la portada y preparar la galería.
        const photos = [...(service.service_photos ?? [])].sort((a, b) => {
          return Number(b.is_cover) - Number(a.is_cover) || a.position - b.position;
        });
        const image = photos[0]?.storage_path ?? "";

        return {
          id: service.id,
          slug: service.slug ?? service.id,
          name: service.name,
          searchText: [
            service.search_description,
            service.tourist_sites?.name,
            ...(service.associated_site_names ?? []),
          ]
            .filter(Boolean)
            .join(" "),
          location: service.destination_province_id ?? "",
          province: service.destination_province_id ?? "",
          price: Number(service.cached_price_from_cents ?? service.base_price_cents ?? 0) / 100,
          rating: Number(service.rating_avg ?? 0).toFixed(1),
          image,
          imagePath: image,
          type: "",
          amenities: [],
          environment: "",
        };
      });

      if (controller.signal.aborted) return;
      setItems(services);
      setStatus("ready");
    };

    load().catch(() => {
      if (controller.signal.aborted) return;
      setItems([]);
      setStatus("error");
    });

    // Cancela la consulta al desmontar el componente o cambiar de categoría.
    return () => controller.abort();
  }, [category]);

  return { items, status };
}
