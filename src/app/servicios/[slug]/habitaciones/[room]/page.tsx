import {
  IoBedOutline,
  IoCheckmarkCircleOutline,
  IoExpandOutline,
  IoPeopleOutline,
  IoWaterOutline,
} from "react-icons/io5";
import { CatalogError } from "@/components/app/catalog-status";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { BookingBar } from "@/components/app/service/bottom-bars";
import { PhotoGallery } from "@/components/app/service/gallery";
import { BackButton } from "@/components/app/back-button";
import { PolicyList } from "@/components/app/service/service-sections";
import styles from "@/components/app/service/service.module.css";
import { attempt } from "@/lib/attempt";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

const DETAIL_LABELS: Record<string, string> = {
  view: "Vista",
  floor: "Piso",
  accessibility: "Accesibilidad",
  apartment_type: "Tipo",
  balcony_terrace: "Balcón o terraza",
  living_dining: "Sala y comedor",
};

// Detalle de una habitación (src/app/room/[roomId].tsx de la app).
export default async function RoomPage({ params, searchParams }: {
  params: Promise<{ slug: string; room: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug, room: roomSlug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const room = result.data?.rooms.find((candidate) =>
    candidate.slug === roomSlug || candidate.id === roomSlug);
  if (!result.data || !room) return <NotFoundScreen message="No encontramos esta habitación." />;

  const query = new URLSearchParams({ preferredRoom: room.slug });
  for (const key of ["checkIn", "checkOut", "guests"]) {
    if (search[key]) query.set(key, search[key] as string);
  }
  const yesNo = (value: string) => (value === "si" || value === "sí" ? "Sí" : value === "no"
    ? "No" : value);
  const details = Object.entries(room.details)
    .filter(([key]) => DETAIL_LABELS[key])
    .map(([key, value]): [string, string] => [DETAIL_LABELS[key], yesNo(value)]);

  return (
    <div className={styles.screen}>
      <div className={styles.heroWrap}>
        <PhotoGallery photos={room.photos} className={styles.heroTall} />
        <div className={styles.fixedBack}><BackButton onPhoto /></div>
      </div>
      <div className={styles.layout}>
        <div className={styles.sheet}>
          <h1 className={styles.name}>{room.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.roomPill}>
              <IoPeopleOutline size={15} color="var(--indigo)" aria-hidden />
              {room.capacity} {room.capacity === 1 ? "huésped" : "huéspedes"}
            </span>
            {room.beds && (
              <span className={styles.roomPill}>
                <IoBedOutline size={15} color="var(--indigo)" aria-hidden /> {room.beds}
              </span>
            )}
            {room.bathroomCount != null && (
              <span className={styles.roomPill}>
                <IoWaterOutline size={15} color="var(--indigo)" aria-hidden />
                {room.bathroomCount} {room.bathroomCount === 1 ? "baño" : "baños"}
              </span>
            )}
            {room.areaM2 != null && (
              <span className={styles.roomPill}>
                <IoExpandOutline size={15} color="var(--indigo)" aria-hidden /> {room.areaM2} m²
              </span>
            )}
          </div>
          <p className={styles.roomPriceLarge}>${room.price} / noche</p>
          {room.description && <p className={styles.description}>{room.description}</p>}

          {room.amenities.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.roomAmenities}>
                {room.amenities.map((label) => (
                  <span key={label} className={styles.roomAmenity}>
                    <IoCheckmarkCircleOutline size={18} color="var(--indigo)" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}

          {details.length > 0 && (
            <>
              <div className={styles.divider} />
              <PolicyList title="Detalles de la habitación" items={details} />
            </>
          )}
        </div>
        <aside className={styles.barSlot}>
          <BookingBar href={`/servicios/${result.data.item.slug}/reservar?${query}`}
            priceLine={`$${room.price} / noche`} />
        </aside>
      </div>
    </div>
  );
}
