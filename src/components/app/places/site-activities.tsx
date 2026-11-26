import { activityIcon } from "@/lib/activity-icons";
import type { TouristSiteActivity } from "@/lib/tourist-site-activities";
import styles from "./site-activities.module.css";

// Sección de actividades de la ficha de un sitio, al final de la página. El título dice
// «algunas» porque la lista no pretende ser completa. No se muestra si no hay actividades.
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
      <h2 id="que-hacer" className={headingClassName}>
        Algunas cosas que puedes hacer en {siteName}
      </h2>
      <ul className={styles.list}>
        {activities.map((activity, index) => {
          const Icon = activityIcon(activity.name, activity.iconKey);
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
