import { CatalogError } from "@/components/app/catalog-status";
import { SearchScreen } from "@/components/app/search/search-screen";
import { attempt } from "@/lib/attempt";
import { getCategories, getDestinations, getServices, getTouristSites } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Buscar | Panamá Viajero" };

// Pestaña Buscar: destinos, sitios turísticos y servicios publicados.
export default async function SearchPage({ searchParams }: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const result = await attempt(() =>
    Promise.all([getCategories(), getDestinations(), getTouristSites(), getServices()]));
  if (result.error !== null) return <CatalogError message={result.error} />;

  const [categories, destinations, sites, services] = result.data;
  return (
    <SearchScreen
      catalog={{ categories, destinations, sites, services }}
      initialQuery={q ?? ""}
    />
  );
}
