import Link from "next/link";
import { IoArrowForward, IoCalendarOutline, IoLocation } from "react-icons/io5";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { formatPromoValidity } from "@/components/app/promotions/promo-card";
import { PromotionsHeader } from "@/components/app/promotions/promotions-header";
import styles from "@/components/app/promotions/promotions.module.css";
import { getDestinations } from "@/lib/catalog";
import { getPromotions, type PromotionRecord } from "@/lib/promotions";
import { formatPromotionPrice } from "@/types/content";

export const dynamic = "force-dynamic";

// A dónde lleva la oferta: el servicio, el destino o la categoría (utils/promo-navigation.ts).
async function destinationHref(promo: PromotionRecord): Promise<string> {
  if (promo.destinationKind === "service" && promo.destinationServiceSlug) {
    return `/servicios/${promo.destinationServiceSlug}`;
  }
  if (promo.destinationKind === "province" && promo.destinationProvinceId) {
    const destination = (await getDestinations().catch(() => []))
      .find((item) => item.provinceId === promo.destinationProvinceId);
    return destination
      ? `/destinos/${destination.slug}`
      : `/categoria/hospedaje?region=${encodeURIComponent(promo.destinationProvinceId)}`;
  }
  return `/categoria/${promo.destinationCategoryId ?? "otras"}`;
}

// Detalle de una promoción, con lo que guarda el panel (descripción, condiciones, precios).
export default async function PromotionDetailPage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promo = (await getPromotions()).find((item) => item.slug === slug);
  if (!promo) return <NotFoundScreen message="No encontramos esta promoción." />;

  const href = await destinationHref(promo);
  const discount = [promo.discountValue, promo.discountSuffix].filter(Boolean).join(" ");
  const photo = promo.photoPath.startsWith("http") || promo.photoPath.startsWith("/")
    ? promo.photoPath : "/app/promo/promo-playa-isla-grande.jpg";

  return (
    <div className={styles.root}>
      <PromotionsHeader title={promo.title} subtitle={promo.placeName} />
      <div className={styles.content}>
        <article className={styles.card}>
          <div className={styles.photoFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={promo.title} className={styles.photo} />
            <div className={styles.topScrim} aria-hidden />
            {promo.isActive && discount && <span className={styles.discountBadge}>{discount}</span>}
          </div>
          <div className={styles.body}>
            <span className={styles.placeRow}>
              <IoLocation size={13} color="var(--coral)" aria-hidden />
              <span className={styles.place}>{promo.placeName}</span>
            </span>
            <h2 className={styles.title}>{promo.title}</h2>
            {promo.tags.length > 0 && <p className={styles.tags}>{promo.tags.join(" · ")}</p>}
            <span className={styles.infoRow}>
              <IoCalendarOutline size={15} color="var(--indigo)" aria-hidden />
              <span className={promo.isActive ? styles.infoText : styles.infoTextEnded}>
                {promo.isActive ? "Vigente" : "Finalizada"} ·{" "}
                {formatPromoValidity(promo.validFrom, promo.validTo)}
              </span>
            </span>

            {promo.promotionalPriceCents != null && (
              <div className={styles.priceBox}>
                <span className={styles.priceNew}>
                  {formatPromotionPrice(promo.promotionalPriceCents)}
                </span>
                {promo.regularPriceCents != null && (
                  <span className={styles.priceOld}>
                    {formatPromotionPrice(promo.regularPriceCents)}
                  </span>
                )}
              </div>
            )}
            {promo.promotionalPriceCents == null && promo.priceLine && (
              <p className={styles.priceLine}>{promo.priceLine}</p>
            )}

            {promo.description && <p className={styles.detailText}>{promo.description}</p>}
            {promo.inclusions.length > 0 && (
              <>
                <h3 className={styles.detailHeading}>Incluye</h3>
                <ul className={styles.detailList}>
                  {promo.inclusions.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </>
            )}
            {promo.exclusions.length > 0 && (
              <>
                <h3 className={styles.detailHeading}>No incluye</h3>
                <ul className={styles.detailList}>
                  {promo.exclusions.map((entry) => <li key={entry}>{entry}</li>)}
                </ul>
              </>
            )}
            {promo.scheduleDetails && (
              <>
                <h3 className={styles.detailHeading}>Horario</h3>
                <p className={styles.detailText}>{promo.scheduleDetails}</p>
              </>
            )}
            {promo.conditions && (
              <>
                <h3 className={styles.detailHeading}>Condiciones</h3>
                <p className={styles.detailText}>{promo.conditions}</p>
              </>
            )}

            <Link href={href} className={`${styles.button} ${styles.buttonActive}`}>
              {promo.isActive ? "Ver oferta" : "Ver destino"}
              <IoArrowForward size={18} color="#FFFFFF" aria-hidden />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
