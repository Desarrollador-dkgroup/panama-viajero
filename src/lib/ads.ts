import type { AdItem } from "@/components/app/ads/ads-banner";
import { publicMediaUrl } from "@/lib/storage";
import { getSupabaseServerClient } from "@/lib/supabase";

type PromoRef = {
  services: { slug: string } | { slug: string }[] | null;
  room_types: { slug: string } | { slug: string }[] | null;
} | null;

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

// Adonde lleva el anuncio: la habitación si la promo es de una habitación; si no, el servicio.
export function adDestination(promo: PromoRef): string | null {
  const service = first(promo?.services);
  if (!service?.slug) return null;
  const room = first(promo?.room_types);
  return room?.slug
    ? `/servicios/${service.slug}/habitaciones/${room.slug}`
    : `/servicios/${service.slug}`;
}

// Anuncios activos en orden. Solo llegan los vigentes hoy (RLS).
export async function getActiveAds(): Promise<AdItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ads")
    .select("id, title, image_path, desktop_image_path, service_promotions(room_type_id, services(slug), room_types(slug))")
    .order("position");
  if (error) return [];
  return (data ?? []).map((ad) => {
    const promo = first(ad.service_promotions as unknown as PromoRef[]);
    return {
      id: ad.id,
      title: ad.title,
      imageUrl: publicMediaUrl(ad.image_path, "ads-media"),
      // Sin imagen de escritorio (anuncios anteriores), se usa la de celular.
      desktopImageUrl: publicMediaUrl(ad.desktop_image_path, "ads-media")
        || publicMediaUrl(ad.image_path, "ads-media"),
      promoHref: adDestination(promo),
    };
  });
}
