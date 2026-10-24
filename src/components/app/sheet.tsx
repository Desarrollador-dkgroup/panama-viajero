"use client";

import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import styles from "./sheet.module.css";

// Panel a pantalla completa de la app (Modal con animación desde abajo). En escritorio se
// muestra como un panel lateral a la derecha.
export function Sheet({ title, subtitle, onClose, footer, children }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}
            aria-label="Cerrar">
            <IoClose size={20} color="var(--text-strong)" aria-hidden />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

// Fila con botón redondo de opción única, como en los paneles Filtrar y Ordenar.
export function RadioRow({ label, selected, onSelect }: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={styles.radioRow} onClick={onSelect} aria-pressed={selected}>
      <span className={styles.radioLabel}>{label}</span>
      <span className={styles.radioOuter}>{selected && <span className={styles.radioInner} />}</span>
    </button>
  );
}

export function Chip({ label, selected, onSelect }: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.chipSelected : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export const sheetStyles = styles;
