"use client";

import Link from "next/link";
import {
  IoChevronForward,
  IoHeart,
  IoHeartOutline,
  IoLocationOutline,
  IoStar,
} from "react-icons/io5";
import { CoverPhoto } from "@/components/app/ui";
import { formatPlace, type CatalogItem } from "@/lib/catalog";
import { toggleFavorite, useIsFavorite } from "@/lib/favorites";
import styles from "./category.module.css";

// Tarjeta horizontal de resultados (src/components/category-results/result-card.tsx).
export function ResultCard({ item, href }: { item: CatalogItem; href: string }) {
  const isFavorite = useIsFavorite(item.id);
  const isLodging = item.categoryId === "hospedaje";

  return (
    <div className={styles.card}>
      <Link href={href} className={styles.cardLink} aria-label={`${item.name}, ${formatPlace(item)}`} />
      <div className={styles.photoWrap}>
        <CoverPhoto src={item.photo} />
        {item.isRecommended && <span className={styles.badge}>Top</span>}
        <button
          type="button"
          className={styles.favoriteButton}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(item.id)}
        >
          {isFavorite
            ? <IoHeart size={16} color="var(--coral)" aria-hidden />
            : <IoHeartOutline size={16} color="var(--coral)" aria-hidden />}
        </button>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.ratingRow}>
          <IoStar size={13} color="var(--star)" aria-hidden />
          <span className={styles.ratingText}>{item.rating.toFixed(1)}</span>
          {item.ratingCount > 0 && (
            <span className={styles.reviewCount}>
              · {item.ratingCount} {item.ratingCount === 1 ? "reseña" : "reseñas"}
            </span>
          )}
        </span>
        <span className={styles.locationRow}>
          <IoLocationOutline size={13} color="var(--text-muted)" aria-hidden />
          <span className={styles.location}>{formatPlace(item)}</span>
        </span>
        <span className={styles.description}>{item.searchDescription}</span>
        <span className={styles.priceRow}>
          <span className={styles.price}>
            {isLodging ? "Desde " : ""}${item.price}
            {isLodging && <span className={styles.priceUnit}> / noche</span>}
          </span>
          <span className={styles.chevronButton}>
            <IoChevronForward size={14} color="var(--indigo)" aria-hidden />
          </span>
        </span>
      </div>
    </div>
  );
}
