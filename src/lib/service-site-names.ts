import type { SupabaseClient } from "@supabase/supabase-js";

// Añade nombres de sitios asociados para encontrar el servicio desde cualquiera de ellos.
export async function getServiceSiteNames(supabase: SupabaseClient, serviceIds: string[]) {
  const names = new Map<string, string[]>();
  if (serviceIds.length === 0) return names;

  const links = await supabase
    .from("service_tourist_sites")
    .select("service_id, tourist_site_id")
    .in("service_id", serviceIds);
  // Permite seguir usando el catálogo antes de ejecutar el SQL de la tabla nueva.
  if (links.error?.code === "PGRST205" || links.error?.code === "42P01") return names;
  if (links.error) throw new Error(links.error.message);

  const siteIds = [...new Set((links.data ?? []).map((link) => String(link.tourist_site_id)))];
  if (siteIds.length === 0) return names;

  const sites = await supabase.from("tourist_sites").select("id, name").in("id", siteIds);
  if (sites.error) throw new Error(sites.error.message);
  const siteNames = new Map((sites.data ?? []).map((site) => [String(site.id), String(site.name)]));

  for (const link of links.data ?? []) {
    const name = siteNames.get(String(link.tourist_site_id));
    if (!name) continue;
    const serviceId = String(link.service_id);
    names.set(serviceId, [...(names.get(serviceId) ?? []), name]);
  }
  return names;
}
