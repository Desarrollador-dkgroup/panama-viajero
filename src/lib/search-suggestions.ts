import type { CatalogCategory, CatalogDestination, CatalogItem, CatalogSite } from "@/lib/catalog";

// Sugerencias de búsqueda (src/utils/search-suggestions.ts de la app). Las "ciudades" de la
// app pasan a ser los destinos (provincias) que carga el panel.

export type SearchCatalog = {
  categories: CatalogCategory[];
  destinations: CatalogDestination[];
  sites: CatalogSite[];
  services: CatalogItem[];
};

export type SearchSuggestion =
  | { kind: "destination"; key: string; destination: CatalogDestination; description: string }
  | { kind: "site"; key: string; site: CatalogSite; description: string }
  | { kind: "service"; key: string; item: CatalogItem; categoryId: string; description: string };

export type SearchGroup = { key: string; title: string; data: SearchSuggestion[] };

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function relevance(name: string, query: string): number {
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.split(/[\s\-,]+/).some((word) => word.startsWith(query))) return 2;
  return 3;
}

function byRelevance<T>(pairs: [T, number][]): T[] {
  return pairs.sort((a, b) => a[1] - b[1]).map(([value]) => value);
}

function describeSite(site: CatalogSite, catalog: SearchCatalog): string {
  const place = site.provinceId ?? site.regionId;
  const labels: string[] = [];
  let count = 0;
  for (const category of catalog.categories) {
    const inCategory = catalog.services.filter((item) =>
      item.categoryId === category.id && item.siteIds.includes(site.id)).length;
    if (inCategory > 0) {
      labels.push(category.label);
      count += inCategory;
    }
  }
  if (count === 0) return `Sitio turístico en ${place} · ${site.name}, sin servicios todavía`;
  return `Sitio turístico en ${place} · ${site.name} · ${count} ${
    count === 1 ? "servicio" : "servicios"}: ${labels.join(", ")}`;
}

export function getSearchSuggestions(query: string, catalog: SearchCatalog): SearchSuggestion[] {
  const needle = normalizeText(query);
  if (!needle) return [];

  const destinations = byRelevance(
    catalog.destinations
      .filter((destination) => normalizeText(destination.name).includes(needle))
      .map((destination): [SearchSuggestion, number] => [
        {
          kind: "destination",
          key: `destination-${destination.id}`,
          destination,
          description: destination.subtitle ||
            `Descubre sitios turísticos, restaurantes, hospedajes y experiencias en ${
              destination.name}.`,
        },
        relevance(normalizeText(destination.name), needle),
      ]),
  );

  const sites = byRelevance(
    catalog.sites
      .filter((site) =>
        normalizeText(site.name).includes(needle) ||
        normalizeText(site.shortDescription).includes(needle) ||
        normalizeText(site.description).includes(needle))
      .map((site): [SearchSuggestion, number] => {
        const name = normalizeText(site.name);
        return [
          { kind: "site", key: `site-${site.id}`, site, description: describeSite(site, catalog) },
          name.includes(needle) ? relevance(name, needle) : 4,
        ];
      }),
  );

  const services: SearchSuggestion[] = [];
  for (const category of catalog.categories) {
    services.push(...byRelevance(
      catalog.services
        .filter((item) => item.categoryId === category.id)
        .filter((item) =>
          normalizeText(item.name).includes(needle) ||
          normalizeText(item.provinceId ?? "").includes(needle) ||
          normalizeText(item.siteName ?? "").includes(needle) ||
          normalizeText(item.searchDescription).includes(needle))
        .map((item): [SearchSuggestion, number] => {
          const name = normalizeText(item.name);
          return [
            {
              kind: "service",
              key: `service-${item.id}`,
              item,
              categoryId: category.id,
              description: item.searchDescription,
            },
            name.includes(needle) ? relevance(name, needle) : 4,
          ];
        }),
    ));
  }

  return [...destinations, ...sites, ...services];
}

export function groupSearchSuggestions(
  suggestions: SearchSuggestion[],
  categories: CatalogCategory[],
): SearchGroup[] {
  const groups: SearchGroup[] = [
    { key: "destinations", title: "Destinos",
      data: suggestions.filter((s) => s.kind === "destination") },
    { key: "sites", title: "Sitios turísticos", data: suggestions.filter((s) => s.kind === "site") },
    ...categories.map((category) => ({
      key: `category-${category.id}`,
      title: category.label,
      data: suggestions.filter((s) => s.kind === "service" && s.categoryId === category.id),
    })),
  ];
  return groups.filter((group) => group.data.length > 0);
}

export function suggestionHref(suggestion: SearchSuggestion): string {
  if (suggestion.kind === "destination") return `/destinos/${suggestion.destination.slug}`;
  if (suggestion.kind === "site") return `/sitios-turisticos/${suggestion.site.slug}`;
  return `/servicios/${suggestion.item.slug}`;
}
