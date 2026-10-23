import { getSupabaseServerClient } from "@/lib/supabase";
import { publicMediaUrl } from "@/lib/storage";

export type DestinationRecord = {
  slug: string;
  provinceId: string;
  name: string;
  subtitle: string;
  description: string;
  cardImage: string;
  bannerImage: string;
  mapsEmbedUrl: string;
};

// Slugs antiguos del sitio que deben seguir funcionando (enlaces ya compartidos).
const LEGACY_SLUGS: Record<string, string> = {
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

const FALLBACK_IMAGE = "/P-Principal/Banner.png";

type DestinationRow = {
  slug: string;
  province_id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  card_image_storage_path: string | null;
  banner_image_storage_path: string | null;
  maps_embed_url: string | null;
};

const COLUMNS =
  "slug, province_id, name, subtitle, description, card_image_storage_path, " +
  "banner_image_storage_path, maps_embed_url";

function toRecord(row: DestinationRow): DestinationRecord {
  const card = publicMediaUrl(row.card_image_storage_path, "destination-media");
  const banner = publicMediaUrl(row.banner_image_storage_path, "destination-media");
  return {
    slug: row.slug,
    provinceId: row.province_id,
    name: row.name,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    cardImage: card || banner || FALLBACK_IMAGE,
    bannerImage: banner || card || FALLBACK_IMAGE,
    mapsEmbedUrl: row.maps_embed_url ?? "",
  };
}

// Destinos creados en el panel, en el orden que define el equipo.
export async function getDestinations(): Promise<DestinationRecord[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("destinations")
    .select(COLUMNS)
    .order("sort_order")
    .order("name");
  if (error || !data) return [];
  return (data as unknown as DestinationRow[]).map(toRecord);
}

// Busca un destino por su slug o por los slugs antiguos del sitio.
export async function getDestination(slug: string): Promise<DestinationRecord | null> {
  const supabase = getSupabaseServerClient();
  const bySlug = await supabase.from("destinations").select(COLUMNS).eq("slug", slug)
    .maybeSingle();
  if (bySlug.data) return toRecord(bySlug.data as unknown as DestinationRow);

  const provinceId = LEGACY_SLUGS[slug];
  if (!provinceId) return null;
  const byProvince = await supabase.from("destinations").select(COLUMNS)
    .eq("province_id", provinceId).maybeSingle();
  return byProvince.data ? toRecord(byProvince.data as unknown as DestinationRow) : null;
}

// Slug del destino de una provincia, para volver desde un sitio turístico.
export async function getDestinationSlug(provinceId: string | null): Promise<string | null> {
  if (!provinceId) return null;
  const { data } = await getSupabaseServerClient()
    .from("destinations").select("slug").eq("province_id", provinceId).maybeSingle();
  return data?.slug ?? null;
}
