"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type TouchEvent } from "react";
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
// Distancia mínima (px) de un deslizamiento para cambiar de anuncio.
const SWIPE_MIN_PX = 40;

// Anuncios que se muestran al entrar a la página principal. Se cierran con la X.
// En celular se cambia deslizando con el dedo; en escritorio, con las flechas.
// Cambian solos cada 10 segundos.
export function AdsBanner({ ads }: { ads: AdItem[] }) {
  const [open, setOpen] = useState(ads.length > 0);
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const count = ads.length;

  useEffect(() => {
    if (!open || count < 2) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % count), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, open, count]);

  if (!open || count === 0) return null;

  const go = (step: number) => setIndex((current) => (current + step + count) % count);
  const ad = ads[index];

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    swipeStart.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined) return;
    const distance = end - start;
    if (Math.abs(distance) >= SWIPE_MIN_PX) go(distance < 0 ? 1 : -1);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Anuncio">
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Cerrar anuncio"
          onClick={() => setOpen(false)}>
          <IoClose size={22} color="#FFFFFF" aria-hidden />
        </button>
        <div className={styles.viewport} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
            {ads.map((item) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={item.id} src={item.imageUrl} alt={item.title} className={styles.image} />
            ))}
          </div>
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
        </div>
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
