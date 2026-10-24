import { cache } from "react";
import { catalogPhotoUrl, publicMediaUrl } from "@/lib/storage";
import { getSupabaseServerClient } from "@/lib/supabase";

// Catálogo público con la forma que usan las pantallas copiadas de la app móvil.
// Los precios llegan en centavos y aquí se pasan a dólares una sola vez.

export type CatalogCategory = {
  id: string;
  label: string;
  resultsNoun: string;
  resultsNounSingular: string;
  priceUnit: "per_night" | "per_person_avg" | "per_person" | "from";
};

export type CatalogItem = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  searchDescription: string;
  description: string;
  isRecommended: boolean;
  photo: string | null;
  price: number;
  rating: number;
  ratingCount: number;
  provinceId: string | null;
  siteId: string | null;
  siteName: string | null;
  siteSlug: string | null;
  siteIds: string[];
  hospedajeTypeId: string | null;
  hospedajeTypeLabel: string | null;
  mealPlanId: string | null;
  amenityIds: string[];
};

export type CatalogSite = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  provinceId: string | null;
  regionId: string;
  zoneId: string | null;
  photo: string | null;
  photoIsIllustrative: boolean;
  mapsEmbedUrl: string | null;
};

export type CatalogDestination = {
  id: string;
  slug: string;
  provinceId: string;
  name: string;
  subtitle: string;
  description: string;
  cardImage: string | null;
  bannerImage: string | null;
  mapsEmbedUrl: string | null;
};

type ServiceRow = {
  id: string;
  slug: string | null;
  category_id: string;
  name: string;
  search_description: string | null;
  description: string | null;
  is_recommended: boolean;
  base_price_cents: number | null;
  cached_price_from_cents: number | null;
  rating_avg: number | string | null;
  rating_count: number | null;
  destination_province_id: string | null;
  tourist_site_id: string | null;
  hospedaje_type_id: string | null;
  meal_plan_id: string | null;
  hospedaje_types: { label: string } | null;
  tourist_sites: { slug: string; name: string; province_id: string | null } | null;
  service_photos: { storage_path: string; is_cover: boolean; position: number }[];
  service_amenities: { amenity_id: string }[];
  service_tourist_sites: { tourist_site_id: string }[];
};

const SERVICE_SELECT = `
  id, slug, category_id, name, search_description, description, is_recommended,
  base_price_cents, cached_price_from_cents, rating_avg, rating_count,
  destination_province_id, tourist_site_id, hospedaje_type_id, meal_plan_id,
  hospedaje_types(label),
  tourist_sites!services_tourist_site_id_fkey(slug, name, province_id),
  service_photos(storage_path, is_cover, position),
  service_amenities(amenity_id),
  service_tourist_sites(tourist_site_id)
`;

// Elige la portada: la marcada como tal o la primera por posición.
export function coverPath<T extends { is_cover?: boolean; position: number }>(photos: T[]) {
  return [...photos].sort((a, b) =>
    Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)) || a.position - b.position)[0];
}

function adaptService(row: ServiceRow): CatalogItem {
  const cover = coverPath(row.service_photos ?? []);
  const priceCents = row.cached_price_from_cents ?? row.base_price_cents ?? 0;
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    categoryId: row.category_id,
    name: row.name,
    searchDescription: row.search_description ?? "",
    description: row.description ?? "",
    isRecommended: row.is_recommended,
    photo: cover ? publicMediaUrl(cover.storage_path) || null : null,
    price: priceCents / 100,
    rating: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    provinceId: row.destination_province_id ?? row.tourist_sites?.province_id ?? null,
    siteId: row.tourist_site_id,
    siteName: row.tourist_sites?.name ?? null,
    siteSlug: row.tourist_sites?.slug ?? null,
    siteIds: [
      ...new Set([
        ...(row.tourist_site_id ? [row.tourist_site_id] : []),
        ...(row.service_tourist_sites ?? []).map((link) => link.tourist_site_id),
      ]),
    ],
    hospedajeTypeId: row.hospedaje_type_id,
    hospedajeTypeLabel: row.hospedaje_types?.label ?? null,
    mealPlanId: row.meal_plan_id,
    amenityIds: (row.service_amenities ?? []).map((amenity) => amenity.amenity_id),
  };
}

// Lugar que se muestra bajo el nombre: "sitio, provincia" o solo la provincia.
export function formatPlace(item: Pick<CatalogItem, "siteName" | "provinceId">): string {
  if (item.siteName && item.provinceId && item.siteName !== item.provinceId) {
    return `${item.siteName}, ${item.provinceId}`;
  }
  return item.siteName ?? item.provinceId ?? "Panamá";
}

export const getCategories = cache(async (): Promise<CatalogCategory[]> => {
  const { data } = await getSupabaseServerClient()
    .from("categories")
    .select("id, label, results_noun, results_noun_singular, price_unit")
    .order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    resultsNoun: row.results_noun,
    resultsNounSingular: row.results_noun_singular,
    priceUnit: row.price_unit,
  }));
});

export const getServices = cache(async (): Promise<CatalogItem[]> => {
  const { data, error } = await getSupabaseServerClient()
    .from("services")
    .select(SERVICE_SELECT)
    .eq("status", "published")
    .order("is_recommended", { ascending: false })
    .order("rating_avg", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ServiceRow[]).map(adaptService);
});

export const getTouristSites = cache(async (): Promise<CatalogSite[]> => {
  const { data } = await getSupabaseServerClient()
    .from("tourist_sites")
    .select(`id, slug, name, description, short_description, province_id, region_id, zone_id,
      photo_storage_path, photo_is_illustrative, maps_embed_url`)
    .order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    shortDescription: row.short_description ?? row.description ?? "",
    provinceId: row.province_id,
    regionId: row.region_id ?? row.province_id ?? "",
    zoneId: row.zone_id,
    photo: catalogPhotoUrl(row.photo_storage_path) || null,
    photoIsIllustrative: Boolean(row.photo_is_illustrative),
    mapsEmbedUrl: row.maps_embed_url,
  }));
});

export type CatalogOption = { id: string; label: string };

// Tipos de hospedaje y planes de comida para los filtros, en el orden del panel.
export const getLodgingOptions = cache(async () => {
  const supabase = getSupabaseServerClient();
  const [types, plans] = await Promise.all([
    supabase.from("hospedaje_types").select("id, label").order("sort_order"),
    supabase.from("meal_plans").select("id, label").order("sort_order"),
  ]);
  return {
    hospedajeTypes: (types.data ?? []) as CatalogOption[],
    mealPlans: (plans.data ?? []) as CatalogOption[],
  };
});

export const getDestinations = cache(async (): Promise<CatalogDestination[]> => {
  const { data } = await getSupabaseServerClient()
    .from("destinations")
    .select(`id, slug, province_id, name, subtitle, description, card_image_storage_path,
      banner_image_storage_path, maps_embed_url`)
    .order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    provinceId: row.province_id,
    name: row.name,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    cardImage: publicMediaUrl(row.card_image_storage_path, "destination-media") || null,
    bannerImage: publicMediaUrl(row.banner_image_storage_path, "destination-media") || null,
    mapsEmbedUrl: row.maps_embed_url,
  }));
});
