import Link from "next/link";
import { IoCalendarOutline } from "react-icons/io5";
import styles from "./service.module.css";

// Barras inferiores de la ficha (reserve-bar.tsx y booking-bar.tsx). En escritorio se
// muestran como una tarjeta fija a la derecha.

export function ReserveBar({ href, summary, priceLine, label = "Reservar" }: {
  href: string;
  summary?: string;
  priceLine?: string;
  label?: string;
}) {
  return (
    <div className={styles.bar}>
      {(summary || priceLine) && (
        <div className={styles.barLines}>
          {summary && <span className={styles.barSummary}>{summary}</span>}
          {priceLine && <span className={styles.barPriceLine}>{priceLine}</span>}
        </div>
      )}
      <Link href={href} className={styles.reserveButton} aria-label={label}>
        <IoCalendarOutline size={20} color="#FFFFFF" aria-hidden />
        Reservar
      </Link>
    </div>
  );
}

export function BookingBar({ href, priceLine }: { href: string; priceLine?: string }) {
  return (
    <div className={styles.bar}>
      {priceLine && (
        <div className={styles.barLines}>
          <span className={styles.barPriceLine}>{priceLine}</span>
        </div>
      )}
      <Link href={href} className={styles.reserveButton}>Reservar</Link>
    </div>
  );
}
