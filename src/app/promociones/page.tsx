import { PromoCard } from "@/components/app/promotions/promo-card";
import { PromotionsHeader } from "@/components/app/promotions/promotions-header";
import styles from "@/components/app/promotions/promotions.module.css";
import { getPromotions } from "@/lib/promotions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Promociones | Panamá Viajero" };

// Catálogo de promociones (src/app/promotions.tsx): vigentes primero y luego finalizadas.
export default async function PromotionsPage() {
  const promotions = await getPromotions();
  const active = promotions.filter((promo) => promo.isActive);
  const ended = promotions.filter((promo) => !promo.isActive);

  return (
    <div className={styles.root}>
      <PromotionsHeader title="Promociones" subtitle="Encuentra tu próxima escapada" />
      <div className={styles.content}>
        {promotions.length === 0 && (
          <p className={styles.empty}>No hay promociones publicadas por ahora.</p>
        )}
        {active.length > 0 && <h2 className={styles.sectionLabel}>Vigentes</h2>}
        <div className={styles.grid}>
          {active.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href={`/promociones/${promo.slug}`} />
          ))}
        </div>
        {ended.length > 0 && <h2 className={styles.sectionLabel}>Finalizadas</h2>}
        <div className={styles.grid}>
          {ended.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href={`/promociones/${promo.slug}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
