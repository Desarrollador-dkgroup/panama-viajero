import { CatalogError } from "@/components/app/catalog-status";
import { FavoritesScreen } from "@/components/app/favorites-screen";
import { attempt } from "@/lib/attempt";
import { getServices } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Favoritos | Panamá Viajero" };

export default async function FavoritesPage() {
  const result = await attempt(getServices);
  if (result.error !== null) return <CatalogError message={result.error} />;
  return <FavoritesScreen services={result.data} />;
}
