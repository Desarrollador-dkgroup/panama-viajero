import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase";

// iconKey: icono elegido en el panel, o null para elegirlo según el nombre.
export type TouristSiteActivity = { name: string; description: string; iconKey: string | null };

// Actividades de un sitio turístico («Qué hacer en …»), en el orden del panel.
export const getTouristSiteActivities = cache(
  async (siteId: string): Promise<TouristSiteActivity[]> => {
    const { data, error } = await getSupabaseServerClient()
      .from("tourist_site_activities")
      .select("name, description, icon_key")
      .eq("tourist_site_id", siteId)
      .order("position");
    if (error) throw new Error("No se pudieron cargar las actividades del sitio.");
    return (data ?? []).map((row) => ({
      name: row.name as string,
      description: (row.description as string) ?? "",
      iconKey: (row.icon_key as string | null) ?? null,
    }));
  },
);
