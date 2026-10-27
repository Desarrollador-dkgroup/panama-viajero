import { getSupabaseServerClient } from "@/lib/supabase";

export type ServiceDetailData = {
  id: string;
  slug: string;
  category: string;
  name: string;
  location: string;
  description: string;
  image: string;
  photos: Array<{ path: string; isCover: boolean; position: number }>;
  rating: string;
  reviews: number;
  price: number;
  rooms: Array<{
    name: string;
    description: string;
    beds: string;
    capacity: string;
    price: number;
  }>;
  amenities: string[];
  policies: string[];
  menu: Array<{
    section: string;
    dishes: Array<{ name: string; description: string; price: number }>;
  }>;
  attractions: Array<{
    id: string;
    name: string;
    description: string;
    photos: Array<{ storage_path?: string; position: number; alt_text?: string }>;
  }>;
};

// Obtiene un servicio y sus relaciones desde Supabase.
export async function getServiceDetails(identifier: string): Promise<ServiceDetailData | null> {
  const supabase = getSupabaseServerClient();
  const query = supabase.from("services").select(`
    id, slug, category_id, name, description, cached_price_from_cents,
    base_price_cents, rating_avg, rating_count, destination_province_id,
    service_photos(storage_path, is_cover, position),
    service_amenities(amenities(label))
  `);

  // Limita la consulta pública a servicios publicados.
  query.eq("status", "published");

  const serviceResult = identifier.match(/^[0-9a-f-]{36}$/i)
    ? await query.eq("id", identifier).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();

  const service = serviceResult.data as Record<string, unknown> | null;
  if (serviceResult.error || !service) return null;

  const province = String(service.destination_province_id ?? "Panamá");
  const photos = service.service_photos as Array<{
    storage_path?: string;
    is_cover?: boolean;
    position?: number;
  }> | null;
  const cover = photos?.sort((a, b) => Number(b.is_cover) - Number(a.is_cover))[0];
  const priceCents = service.cached_price_from_cents ?? service.base_price_cents ?? 0;
  const category = String(service.category_id);
  const rooms: ServiceDetailData["rooms"] = [];
  const menu: ServiceDetailData["menu"] = [];
  const attractions: ServiceDetailData["attractions"] = [];

  if (category === "hospedaje") {
    const { data } = await supabase
      .from("room_types")
      .select("name, description, capacity, beds_label, price_cents")
      .eq("service_id", String(service.id))
      .order("position");

    for (const room of data ?? []) {
      rooms.push({
        name: room.name,
        description: room.description,
        beds: room.beds_label,
        capacity: `${room.capacity} personas`,
        price: room.price_cents / 100,
      });
    }
  }

  if (category === "restaurantes") {
    const { data: sections } = await supabase
      .from("menu_sections")
      .select("id, title, position, menu_dishes(name, description, price_cents, position)")
      .eq("service_id", String(service.id))
      .order("position");

    for (const section of sections ?? []) {
      menu.push({
        section: section.title,
        dishes: (section.menu_dishes ?? []).map(
          (dish: { name: string; description: string; price_cents: number }) => ({
            name: dish.name,
            description: dish.description,
            price: dish.price_cents / 100,
          }),
        ),
      });
    }
  }

  if (category === "actividades") {
    const { data: profile } = await supabase
      .from("activity_profiles")
      .select("details")
      .eq("service_id", String(service.id))
      .maybeSingle();

    if (profile && typeof profile.details === "object" && profile.details !== null) {
      const details = profile.details as Record<string, unknown>;
      if (Array.isArray(details.attractions)) {
        for (const attr of details.attractions) {
          if (typeof attr === "object" && attr !== null) {
            const attraction = attr as Record<string, unknown>;
            attractions.push({
              id: String(attraction.id ?? ""),
              name: String(attraction.name ?? ""),
              description: String(attraction.description ?? ""),
              photos: Array.isArray(attraction.photos)
                ? (attraction.photos as Array<unknown>).map((p) => {
                    const photo = p as Record<string, unknown>;
                    return {
                      storage_path: photo.storage_path as string | undefined,
                      position: Number(photo.position ?? 0),
                      alt_text: photo.alt_text as string | undefined,
                    };
                  })
                : [],
            });
          }
        }
      }
    }
  }

  return {
    id: String(service.id),
    slug: String(service.slug),
    category,
    name: String(service.name),
    location: province,
    description: String(service.description ?? "Información del servicio."),
    image: cover?.storage_path?.startsWith("http") ? cover.storage_path : "/P-Principal/Banner.png",
    // Conserva todas las imágenes y su orden para la futura galería.
    photos: (photos ?? []).map((photo) => ({
      path: photo.storage_path ?? "",
      isCover: photo.is_cover ?? false,
      position: photo.position ?? 0,
    })),
    rating: Number(service.rating_avg ?? 0).toFixed(1),
    reviews: Number(service.rating_count ?? 0),
    price: Number(priceCents) / 100,
    rooms,
    // Lee las comodidades asociadas al servicio sin añadir atributos ficticios.
    amenities: (service.service_amenities as Array<{
      amenities: { label: string } | null;
    }> | null ?? []).flatMap((entry) => entry.amenities ? [entry.amenities.label] : []),
    policies: [],
    menu,
    attractions,
  };
}
