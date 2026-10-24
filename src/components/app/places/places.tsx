import Link from "next/link";
import { CoverPhoto, PhotoPlaceholder } from "@/components/app/ui";
import type { CatalogSite } from "@/lib/catalog";
import styles from "./places.module.css";

// Tarjeta de sitio turístico (src/components/tourist-sites/tourist-site-card.tsx).
export function TouristSiteCard({ site, query = "" }: { site: CatalogSite; query?: string }) {
  return (
    <Link href={`/sitios-turisticos/${site.slug}${query}`} className={styles.siteCard}>
      <span className={styles.siteThumb}>
        {site.photo ? <CoverPhoto src={site.photo} /> : <PhotoPlaceholder className={styles.fill} />}
        {site.photo && site.photoIsIllustrative && (
          <span className={styles.illustrativeBadge}>Ilustrativa</span>
        )}
      </span>
      <span className={styles.siteInfo}>
        <span className={styles.siteName}>{site.name}</span>
        <span className={styles.siteDescription}>{site.shortDescription}</span>
      </span>
    </Link>
  );
}

const CATEGORY_TILES = [
  { id: "hospedaje", label: "Hospedaje" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "actividades", label: "Actividades" },
  { id: "transporte", label: "Transporte" },
  { id: "tour-operador", label: "Tour-operador" },
  { id: "otras", label: "Otras" },
];

// Cuadrícula de categorías con íconos ilustrados (variante "outlined" de la app).
export function ExploreGrid({ query }: { query: URLSearchParams }) {
  return (
    <div className={styles.categoryGrid}>
      {CATEGORY_TILES.map((tile) => (
        <Link key={tile.id} href={`/categoria/${tile.id}?${query}`} className={styles.categoryTile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/app/home/icon-${tile.id}.png`} alt="" />
          <span className={styles.categoryLabel}>{tile.label}</span>
        </Link>
      ))}
    </div>
  );
}
