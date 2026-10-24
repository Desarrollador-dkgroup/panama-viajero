"use client";

import { useRouter } from "next/navigation";
import { IoCloudOfflineOutline } from "react-icons/io5";
import styles from "./catalog-status.module.css";

// Estados de carga y error del catálogo (src/components/catalog/catalog-status.tsx).

export function CatalogLoading() {
  return (
    <div className={styles.center}>
      <span className={styles.spinner} aria-hidden />
      <p className={styles.loadingText}>Cargando catálogo…</p>
    </div>
  );
}

export function CatalogError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className={styles.center}>
      <IoCloudOfflineOutline size={40} color="var(--photo-empty-icon)" aria-hidden />
      <p className={styles.errorTitle}>No pudimos cargar el catálogo</p>
      <p className={styles.errorBody}>{message}</p>
      <button type="button" className={styles.retryButton} onClick={() => router.refresh()}>
        Reintentar
      </button>
    </div>
  );
}
