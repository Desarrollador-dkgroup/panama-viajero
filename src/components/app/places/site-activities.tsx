import { activityIcon } from "@/lib/activity-icons";
import type { TouristSiteActivity } from "@/lib/tourist-site-activities";
import styles from "./site-activities.module.css";

// Sección «Qué hacer en …» de la ficha de un sitio. No se muestra si no hay actividades.
export function SiteActivities({
  siteName,
  activities,
  headingClassName,
}: {
  siteName: string;
  activities: TouristSiteActivity[];
  headingClassName: string;
}) {
  if (activities.length === 0) return null;

  return (
    <section aria-labelledby="que-hacer">
      <h2 id="que-hacer" className={headingClassName}>Qué hacer en {siteName}</h2>
      <ul className={styles.list}>
        {activities.map((activity, index) => {
          const Icon = activityIcon(activity.name);
          return (
            <li key={`${index}-${activity.name}`} className={styles.item}>
              <span className={styles.icon} aria-hidden="true"><Icon /></span>
              <div>
                <h3 className={styles.name}>{activity.name}</h3>
                {activity.description && <p className={styles.text}>{activity.description}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
