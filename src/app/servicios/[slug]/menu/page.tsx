import { BackButton } from "@/components/app/back-button";
import { CatalogError } from "@/components/app/catalog-status";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import styles from "@/components/app/service/menu.module.css";
import { attempt } from "@/lib/attempt";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

const price = (value: number) => `$${Number.isInteger(value) ? value : value.toFixed(2)}`;

// Carta del restaurante (src/app/menu/[id].tsx de la app).
export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const restaurant = result.data?.restaurant;
  if (!result.data || !restaurant) return <NotFoundScreen message="No encontramos esta carta." />;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <BackButton fallback={`/servicios/${result.data.item.slug}`} />
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>Carta</span>
          <h1 className={styles.title}>{result.data.item.name}</h1>
        </div>
      </div>
      <div className={styles.content}>
        {restaurant.menu.length === 0 && (
          <p className={styles.empty}>Este restaurante todavía no publicó su carta.</p>
        )}
        {restaurant.menu.map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.dishes}>
              {section.dishes.map((dish) => (
                <div key={dish.id} className={styles.dishCard}>
                  <div className={styles.dishText}>
                    <span className={styles.dishName}>{dish.name}</span>
                    {dish.description && (
                      <span className={styles.dishDescription}>{dish.description}</span>
                    )}
                  </div>
                  <span className={styles.dishPrice}>{price(dish.price)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
