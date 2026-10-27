import { getSupabaseServerClient } from "@/lib/supabase";

export type SiteServiceRecord = {
  id: string;
  slug: string;
  name: string;
  categories: { id: string; label: string } | null;
  destination_province_id: string | null;
};

// Combina el sitio principal con las asociaciones adicionales sin duplicar servicios.
export async function getSiteServices(siteId: string): Promise<SiteServiceRecord[]> {
  const supabase = getSupabaseServerClient();
  const [primary, additional] = await Promise.all([
    supabase
      .from("services")
      .select("id, slug, name, categories(id, label), destination_province_id")
      .eq("tourist_site_id", siteId)
      .eq("status", "published"),
    supabase.from("service_tourist_sites").select("service_id").eq("tourist_site_id", siteId),
  ]);

  if (primary.error) throw new Error(primary.error.message);

  // Conserva la lectura anterior únicamente mientras no se haya ejecutado la migración.
  const missingTable = additional.error?.code === "PGRST205" || additional.error?.code === "42P01";
  if (additional.error && !missingTable) throw new Error(additional.error.message);

  const services = new Map<string, SiteServiceRecord>();
  for (const service of (primary.data as unknown as SiteServiceRecord[]) ?? []) {
    services.set(service.id, service);
  }

  const ids = (additional.data ?? []).map((link) => String(link.service_id));
  if (ids.length > 0) {
    const linked = await supabase
      .from("services")
      .select("id, slug, name, categories(id, label), destination_province_id")
      .in("id", ids)
      .eq("status", "published");
    if (linked.error) throw new Error(linked.error.message);

    for (const service of (linked.data as unknown as SiteServiceRecord[]) ?? []) {
      services.set(service.id, service);
    }
  }

  return [...services.values()];
}
