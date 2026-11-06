import Link from "next/link";
import { AdsBanner, type AdItem } from "@/components/app/ads/ads-banner";
import accountStyles from "@/components/app/account.module.css";
import { CatalogError } from "@/components/app/catalog-status";
import { HomeHeader } from "@/components/app/home/home-header";
import {
  ActivitiesCarousel,
  CategoryGrid,
  DestinationsCarousel,
  FeaturedServices,
  PromotionsCarousel,
  RestaurantsCarousel,
  StaysCarousel,
  ToursCarousel,
} from "@/components/app/home/home-sections";
import styles from "@/components/app/home/home.module.css";
import { attempt } from "@/lib/attempt";
import { getDestinations, getServices } from "@/lib/catalog";
import { getActiveAds } from "@/lib/ads";
import { getActiveServicePromotions } from "@/lib/service-promotions";

export const dynamic = "force-dynamic";

// Portada copiada de la app (src/app/(tabs)/index.tsx), en el mismo orden de secciones.
export default async function HomePage() {
  const result = await attempt(() => Promise.all([getServices(), getDestinations()]));
  if (result.error !== null) return <CatalogError message={result.error} />;

  const [services, destinations] = result.data;
  const ads = await getActiveAds().catch(() => [] as AdItem[]);
  const promotions = await getActiveServicePromotions();
  const byCategory = (id: string) => services.filter((item) => item.categoryId === id);
  const recommended = services.filter((item) => item.isRecommended);

  return (
    <div className={styles.page}>
      <AdsBanner ads={ads} />
      <HomeHeader />
      <div className={styles.body}>
        <CategoryGrid />
        <DestinationsCarousel destinations={destinations} />
        <PromotionsCarousel promotions={promotions} />
        <FeaturedServices services={recommended.length ? recommended : services.slice(0, 6)} />
        <StaysCarousel stays={byCategory("hospedaje").slice(0, 10)} />
        <RestaurantsCarousel restaurants={byCategory("restaurantes").slice(0, 10)} />
        <ActivitiesCarousel activities={byCategory("actividades").slice(0, 10)} />
        <ToursCarousel tours={byCategory("tour-operador").slice(0, 8)} />
        <section className={styles.publishBlock}>
          <h2>¿Tienes un negocio en Panamá?</h2>
          <p>Déjanos tus datos y te contactamos para que tus servicios aparezcan aquí.</p>
          <Link href="/publicar-negocio" className={accountStyles.primaryButton}>
            Quiero publicar mi negocio
          </Link>
        </section>
      </div>
    </div>
  );
}
