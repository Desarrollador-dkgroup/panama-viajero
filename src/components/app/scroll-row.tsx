"use client";

import { type ReactNode, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import styles from "./scroll-row.module.css";

// Carrusel horizontal con flechas en escritorio. En celular y tableta se desliza con el dedo.
export function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={`${styles.arrow} ${styles.left}`}
        aria-label="Desplazar a la izquierda" onClick={() => scroll(-1)}>
        <IoChevronBack size={18} aria-hidden />
      </button>
      <div ref={ref} className={className}>{children}</div>
      <button type="button" className={`${styles.arrow} ${styles.right}`}
        aria-label="Desplazar a la derecha" onClick={() => scroll(1)}>
        <IoChevronForward size={18} aria-hidden />
      </button>
    </div>
  );
}
