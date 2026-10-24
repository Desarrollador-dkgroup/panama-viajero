import type { Metadata } from "next";
import { BackButton } from "@/components/app/back-button";
import { CatalogError } from "@/components/app/catalog-status";
import { ResultCard } from "@/components/app/category/result-card";
import categoryStyles from "@/components/app/category/category.module.css";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { ExploreGrid } from "@/components/app/places/places";
import styles from "@/components/app/places/places.module.css";
import { CoverPhoto } from "@/components/app/ui";
import { attempt } from "@/lib/attempt";
import { getServices, getTouristSites } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await attempt(getTouristSites);
  const site = result.data?.find((item) => item.slug === slug);
  return {
    title: site ? `${site.name} | Panamá Viajero` : "Panamá Viajero",
    description: site?.shortDescription || undefined,
  };
}

// Sitio turístico (src/app/destination/[siteId].tsx) con sus servicios publicados.
export default async function TouristSitePage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => Promise.all([getTouristSites(), getServices()]));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const [sites, services] = result.data;
  const site = sites.find((item) => item.slug === slug || item.id === slug);
  if (!site) return <NotFoundScreen message="No encontramos este destino." />;

  const forward = new URLSearchParams();
  for (const key of ["checkIn", "checkOut", "guests"]) {
    if (search[key]) forward.set(key, search[key] as string);
  }
  const explore = new URLSearchParams(forward);
  explore.set("region", site.provinceId ?? site.regionId);
  explore.set("touristSite", site.id);
  const here = services.filter((item) => item.siteIds.includes(site.id));

  return (
    <div className={styles.siteScreen}>
      <div className={styles.siteHero}>
        <CoverPhoto src={site.photo} alt={site.name} />
        {site.photo && site.photoIsIllustrative && (
          <span className={styles.siteHeroTag}>Imagen ilustrativa · no verificada</span>
        )}
        <div className={styles.fixedBack}><BackButton onPhoto /></div>
      </div>
      <div className={styles.siteSheet}>
        <h1 className={styles.siteTitle}>{site.name}</h1>
        <p className={styles.siteText}>{site.shortDescription}</p>
        {site.description && site.description !== site.shortDescription && (
          <p className={styles.siteText}>{site.description}</p>
        )}
        <div className={styles.divider} />
        <h2 className={styles.heading}>¿Qué quieres explorar en {site.name}?</h2>
        <ExploreGrid query={explore} />

        {here.length > 0 && (
          <>
            <div className={styles.divider} />
            <h2 className={styles.heading}>Lugares en {site.name}</h2>
            <div className={categoryStyles.list}>
              {here.map((item) => (
                <ResultCard key={item.id} item={item}
                  href={`/servicios/${item.slug}${forward.size ? `?${forward}` : ""}`} />
              ))}
            </div>
          </>
        )}

        {site.mapsEmbedUrl && (
          <>
            <div className={styles.divider} />
            <h2 className={styles.heading}>Ubicación</h2>
            <iframe title={`Mapa de ${site.name}`} src={site.mapsEmbedUrl} className={styles.map}
              loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </>
        )}
      </div>
    </div>
  );
}
