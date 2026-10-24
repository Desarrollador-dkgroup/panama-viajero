"use client";

import Link from "next/link";
import { IoChevronForward, IoHeart, IoHeartOutline, IoImageOutline } from "react-icons/io5";
import { toggleFavorite, useIsFavorite } from "@/lib/favorites";
import styles from "./ui.module.css";

// Piezas pequeñas compartidas por varias pantallas, copiadas de la app.

export function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.placeholder} ${className}`}>
      <IoImageOutline size={28} color="var(--photo-empty-icon)" aria-hidden />
    </div>
  );
}

// Foto que ocupa todo su contenedor, o el marcador vacío si no hay imagen.
export function CoverPhoto({ src, alt = "" }: { src: string | null; alt?: string }) {
  if (!src) return <PhotoPlaceholder className={styles.fill} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={styles.fillImage} loading="lazy" />;
}

export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {href && (
        <Link href={href} className={styles.seeAll}>
          Ver todo
          <IoChevronForward size={14} aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function IllustrativeTag() {
  return <span className={styles.illustrativeTag}>Foto ilustrativa</span>;
}

// Corazón de favoritos sobre la foto de una tarjeta.
export function FavoriteButton({ serviceId, className = "" }: {
  serviceId: string;
  className?: string;
}) {
  const isFavorite = useIsFavorite(serviceId);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(serviceId);
      }}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
      className={`${styles.favorite} ${className}`}
    >
      {isFavorite
        ? <IoHeart size={18} color="var(--coral)" aria-hidden />
        : <IoHeartOutline size={18} color="#FFFFFF" aria-hidden />}
    </button>
  );
}
