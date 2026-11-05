"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import styles from "./ads-banner.module.css";

export type AdItem = {
  id: string;
  title: string;
  imageUrl: string;
  promoHref: string | null;
};

// Tiempo que se muestra cada anuncio antes de pasar al siguiente.
const AUTO_ADVANCE_MS = 10000;

// Anuncios que se muestran al entrar a la página principal. Se cierran con la X.
// En escritorio tienen el mismo tamaño que en el celular. Cambian solos cada 10 segundos.
export function AdsBanner({ ads }: { ads: AdItem[] }) {
  const [open, setOpen] = useState(ads.length > 0);
  const [index, setIndex] = useState(0);
  const count = ads.length;

  useEffect(() => {
    if (!open || count < 2) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % count), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, open, count]);

  if (!open || count === 0) return null;

  const ad = ads[index];
  const go = (step: number) => setIndex((current) => (current + step + count) % count);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Anuncio">
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Cerrar anuncio"
          onClick={() => setOpen(false)}>
          <IoClose size={22} color="#FFFFFF" aria-hidden />
        </button>
        {count > 1 && (
          <>
            <button type="button" className={`${styles.nav} ${styles.navPrev}`}
              aria-label="Anuncio anterior" onClick={() => go(-1)}>
              <IoChevronBack size={22} color="#FFFFFF" aria-hidden />
            </button>
            <button type="button" className={`${styles.nav} ${styles.navNext}`}
              aria-label="Anuncio siguiente" onClick={() => go(1)}>
              <IoChevronForward size={22} color="#FFFFFF" aria-hidden />
            </button>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt={ad.title} className={styles.image} />
        {count > 1 && (
          <div className={styles.dots} aria-label="Anuncios">
            {ads.map((item, dot) => (
              <button key={item.id} type="button" aria-label={`Anuncio ${dot + 1}`}
                className={dot === index ? styles.dotActive : styles.dot}
                onClick={() => setIndex(dot)} />
            ))}
          </div>
        )}
        {ad.promoHref ? (
          <Link href={ad.promoHref} className={styles.button}
            onClick={() => setOpen(false)}>
            Descubrir
          </Link>
        ) : (
          <button type="button" className={styles.button} onClick={() => setOpen(false)}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
