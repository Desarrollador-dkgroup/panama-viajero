import Link from "next/link";
import {
  IoArrowForward,
  IoCalendarOutline,
  IoInformationCircleOutline,
  IoLocation,
  IoTimeOutline,
} from "react-icons/io5";
import type { PromotionRecord } from "@/lib/promotions";
import styles from "./promotions.module.css";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "1 – 30 jun 2026" o "15 jun – 10 jul 2026", como en la app (fechas guardadas en UTC).
export function formatPromoValidity(validFrom: string, validTo: string): string {
  const from = new Date(validFrom);
  const to = new Date(validTo);
  const toText = `${to.getUTCDate()} ${MONTHS[to.getUTCMonth()]} ${to.getUTCFullYear()}`;
  if (from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth()) {
    return `${from.getUTCDate()} – ${toText}`;
  }
  const fromText = `${from.getUTCDate()} ${MONTHS[from.getUTCMonth()]}`;
  return from.getUTCFullYear() === to.getUTCFullYear()
    ? `${fromText} – ${toText}`
    : `${fromText} ${from.getUTCFullYear()} – ${toText}`;
}

// Tarjeta de promoción (src/components/promotions/promo-card.tsx), en modo foto.
export function PromoCard({ promo, href }: { promo: PromotionRecord; href: string }) {
  const active = promo.isActive;
  const discount = [promo.discountValue, promo.discountSuffix].filter(Boolean).join(" ");
  const photo = promo.photoPath.startsWith("http") || promo.photoPath.startsWith("/")
    ? promo.photoPath : "/app/promo/promo-playa-isla-grande.jpg";

  return (
    <article className={styles.card} aria-label={`${promo.title}${active ? "" : ", finalizada"}`}>
      <div className={styles.photoFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={promo.title} className={styles.photo} loading="lazy" />
        <div className={styles.topScrim} aria-hidden />
        {!active && <div className={styles.dim} aria-hidden />}
        {active ? (
          discount && <span className={styles.discountBadge}>{discount}</span>
        ) : (
          <span className={styles.endedBadge}>
            <IoTimeOutline size={14} color="#FFFFFF" aria-hidden /> Finalizada
          </span>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.placeRow}>
          <IoLocation size={13} color="var(--coral)" aria-hidden />
          <span className={styles.place}>{promo.placeName}</span>
        </span>
        <h3 className={styles.title}>{promo.title}</h3>
        {promo.tags.length > 0 && <p className={styles.tags}>{promo.tags.join(" · ")}</p>}
        <span className={styles.infoRow}>
          <IoCalendarOutline size={15} color={active ? "var(--indigo)" : "var(--text-muted)"}
            aria-hidden />
          <span className={active ? styles.infoText : styles.infoTextEnded}>
            {active ? "Vigente" : "Finalizada"} · {formatPromoValidity(promo.validFrom, promo.validTo)}
          </span>
        </span>
        {active && promo.priceLine && <p className={styles.priceLine}>{promo.priceLine}</p>}
        {promo.periodLabel && (
          <span className={styles.noticeRow}>
            <IoInformationCircleOutline size={13} color="var(--text-muted)" aria-hidden />
            <span className={styles.noticeText}>{promo.periodLabel}</span>
          </span>
        )}
        <Link href={href} className={`${styles.button} ${active ? styles.buttonActive
          : styles.buttonEnded}`}>
          {active ? "Ver oferta" : "Ver destino"}
          <IoArrowForward size={18} color={active ? "#FFFFFF" : "var(--indigo)"} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
