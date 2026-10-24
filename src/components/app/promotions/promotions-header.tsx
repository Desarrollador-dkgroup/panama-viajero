"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import styles from "./promotions.module.css";

// Cabecera índigo de Promociones (src/app/promotions.tsx).
export function PromotionsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const router = useRouter();
  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.headerBack}
        aria-label="Volver"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      >
        <IoArrowBack size={22} color="#FFFFFF" aria-hidden />
      </button>
      <div className={styles.headerText}>
        <h1 className={styles.headerTitle}>{title}</h1>
        <p className={styles.headerSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
