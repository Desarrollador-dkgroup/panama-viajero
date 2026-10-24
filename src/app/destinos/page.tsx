import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";
import { BackButton } from "@/components/app/back-button";
import { CatalogError } from "@/components/app/catalog-status";
import styles from "@/components/app/places/places.module.css";
import { CoverPhoto } from "@/components/app/ui";
import { attempt } from "@/lib/attempt";
import { getDestinations, getServices, getTouristSites } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Destinos | Panamá Viajero" };

// "Ver todo" de Destinos populares (src/app/cities.tsx): un destino por provincia.
export default async function DestinationsPage() {
  const result = await attempt(() =>
    Promise.all([getDestinations(), getTouristSites(), getServices()]));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const [destinations, sites, services] = result.data;

  return (
    <div className={styles.listScreen}>
      <div className={styles.listHeader}>
        <BackButton />
        <h1 className={styles.listTitle}>Destinos</h1>
      </div>
      <div className={styles.listContent}>
        {destinations.map((destination) => {
          const siteCount = sites.filter((site) =>
            (site.provinceId ?? site.regionId) === destination.provinceId).length;
          const placeCount = services.filter((item) =>
            item.provinceId === destination.provinceId).length;
          return (
            <Link key={destination.id} href={`/destinos/${destination.slug}`}
              className={styles.row}>
              <span className={styles.rowThumb}><CoverPhoto src={destination.cardImage} /></span>
              <span className={styles.rowText}>
                <span className={styles.rowName}>{destination.name}</span>
                <span className={styles.rowMeta}>
                  {destination.subtitle ? `${destination.subtitle} · ` : ""}
                  {siteCount} {siteCount === 1 ? "sitio" : "sitios"} · {placeCount}{" "}
                  {placeCount === 1 ? "lugar" : "lugares"}
                </span>
              </span>
              <IoChevronForward size={18} color="var(--text-muted)" aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
