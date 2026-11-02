import type { AdItem } from "@/components/app/ads/ads-banner";
import { publicMediaUrl } from "@/lib/storage";
import { getSupabaseServerClient } from "@/lib/supabase";

// Anuncios activos en orden. Solo llegan los vigentes hoy (RLS).
export async function getActiveAds(): Promise<AdItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ads")
    .select("id, title, image_path, service_promotion_id")
    .order("position");
  if (error) return [];
  return (data ?? []).map((ad) => ({
    id: ad.id,
    title: ad.title,
    imageUrl: publicMediaUrl(ad.image_path, "ads-media"),
    promoHref: ad.service_promotion_id ? `/promociones#promo-${ad.service_promotion_id}` : null,
  }));
}
