"use client";

import { IoHeartOutline } from "react-icons/io5";
import { BackButton } from "@/components/app/back-button";
import { ResultCard } from "@/components/app/category/result-card";
import type { CatalogItem } from "@/lib/catalog";
import { useFavoriteIds, useFavoritesHydrated } from "@/lib/favorites";
import styles from "./favorites.module.css";

// Favoritos (src/app/favorites.tsx de la app).
export function FavoritesScreen({ services }: { services: CatalogItem[] }) {
  const ids = useFavoriteIds();
  const hydrated = useFavoritesHydrated();
  const items = ids
    .map((id) => services.find((item) => item.id === id))
    .filter((item): item is CatalogItem => Boolean(item));

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <BackButton fallback="/cuenta" />
        <h1 className={styles.title}>Favoritos</h1>
      </div>
      {hydrated && items.length === 0 ? (
        <div className={styles.emptyState}>
          <IoHeartOutline size={40} color="var(--photo-empty-icon)" aria-hidden />
          <p className={styles.emptyTitle}>Aún no tienes favoritos</p>
          <p className={styles.emptyBody}>
            Toca el corazón de cualquier servicio para guardarlo aquí.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <ResultCard key={item.id} item={item} href={`/servicios/${item.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
