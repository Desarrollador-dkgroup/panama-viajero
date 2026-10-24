import type { Metadata } from "next";
import { BackButton } from "@/components/app/back-button";
import { CatalogError } from "@/components/app/catalog-status";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { ExploreGrid, TouristSiteCard } from "@/components/app/places/places";
import styles from "@/components/app/places/places.module.css";
import { attempt } from "@/lib/attempt";
import { getDestinations, getTouristSites } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await attempt(getDestinations);
  const destination = result.data?.find((item) => item.slug === slug);
  return { title: destination ? `${destination.name} | Panamá Viajero` : "Panamá Viajero" };
}

// Destino (provincia) con sus sitios turísticos (src/app/tourist-sites/[region].tsx).
export default async function DestinationPage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => Promise.all([getDestinations(), getTouristSites()]));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const [destinations, allSites] = result.data;
  const destination = destinations.find((item) => item.slug === slug || item.provinceId === slug);
  if (!destination) return <NotFoundScreen message="No encontramos este destino." />;

  const sites = allSites.filter((site) =>
    (site.provinceId ?? site.regionId) === destination.provinceId);
  const forward = new URLSearchParams();
  for (const key of ["checkIn", "checkOut", "guests"]) {
    if (search[key]) forward.set(key, search[key] as string);
  }
  const query = forward.size ? `?${forward}` : "";
  const explore = new URLSearchParams(forward);
  explore.set("region", destination.provinceId);
  const photo = destination.bannerImage ?? destination.cardImage;

  return (
    <div>
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo && <img src={photo} alt="" className={styles.heroImage} />}
        <div className={styles.heroScrimTop} aria-hidden />
        <div className={styles.heroScrimBottom} aria-hidden />
        <div className={styles.heroTopRow}>
          <span className={styles.darkBack}><BackButton fallback="/destinos" /></span>
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>{destination.name}</h1>
          {destination.subtitle && <p className={styles.heroTagline}>{destination.subtitle}</p>}
        </div>
      </div>

      <div className={styles.sheet}>
        {destination.description && <p className={styles.sheetText}>{destination.description}</p>}
        <h2 className={styles.sectionHeading}>Sitios turísticos</h2>
        {sites.length === 0 ? (
          <p className={styles.emptyState}>
            Aún no hay sitios turísticos registrados para {destination.name}.
          </p>
        ) : (
          <div className={styles.siteList}>
            {sites.map((site) => <TouristSiteCard key={site.id} site={site} query={query} />)}
          </div>
        )}
        <h2 className={styles.sectionHeading}>¿Qué quieres explorar en {destination.name}?</h2>
        <ExploreGrid query={explore} />
        {destination.mapsEmbedUrl && (
          <>
            <h2 className={styles.sectionHeading}>Mapa</h2>
            <iframe title={`Mapa de ${destination.name}`} src={destination.mapsEmbedUrl}
              className={styles.map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </>
        )}
      </div>
    </div>
  );
}
