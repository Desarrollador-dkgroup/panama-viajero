import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { CatalogError } from "@/components/app/catalog-status";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { BookingBar } from "@/components/app/service/bottom-bars";
import { PhotoGallery } from "@/components/app/service/gallery";
import { BackButton } from "@/components/app/back-button";
import styles from "@/components/app/service/service.module.css";
import { attempt } from "@/lib/attempt";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

// Detalle de una atracción de la actividad: solo para ver; la reserva es de la actividad.
export default async function AttractionPage({ params }: {
  params: Promise<{ slug: string; attraction: string }>;
}) {
  const { slug, attraction: attractionKey } = await params;
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const attractions = result.data?.activity?.attractions ?? [];
  const index = attractions.findIndex((candidate, idx) =>
    (candidate.id ?? String(idx)) === attractionKey);
  const attraction = index >= 0 ? attractions[index] : undefined;
  if (!result.data || !attraction) {
    return <NotFoundScreen message="No encontramos esta atracción." />;
  }

  const photos = (attraction.photos ?? [])
    .map((photo) => photo.storage_path)
    .filter((url): url is string => Boolean(url));

  return (
    <div className={styles.screen}>
      <div className={styles.heroWrap}>
        <PhotoGallery photos={photos} className={styles.heroTall} />
        <div className={styles.fixedBack}><BackButton onPhoto /></div>
      </div>
      <div className={styles.layout}>
        <div className={styles.sheet}>
          <h1 className={styles.name}>{attraction.name}</h1>
          {attraction.description && (
            <p className={styles.description}>{attraction.description}</p>
          )}
          {attraction.options.length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.headingLarge}>Qué verás</h2>
                <div className={styles.roomAmenities}>
                  {attraction.options.map((option) => (
                    <span key={option} className={styles.roomAmenity}>
                      <IoCheckmarkCircleOutline size={18} color="var(--indigo)" aria-hidden />
                      {option}
                    </span>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
        <aside className={styles.barSlot}>
          <BookingBar href={`/servicios/${result.data.item.slug}/solicitar`}
            priceLine={`$${result.data.item.price} / persona`} />
        </aside>
      </div>
    </div>
  );
}
