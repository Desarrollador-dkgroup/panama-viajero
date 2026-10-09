import { getSupabaseServerClient } from "@/lib/supabase";

export type TouristSiteRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  photoPath: string;
  cityName: string;
};

// Traduce el slug de la URL al identificador textual usado por Supabase.
const provinceIds: Record<string, string> = {
  bocas: "Bocas del Toro",
  cocle: "Coclé",
  colon: "Colón",
  chiriqui: "Chiriquí",
  darien: "Darién",
  herrera: "Herrera",
  "los-santos": "Los Santos",
  panama: "Panamá",
  "panama-oeste": "Panamá Oeste",
  veraguas: "Veraguas",
};

// Obtiene los sitios turísticos publicados para una provincia.
export async function getTouristSites(provinceId: string): Promise<TouristSiteRecord[]> {
  const supabase = getSupabaseServerClient();
  const databaseProvinceId = provinceIds[provinceId] ?? provinceId;
  const { data, error } = await supabase
    .from("tourist_sites")
    .select("id, slug, name, description, short_description, photo_storage_path, cities(name)")
    .eq("province_id", databaseProvinceId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((site) => ({
    id: site.id,
    slug: site.slug,
    name: site.name,
    description: site.description,
    shortDescription: site.short_description ?? site.description,
    photoPath: site.photo_storage_path ?? "/P-Principal/Banner.png",
    cityName: (site.cities as { name?: string } | null)?.name ?? "Panamá",
  }));
}
