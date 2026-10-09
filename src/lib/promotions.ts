import { getSupabaseServerClient } from "@/lib/supabase";

export type PromotionRecord = {
  id: string;
  slug: string;
  title: string;
  placeName: string;
  eyebrow: string;
  tags: string[];
  periodLabel: string;
  discountValue: string;
  discountSuffix: string;
  priceLine: string;
  photoPath: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  destinationKind: string;
  offerType: string;
};

type PromotionRow = {
  id: string;
  slug: string;
  title: string;
  place_name: string;
  eyebrow: string | null;
  tags: string | null;
  period_label: string;
  discount_value: string;
  discount_suffix: string | null;
  price_line: string | null;
  photo_storage_path: string;
  valid_from: string;
  valid_to: string;
  destination_kind: string;
  destination_category_id: string | null;
};

// Convierte las etiquetas almacenadas como texto en una lista reutilizable.
const splitTags = (value: string | null) => {
  if (!value) return [];
  return value.split("•").map((tag) => tag.trim()).filter(Boolean);
};

// Obtiene las promociones publicadas y calcula su vigencia actual.
export async function getPromotions(): Promise<PromotionRecord[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, slug, title, place_name, eyebrow, tags, period_label, discount_value, " +
      "discount_suffix, price_line, photo_storage_path, valid_from, valid_to, " +
      "destination_kind, destination_category_id, sort_order",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const now = Date.now();
  return (data as unknown as PromotionRow[]).map((promotion) => ({
    id: promotion.id,
    slug: promotion.slug,
    title: promotion.title,
    placeName: promotion.place_name,
    eyebrow: promotion.eyebrow ?? "",
    tags: splitTags(promotion.tags),
    periodLabel: promotion.period_label,
    discountValue: promotion.discount_value,
    discountSuffix: promotion.discount_suffix ?? "",
    priceLine: promotion.price_line ?? "Consulta la oferta",
    photoPath: promotion.photo_storage_path,
    validFrom: promotion.valid_from,
    validTo: promotion.valid_to,
    isActive: now >= Date.parse(promotion.valid_from)
      && now <= Date.parse(promotion.valid_to),
    destinationKind: promotion.destination_kind,
    offerType: promotion.destination_category_id === "restaurantes"
      ? "restaurantes" : promotion.destination_category_id === "transporte"
        ? "transporte" : promotion.destination_category_id === "actividades"
          ? "actividades" : promotion.destination_category_id === "tour-operador"
            ? "tours" : promotion.destination_kind === "service"
              ? "hospedajes" : "actividades",
  }));
}



