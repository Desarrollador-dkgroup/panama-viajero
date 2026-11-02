import Link from "next/link";
import { IoArrowForward, IoCalendarOutline, IoLocation } from "react-icons/io5";
import type { ServicePromotion } from "@/lib/service-promotions";
import { formatMoney } from "@/lib/booking";
import styles from "./promotions.module.css";

// Tarjeta de una promoción de servicio. Lleva a la ficha del servicio donde aplica.
export function PromoCard({ promo }: { promo: ServicePromotion }) {
  const place = [promo.serviceName, promo.siteNames[0]].filter(Boolean).join(" · ");
  return (
    <article id={`promo-${promo.id}`} className={styles.card}
      aria-label={promo.title}>
      <div className={styles.photoFrame}>
        {promo.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={promo.photoUrl} alt={promo.title} className={styles.photo} loading="lazy" />
        ) : null}
        <div className={styles.topScrim} aria-hidden />
        <span className={styles.discountBadge}>-{promo.discountPct}%</span>
      </div>
      <div className={styles.body}>
        <span className={styles.placeRow}>
          <IoLocation size={13} color="var(--coral)" aria-hidden />
          <span className={styles.place}>{place}</span>
        </span>
        <h3 className={styles.title}>
          {promo.title}{promo.roomName ? ` · ${promo.roomName}` : ""}
        </h3>
        {promo.regularCents !== null && promo.finalCents !== null && (
          <p className={styles.priceLine}>
            <s>{formatMoney(promo.regularCents)}</s> {formatMoney(promo.finalCents)}
          </p>
        )}
        <span className={styles.infoRow}>
          <IoCalendarOutline size={15} color="var(--indigo)" aria-hidden />
          <span className={styles.infoText}>{promo.scheduleLabel}</span>
        </span>
        <Link href={`/servicios/${promo.serviceSlug}`}
          className={`${styles.button} ${styles.buttonActive}`}>
          Ver servicio
          <IoArrowForward size={18} color="#FFFFFF" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
