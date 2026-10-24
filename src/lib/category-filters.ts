import type { CatalogItem } from "@/lib/catalog";

// Filtros y orden de resultados (src/utils/category-filters.ts de la app). La "ciudad" de la
// app es aquí el destino (provincia).

export const ALL = "Todas";

export type FilterSelection = {
  categoryId: string;
  region: string;
  touristSite: string;
  hospedajeType: string;
  mealPlan: string;
};

export type SortOption = "price-desc" | "price-asc" | "rating-desc";

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "price-desc", label: "Precio más alto" },
  { id: "price-asc", label: "Precio más bajo" },
  { id: "rating-desc", label: "Mejor valorado" },
];

export function filterItems(items: CatalogItem[], selection: FilterSelection): CatalogItem[] {
  return items.filter((item) => {
    if (item.categoryId !== selection.categoryId) return false;
    if (selection.region !== ALL && item.provinceId !== selection.region) return false;
    if (selection.touristSite !== ALL && !item.siteIds.includes(selection.touristSite)) {
      return false;
    }
    if (selection.categoryId === "hospedaje") {
      if (selection.hospedajeType !== ALL && item.hospedajeTypeId !== selection.hospedajeType) {
        return false;
      }
      if (selection.mealPlan !== ALL && item.mealPlanId !== selection.mealPlan) return false;
    }
    return true;
  });
}

export function sortItems(items: CatalogItem[], sort: SortOption | null): CatalogItem[] {
  if (!sort) return items;
  const sorted = [...items];
  if (sort === "rating-desc") return sorted.sort((a, b) => b.rating - a.rating);
  const direction = sort === "price-asc" ? 1 : -1;
  return sorted.sort((a, b) => (a.price - b.price) * direction);
}
