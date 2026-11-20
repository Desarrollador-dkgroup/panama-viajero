import { cache } from "react";
import { catalogPhotoUrl } from "@/lib/storage";
import { getSupabaseServerClient } from "@/lib/supabase";

// Fotos de la galería de un sitio turístico, en el orden del panel; la primera es la portada.
// Las del catálogo inicial son rutas de `catalog-photos`; las del panel, URL completas.
export const getTouristSitePhotos = cache(async (siteId: string): Promise<string[]> => {
  const { data, error } = await getSupabaseServerClient()
    .from("tourist_site_photos")
    .select("storage_path")
    .eq("tourist_site_id", siteId)
    .order("position");
  if (error) throw new Error("No se pudieron cargar las fotos del sitio.");
  return (data ?? [])
    .map((row) => catalogPhotoUrl(row.storage_path as string))
    .filter((url) => url !== "");
});
