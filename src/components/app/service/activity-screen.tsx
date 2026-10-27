import type { ServiceDetail } from "@/lib/service-detail";
import { formatPlace } from "@/lib/catalog";
import { PhotoGallery } from "./gallery";
import { HeroButtons } from "./hero-buttons";
import {
  LocationMap,
  ReviewsList,
} from "./service-sections";
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

export function ActivityScreen({ detail }: { detail: ServiceDetail }) {
  const { item, activity } = detail;

  if (!activity) {
    return <div>Actividad no disponible</div>;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.heroWrap}>
        <PhotoGallery photos={detail.photos} className={styles.hero} />
        <HeroButtons serviceId={item.id} />
      </div>
      <div className={styles.layout}>
        <div className={styles.sheet}>
          <div className={styles.titleRow}>
            <h1 className={styles.name}>{item.name}</h1>
            <span className={styles.pricePill}>${item.price}/persona</span>
          </div>
          <p className={styles.locationRow}>
            📍 {formatPlace(item)}
          </p>

          {item.description && (
            <>
              <div className={styles.divider} />
              <p className={styles.description}>{item.description}</p>
            </>
          )}

          {Object.keys(activity.schedule).length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.headingLarge}>Horario semanal</h2>
                <div className={styles.scheduleGrid}>
                  {DAYS.map((day, idx) => {
                    const dayKey = day.toLowerCase();
                    const hours = activity.schedule[dayKey];
                    if (!hours) return null;
                    return (
                      <div key={idx} className={styles.scheduleItem}>
                        <strong>{day}</strong>
                        <span>
                          {hours.from} a {hours.to}
                        </span>
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
              <section className={styles.section}>
                <h2 className={styles.headingLarge}>Atracciones</h2>
                {activity.attractions.map((attraction, idx) => (
                  <div key={idx} className={styles.attractionCard}>
                    <h3>{attraction.name}</h3>
                    {attraction.description && (
                      <p>{attraction.description}</p>
                    )}
                    {attraction.options.length > 0 && (
                      <ul>
                        {attraction.options.map((option, oIdx) => (
                          <li key={oIdx}>{option}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            </>
          )}

          <div className={styles.divider} />
          <LocationMap
            embedUrl={detail.mapsEmbedUrl}
            address={detail.address}
            query={[detail.address, item.siteName, item.provinceId, "Panamá"]
              .filter(Boolean)
              .join(", ")}
          />

          {detail.reviews.length > 0 && (
            <>
              <div className={styles.divider} />
              <ReviewsList reviews={detail.reviews} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
