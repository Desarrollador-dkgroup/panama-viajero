import { formatPromotionDiscount, formatPromotionPrice } from "@/types/content";
import type { PromotionDatabaseContent } from "@/types/content";
import { catalogPhotoUrl } from "@/lib/storage";
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
  description: string | null;
  conditions: string | null;
  inclusions: string[];
  exclusions: string[];
  scheduleDetails: string | null;
  regularPriceCents: number | null;
  promotionalPriceCents: number | null;
  discountPercent: number | null;
  currency: "USD";
};

type PromotionRow = Partial<PromotionDatabaseContent> & {
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
  services?: { category_id: string } | null;
};

// Convierte las etiquetas almacenadas como texto en una lista reutilizable.
const splitTags = (value: string | null) => {
  if (!value) return [];
  return value
    .split("•")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

// Obtiene las promociones publicadas y calcula su vigencia actual.
export async function getPromotions(): Promise<PromotionRecord[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    // Incluye los nuevos campos cuando existan y mantiene la lectura previa a la migración.
    .select("*, services:destination_service_id(category_id)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const now = Date.now();
  return (data as unknown as PromotionRow[]).map((promotion) => mapPromotion(promotion, now));
}

// Transforma campos de Supabase y conserva ofertas anteriores sin inventar precios.
export function mapPromotion(promotion: PromotionRow, now: number): PromotionRecord {
  const category = promotion.destination_category_id ?? promotion.services?.category_id;
  return {
    id: promotion.id,
    slug: promotion.slug,
    title: promotion.title,
    placeName: promotion.place_name,
    eyebrow: promotion.eyebrow ?? "",
    tags: splitTags(promotion.tags),
    periodLabel: promotion.period_label,
    discountValue:
      promotion.discount_percent != null
        ? formatPromotionDiscount(Number(promotion.discount_percent))
        : promotion.discount_value,
    discountSuffix: promotion.discount_percent != null ? "" : (promotion.discount_suffix ?? ""),
    priceLine:
      promotion.promotional_price_cents != null
        ? formatPromotionPrice(promotion.promotional_price_cents)
        : (promotion.price_line ?? "Consulta la oferta"),
    photoPath: catalogPhotoUrl(promotion.photo_storage_path),
    validFrom: promotion.valid_from,
    validTo: promotion.valid_to,
    isActive: now >= Date.parse(promotion.valid_from) && now <= Date.parse(promotion.valid_to),
    description: promotion.description ?? null,
    conditions: promotion.conditions ?? null,
    inclusions: promotion.inclusions ?? [],
    exclusions: promotion.exclusions ?? [],
    scheduleDetails: promotion.schedule_details ?? null,
    regularPriceCents: promotion.regular_price_cents ?? null,
    promotionalPriceCents: promotion.promotional_price_cents ?? null,
    discountPercent: promotion.discount_percent == null ? null : Number(promotion.discount_percent),
    currency: promotion.currency ?? "USD",
    destinationKind: promotion.destination_kind,
    offerType:
      category === "restaurantes"
        ? "restaurantes"
        : category === "transporte"
          ? "transporte"
          : category === "actividades"
            ? "actividades"
            : category === "tour-operador"
              ? "tours"
              : promotion.destination_kind === "service"
                ? "hospedajes"
                : "actividades",
  };
}
