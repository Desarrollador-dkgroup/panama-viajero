import Link from "next/link";
import { PromoCard } from "@/components/app/promotions/promo-card";
import { PromotionsHeader } from "@/components/app/promotions/promotions-header";
import styles from "@/components/app/promotions/promotions.module.css";
import { getActiveServicePromotions } from "@/lib/service-promotions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Promociones | Panamá Viajero" };

// Promociones vigentes hoy. Se filtran por sitio turístico o destino, como el catálogo.
export default async function PromotionsPage({ searchParams }: {
  searchParams: Promise<{ sitio?: string; destino?: string; promo?: string }>;
}) {
  const { sitio, destino } = await searchParams;
  const promotions = await getActiveServicePromotions();

  const visible = promotions.filter((promo) => {
    if (sitio) return promo.siteIds.includes(sitio);
    if (destino) return promo.provinceId === destino;
    return true;
  });

  const siteOptions = new Map<string, string>();
  for (const promo of promotions) {
    promo.siteIds.forEach((id, index) => siteOptions.set(id, promo.siteNames[index]));
  }

  return (
    <div className={styles.root}>
      <PromotionsHeader title="Promociones" subtitle="Encuentra tu próxima escapada" />
      <div className={styles.content}>
        {siteOptions.size > 0 && (
          <nav className={styles.sectionLabel} aria-label="Filtrar por sitio turístico">
            <Link href="/promociones">Todas</Link>
            {[...siteOptions].map(([id, name]) => (
              <Link key={id} href={`/promociones?sitio=${id}`}> · {name}</Link>
            ))}
          </nav>
        )}
        {visible.length === 0 && (
          <p className={styles.empty}>No hay promociones vigentes para este filtro.</p>
        )}
        <div className={styles.grid}>
          {visible.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </div>
  );
}
