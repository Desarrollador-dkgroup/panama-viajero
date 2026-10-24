import { CatalogError } from "@/components/app/catalog-status";
import { HomeHeader } from "@/components/app/home/home-header";
import {
  CategoryGrid,
  DestinationsCarousel,
  FeaturedServices,
  RestaurantsCarousel,
  StaysCarousel,
  ToursCarousel,
} from "@/components/app/home/home-sections";
import styles from "@/components/app/home/home.module.css";
import { attempt } from "@/lib/attempt";
import { getDestinations, getServices } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Portada copiada de la app (src/app/(tabs)/index.tsx), en el mismo orden de secciones.
export default async function HomePage() {
  const result = await attempt(() => Promise.all([getServices(), getDestinations()]));
  if (result.error !== null) return <CatalogError message={result.error} />;

  const [services, destinations] = result.data;
  const byCategory = (id: string) => services.filter((item) => item.categoryId === id);
  const recommended = services.filter((item) => item.isRecommended);

  return (
    <div className={styles.page}>
      <HomeHeader />
      <div className={styles.body}>
        <CategoryGrid />
        <DestinationsCarousel destinations={destinations} />
        <ToursCarousel tours={byCategory("tour-operador").slice(0, 8)} />
        <FeaturedServices services={(recommended.length ? recommended : services).slice(0, 6)} />
        <StaysCarousel stays={byCategory("hospedaje").slice(0, 10)} />
        <RestaurantsCarousel restaurants={byCategory("restaurantes").slice(0, 10)} />
      </div>
    </div>
  );
}
