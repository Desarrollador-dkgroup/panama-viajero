import { getSupabaseServerClient } from "@/lib/supabase";
import { publicMediaUrl } from "@/lib/storage";

export type ServiceDetailData = {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  typeLabel: string;
  name: string;
  location: string;
  address: string;
  description: string;
  image: string;
  photos: string[];
  rating: string;
  reviews: number;
  price: number;
  mapsEmbedUrl: string;
  rooms: Array<{
    name: string;
    description: string;
    beds: string;
    capacity: string;
    price: number;
    image: string;
  }>;
  amenities: string[];
  // Datos de operación en pares etiqueta/valor (check-in, recepción, horario, etc.).
  facts: Array<{ label: string; value: string }>;
  policies: string[];
  contact: { phone: string; email: string; website: string; menuUrl: string };
  menu: Array<{
    section: string;
    dishes: Array<{ name: string; description: string; price: number }>;
  }>;
};

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Recorta "HH:MM:SS" a "HH:MM".
function time(value: unknown) {
  return typeof value === "string" ? value.slice(0, 5) : "";
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// Añade un dato solo si tiene contenido, para no mostrar filas vacías.
function pushFact(facts: ServiceDetailData["facts"], label: string, value: string) {
  if (value) facts.push({ label, value });
}

// Obtiene un servicio publicado y todo lo que el panel guarda para su ficha pública.
export async function getServiceDetails(identifier: string): Promise<ServiceDetailData | null> {
  const supabase = getSupabaseServerClient();
  const query = supabase.from("services").select(`
    id, slug, category_id, name, description, address, maps_embed_url,
    cached_price_from_cents, base_price_cents, rating_avg, rating_count,
    destination_province_id, categories(label), hospedaje_types(label), meal_plans(label),
    tourist_sites!services_tourist_site_id_fkey(name, province_id),
    service_photos(storage_path, is_cover, position, lodging_area_id),
    service_amenities(amenities(label))
  `);

  // Limita la consulta pública a servicios publicados.
  query.eq("status", "published");

  const serviceResult = identifier.match(/^[0-9a-f-]{36}$/i)
    ? await query.eq("id", identifier).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();

  const service = serviceResult.data as Record<string, unknown> | null;
  if (serviceResult.error || !service) return null;

  const serviceId = String(service.id);
  const category = String(service.category_id);
  const site = service.tourist_sites as { name?: string; province_id?: string } | null;
  const province = text(service.destination_province_id) || text(site?.province_id);
  const photos = ((service.service_photos ?? []) as Array<{
    storage_path?: string;
    is_cover?: boolean;
    position?: number;
    lodging_area_id?: string | null;
  }>)
    .filter((photo) => !photo.lodging_area_id)
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) ||
      Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((photo) => publicMediaUrl(photo.storage_path))
    .filter(Boolean);
  const priceCents = service.cached_price_from_cents ?? service.base_price_cents ?? 0;
  const rooms: ServiceDetailData["rooms"] = [];
  const menu: ServiceDetailData["menu"] = [];
  const facts: ServiceDetailData["facts"] = [];
  const policies: string[] = [];
  const contact = { phone: "", email: "", website: "", menuUrl: "" };

  const mealPlan = service.meal_plans as { label?: string } | null;
  pushFact(facts, "Plan de comidas", text(mealPlan?.label));

  if (category === "hospedaje") {
    const [roomResult, profileResult] = await Promise.all([
      supabase
        .from("room_types")
        .select(`
          name, description, capacity, beds_label, price_cents,
          room_type_photos(storage_path, is_cover, position)
        `)
        .eq("service_id", serviceId)
        .order("position"),
      supabase.from("lodging_profiles").select("*").eq("service_id", serviceId).maybeSingle(),
    ]);

    for (const room of roomResult.data ?? []) {
      const roomPhotos = [...(room.room_type_photos ?? [])].sort((a, b) =>
        Number(b.is_cover) - Number(a.is_cover) || a.position - b.position);
      rooms.push({
        name: room.name,
        description: room.description ?? "",
        beds: room.beds_label ?? "",
        capacity: `${room.capacity} personas`,
        price: room.price_cents / 100,
        image: publicMediaUrl(roomPhotos[0]?.storage_path),
      });
    }

    const profile = profileResult.data as Record<string, unknown> | null;
    if (profile) {
      const checkIn = [time(profile.check_in_from), time(profile.check_in_to)]
        .filter(Boolean).join(" a ");
      pushFact(facts, "Check-in", checkIn);
      pushFact(facts, "Check-out", time(profile.check_out_time));
      pushFact(facts, "Recepción", text(profile.reception_hours));
      pushFact(facts, "Idiomas", Array.isArray(profile.languages)
        ? profile.languages.map(String).join(", ") : "");
      pushFact(facts, "Estacionamiento", text(profile.parking_details));
      pushFact(facts, "Mascotas", text(profile.pet_policy));
      pushFact(facts, "Fumar", text(profile.smoking_policy));
      pushFact(facts, "Eventos", text(profile.events_policy));
      const details = (profile.details ?? {}) as Record<string, unknown>;
      for (const rule of [text(profile.guest_rules), text(details.building_rules)]) {
        if (rule) policies.push(rule);
      }
      if (text(profile.cancellation_policy)) {
        policies.push(`Cancelación: ${text(profile.cancellation_policy)}`);
      }
      contact.phone = text(profile.contact_phone);
      contact.email = text(profile.contact_email);
      contact.website = text(profile.website_url);
    }
  }

  if (category === "restaurantes") {
    const [sectionResult, profileResult, hoursResult] = await Promise.all([
      supabase
        .from("menu_sections")
        .select("id, title, position, menu_dishes(name, description, price_cents, position)")
        .eq("service_id", serviceId)
        .order("position"),
      supabase.from("restaurant_profiles").select("*").eq("service_id", serviceId).maybeSingle(),
      supabase
        .from("restaurant_hours")
        .select("day_of_week, opens_at, closes_at, position")
        .eq("service_id", serviceId)
        .order("day_of_week")
        .order("position"),
    ]);

    for (const section of sectionResult.data ?? []) {
      menu.push({
        section: section.title,
        dishes: [...(section.menu_dishes ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((dish: { name: string; description: string; price_cents: number }) => ({
            name: dish.name,
            description: dish.description,
            price: dish.price_cents / 100,
          })),
      });
    }

    const profile = profileResult.data as Record<string, unknown> | null;
    if (profile) {
      pushFact(facts, "Cocina", text(profile.cuisine_type));
      pushFact(facts, "Ambiente", text(profile.ambience));
      pushFact(facts, "Reservas", profile.accepts_reservations ? "Acepta reservas" : "");
      if (text(profile.cancellation_policy)) {
        policies.push(`Cancelación: ${text(profile.cancellation_policy)}`);
      }
      if (text(profile.reservation_policy)) policies.push(text(profile.reservation_policy));
      contact.phone = text(profile.contact_phone);
      contact.email = text(profile.contact_email);
      contact.website = text(profile.website_url);
      contact.menuUrl = text(profile.menu_url);
    }

    // Agrupa los turnos por día: "Lunes: 12:00-15:00, 18:00-22:00".
    const byDay = new Map<number, string[]>();
    for (const period of hoursResult.data ?? []) {
      const list = byDay.get(period.day_of_week) ?? [];
      list.push(`${time(period.opens_at)}-${time(period.closes_at)}`);
      byDay.set(period.day_of_week, list);
    }
    for (const [day, periods] of [...byDay.entries()].sort(([a], [b]) => a - b)) {
      pushFact(facts, DAYS[day] ?? "Horario", periods.join(", "));
    }
  }

  return {
    id: serviceId,
    slug: String(service.slug),
    category,
    categoryLabel: text((service.categories as { label?: string } | null)?.label) || category,
    typeLabel: text((service.hospedaje_types as { label?: string } | null)?.label),
    name: String(service.name),
    location: [site?.name, province].filter(Boolean).join(", ") || "Panamá",
    address: text(service.address),
    description: text(service.description) || "Información del servicio.",
    image: photos[0] ?? "/P-Principal/Banner.png",
    photos,
    rating: Number(service.rating_avg ?? 0).toFixed(1),
    reviews: Number(service.rating_count ?? 0),
    price: Number(priceCents) / 100,
    mapsEmbedUrl: text(service.maps_embed_url),
    rooms,
    // Lee las comodidades asociadas al servicio sin añadir atributos ficticios.
    amenities: (service.service_amenities as Array<{
      amenities: { label: string } | null;
    }> | null ?? []).flatMap((entry) => entry.amenities ? [entry.amenities.label] : []),
    facts,
    policies,
    contact,
    menu,
  };
}
