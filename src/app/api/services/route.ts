import { NextResponse } from "next/server";
import { getServiceSiteNames } from "@/lib/service-site-names";
import { getSupabaseServerClient } from "@/lib/supabase";

// Devuelve servicios publicados y sus datos básicos para el catálogo.
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") ?? "hospedaje";

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        id, slug, name, search_description, description, base_price_cents,
        cached_price_from_cents, currency, rating_avg, rating_count,
        destination_province_id, categories!inner(id, label), tourist_sites(name),
        service_photos(storage_path, is_cover, alt_text, position)
      `,
      )
      .eq("status", "published")
      .eq("categories.id", category)
      .order("is_recommended", { ascending: false })
      .order("rating_avg", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Incluye las ubicaciones secundarias en el texto de búsqueda del catálogo.
    const siteNames = await getServiceSiteNames(
      supabase,
      (data ?? []).map((service) => service.id),
    );
    return NextResponse.json({
      services: (data ?? []).map((service) => ({
        ...service,
        associated_site_names: siteNames.get(service.id) ?? [],
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de conexión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
