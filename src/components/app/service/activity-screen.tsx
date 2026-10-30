import { IoLocationOutline } from "react-icons/io5";
import type { ServiceDetail } from "@/lib/service-detail";
import { formatPlace } from "@/lib/catalog";
import { PhotoGallery } from "./gallery";
import { HeroButtons } from "./hero-buttons";
import {
  AttractionList,
  LocationMap,
  ReviewsList,
} from "./service-sections";
import { ReserveBar } from "./bottom-bars";
import styles from "./service.module.css";

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function getActivityStatus(hours: { day: number; opens: string; closes: string }[]) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const todayHours = hours.filter((h) => h.day === dayOfWeek);
  if (todayHours.length === 0) {
    return { status: "Cerrado", closesAt: null };
  }

  let isOpen = false;
  let closesAt = "";

  for (const hour of todayHours) {
    if (timeStr >= hour.opens && timeStr < hour.closes) {
      isOpen = true;
      closesAt = hour.closes;
      break;
    }
  }

  if (isOpen) {
    const [closeHours, closeMinutes] = closesAt.split(":").map(Number);
    const closeTime = closeHours * 60 + closeMinutes;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const minutesUntilClose = closeTime - currentTime;

    if (minutesUntilClose <= 60) {
      return { status: `Pronto a cerrar (${closesAt})`, closesAt };
    }
    return { status: "Abierto", closesAt };
  }

  return { status: "Cerrado", closesAt: null };
}

export function ActivityScreen({ detail }: { detail: ServiceDetail }) {
  const { item, activity } = detail;

  if (!activity) {
    return <div>Actividad no disponible</div>;
  }

  const activityStatus = getActivityStatus(activity.hours);
  const placeQuery = [detail.address, item.siteName, item.provinceId, "Panamá"]
    .filter(Boolean).join(", ");
  const reserveHref = `/servicios/${item.slug}/solicitar`;

  return (
    <div className={styles.screen}>
      <div className={styles.heroWrap}>
        <PhotoGallery photos={detail.photos} className={styles.hero} />
        <HeroButtons serviceId={item.id} />
      </div>
      <div className={`${styles.layout} ${styles.sheetRounded}`}>
        <div className={styles.sheet}>
          <div className={styles.titleRow}>
            <h1 className={styles.name}>{item.name}</h1>
          </div>
          <p className={styles.locationRow}>
            <IoLocationOutline size={16} color="var(--text-muted)" aria-hidden />
            {formatPlace(item)}
          </p>

          {item.description && (
            <>
              <div className={styles.divider} />
              <p className={styles.description}>{item.description}</p>
            </>
          )}

          {activity.hours.length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.headingLarge}>Horario semanal</h2>
                <p className={styles.statusBadge} style={{
                  color: activityStatus.status === "Abierto" ? "var(--success)" :
                         activityStatus.status.startsWith("Pronto a cerrar") ? "var(--warning)" :
                         "var(--text-muted)",
                }}>
                  {activityStatus.status}
                </p>
                <div className={styles.scheduleGrid}>
                  {DAYS.map((day, idx) => {
                    const daySchedule = activity.schedule[day.toLowerCase()];
                    if (!daySchedule || !daySchedule.start) return null;
                    return (
                      <div key={idx} className={styles.scheduleItem}>
                        <strong>{day}</strong>
                        <span>{daySchedule.start} a {daySchedule.end}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activity.minAge && (
            <>
              <div className={styles.divider} />
              <p className={styles.infoItem}>
                <strong>Edad recomendada:</strong> Desde los {activity.minAge} años
              </p>
            </>
          )}

          {activity.whatIncludes.length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.headingLarge}>Lo que incluye</h2>
                <ul className={styles.list}>
                  {activity.whatIncludes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {activity.attractions.length > 0 && (
            <>
              <div className={styles.divider} />
              <AttractionList
                attractions={activity.attractions}
                hrefFor={(attraction, idx) =>
                  `/servicios/${item.slug}/atracciones/${attraction.id ?? idx}`}
              />
            </>
          )}

          {activity.locationAddressDetails && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.heading}>Ubicación exacta</h2>
                <p className={styles.infoItem}>{activity.locationAddressDetails}</p>
              </section>
            </>
          )}

          <div className={styles.divider} />
          <LocationMap
            embedUrl={detail.mapsEmbedUrl}
            address={detail.address}
            query={placeQuery}
          />

          {detail.reviews.length > 0 && (
            <>
              <div className={styles.divider} />
              <ReviewsList reviews={detail.reviews} />
            </>
          )}
        </div>
        <aside className={styles.barSlot}>
          <ReserveBar href={reserveHref} label="Reservar" />
        </aside>
      </div>
    </div>
  );
}
