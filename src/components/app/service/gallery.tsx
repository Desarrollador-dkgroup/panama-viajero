"use client";

import { useRef, useState } from "react";
import { PhotoPlaceholder } from "@/components/app/ui";
import styles from "./service.module.css";

// Galería deslizable de la ficha (src/components/service-detail/photo-gallery.tsx).
export function PhotoGallery({ photos, indicator = "dots", className = "" }: {
  photos: string[];
  indicator?: "dots" | "counter";
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return <PhotoPlaceholder className={`${styles.gallery} ${className}`} />;

  return (
    <div className={`${styles.gallery} ${className}`}>
      <div
        ref={track}
        className={`${styles.galleryTrack} no-scrollbar`}
        onScroll={(event) => {
          const element = event.currentTarget;
          setActive(Math.round(element.scrollLeft / element.clientWidth));
        }}
      >
        {photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={photo} src={photo} alt="" className={styles.galleryImage}
            loading={index === 0 ? "eager" : "lazy"} />
        ))}
      </div>
      {photos.length > 1 && indicator === "counter" && (
        <span className={styles.counter}>{active + 1}/{photos.length}</span>
      )}
      {photos.length > 1 && indicator === "dots" && (
        <div className={styles.dots}>
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              aria-label={`Foto ${index + 1}`}
              className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
              onClick={() => track.current?.scrollTo({
                left: index * track.current.clientWidth,
                behavior: "smooth",
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
