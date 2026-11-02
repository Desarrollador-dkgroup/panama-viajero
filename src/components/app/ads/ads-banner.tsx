"use client";

import Link from "next/link";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import styles from "./ads-banner.module.css";

export type AdItem = {
  id: string;
  title: string;
  imageUrl: string;
  promoHref: string | null;
};

// Anuncios que se muestran al entrar a la página principal. Se cierran con la X.
export function AdsBanner({ ads }: { ads: AdItem[] }) {
  const [open, setOpen] = useState(ads.length > 0);
  const [index, setIndex] = useState(0);
  if (!open || ads.length === 0) return null;

  const ad = ads[index];
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Anuncio">
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Cerrar anuncio"
          onClick={() => setOpen(false)}>
          <IoClose size={22} color="#FFFFFF" aria-hidden />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt={ad.title} className={styles.image} />
        {ads.length > 1 && (
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
