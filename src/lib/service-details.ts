import { getSupabaseServerClient } from "@/lib/supabase";

export type ServiceDetailData = {
  id: string;
  slug: string;
  category: string;
  name: string;
  location: string;
  description: string;
  image: string;
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
};

// Obtiene un servicio y sus relaciones desde Supabase.
export async function getServiceDetails(identifier: string): Promise<ServiceDetailData | null> {
  const supabase = getSupabaseServerClient();
  const query = supabase.from("services").select(`
    id, slug, category_id, name, description, cached_price_from_cents,
    base_price_cents, rating_avg, rating_count, area_label,
    cities(name), service_photos(storage_path, is_cover, position)
  `);

  const serviceResult = identifier.match(/^[0-9a-f-]{36}$/i)
    ? await query.eq("id", identifier).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();

  const service = serviceResult.data as Record<string, unknown> | null;
  if (serviceResult.error || !service) return null;

  const city = service.cities as { name?: string } | null;
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

  if (category === "hospedaje") {
    const { data } = await supabase.from("room_types").select(
      "name, description, capacity, beds_label, price_cents"
    ).eq("service_id", String(service.id)).order("position");

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
    const { data: sections } = await supabase.from("menu_sections").select(
      "id, title, position, menu_dishes(name, description, price_cents, position)"
    ).eq("service_id", String(service.id)).order("position");

    for (const section of sections ?? []) {
      menu.push({
        section: section.title,
        dishes: (section.menu_dishes ?? []).map((dish: {
          name: string;
          description: string;
          price_cents: number;
        }) => ({
          name: dish.name,
          description: dish.description,
          price: dish.price_cents / 100,
        })),
      });
    }
  }

  return {
    id: String(service.id),
    slug: String(service.slug),
    category,
    name: String(service.name),
    location: city?.name ?? String(service.area_label ?? "Panamá"),
    description: String(service.description ?? "Información del servicio."),
    image: cover?.storage_path?.startsWith("http")
      ? cover.storage_path
      : "/P-Principal/Banner.png",
    rating: Number(service.rating_avg ?? 0).toFixed(1),
    reviews: Number(service.rating_count ?? 0),
    price: Number(priceCents) / 100,
    rooms,
    amenities: ["Servicio publicado", "Ubicación en Panamá"],
    policies: ["Consulta las condiciones directamente con el negocio."],
    menu,
  };
}
