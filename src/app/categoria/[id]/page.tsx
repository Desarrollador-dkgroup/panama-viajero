import { CatalogError } from "@/components/app/catalog-status";
import { CategoryScreen } from "@/components/app/category/category-screen";
import { attempt } from "@/lib/attempt";
import {
  getCategories,
  getDestinations,
  getLodgingOptions,
  getServices,
  getTouristSites,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Resultados de una categoría con filtros por destino, sitio, tipo y plan de comidas.
export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await attempt(() => Promise.all([
    getCategories(),
    getServices(),
    getTouristSites(),
    getDestinations(),
    getLodgingOptions(),
  ]));
  if (result.error !== null) return <CatalogError message={result.error} />;

  const [categories, services, sites, destinations, lodging] = result.data;
  // Fechas y personas elegidas en la búsqueda pasan a la ficha del servicio.
  const forward = new URLSearchParams();
  for (const key of ["checkIn", "checkOut", "guests"]) {
    const value = query[key];
    if (value) forward.set(key, value);
  }
  return (
    <CategoryScreen
      key={id}
      categoryId={id}
      categories={categories}
      services={services}
      sites={sites}
      destinations={destinations}
      hospedajeTypes={lodging.hospedajeTypes}
      mealPlans={lodging.mealPlans}
      initialRegion={query.region}
      initialSite={query.touristSite}
      query={forward.size ? `?${forward}` : ""}
    />
  );
}
