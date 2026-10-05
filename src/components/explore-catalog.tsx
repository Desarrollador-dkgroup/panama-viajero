"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { CategoryNavigation } from "@/components/category-navigation";
import { CatalogImage } from "@/components/home-content";
import { CatalogFilterPanel, defaultFilters } from "@/components/catalog-filter-panel";
import type { CatalogFilters } from "@/components/catalog-filter-panel";
import { LocationMap } from "@/components/location-map";
import { ServicePreviewDialog } from "@/components/service-preview";
import { catalogConfig, getCatalog } from "@/data/catalog";
import type { CatalogCategory, CatalogService } from "@/data/catalog";
import styles from "./explore-catalog.module.css";

// Normaliza el texto para encontrar resultados sin distinguir acentos
const normalize = (value: string) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase();
const pageSize = 6;

// Presenta una tarjeta del catálogo y conserva separados sus dos botones
function ExploreCard({ item, unit, favorite, onFavorite, onOpen }: {
  item: CatalogService;
  unit: string;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className={`catalog-card ${styles.resultCard}`}>
      <button className="service-image-button" aria-label={`Ver ${item.name}`} onClick={onOpen}>
        <CatalogImage src={item.imagePath} alt={item.name} />
      </button>
      <button className={`favorite-button ${favorite ? "selected" : ""}`}
        aria-label={`${favorite ? "Quitar" : "Añadir"} ${item.name} de favoritos`}
        aria-pressed={favorite} onClick={onFavorite}>
        <Heart size={20} fill={favorite ? "currentColor" : "none"} />
      </button>
      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <h3>{item.name}</h3>
          <span className="rating"><Star size={14} fill="currentColor" />{item.rating}</span>
        </div>
        <p className="location"><MapPin size={13} />{item.location}</p>
        <p className="price">Desde <strong>${item.price}</strong> / {unit}</p>
        <div className={styles.tags}>
          <span>{item.type}</span><span>{item.environment}</span>
          <span>{item.amenities[0]}</span>
        </div>
      </div>
    </article>
  );
}

// Compone el catálogo filtrable sin modificar el menú ni el pie compartidos
export function ExploreCatalog({ category }: { category: CatalogCategory }) {
  const config = catalogConfig[category];
  const items = getCatalog(category);

  // Mantiene la búsqueda, los filtros y los controles de presentación
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<CatalogService | null>(null);
  const resultsHeading = useRef<HTMLDivElement>(null);

  // Filtra todas las condiciones antes de ordenar y paginar los resultados
  const filtered = items.filter((item) => {
    const text = `${item.name} ${item.location} ${item.province}`;
    return normalize(text).includes(normalize(search))
      && (!filters.provinces.length || filters.provinces.includes(item.province))
      && (!filters.types.length || filters.types.includes(item.type))
      && filters.amenities.every((amenity) => item.amenities.includes(amenity))
      && (!filters.environments.length || filters.environments.includes(item.environment))
      && item.price >= filters.minimumPrice && item.price <= filters.maximumPrice
      && Number(item.rating) >= filters.minimumRating;
  }).sort((first, second) => {
    if (sort === "price-low") return first.price - second.price;
    if (sort === "price-high") return second.price - first.price;
    if (sort === "rating") return Number(second.rating) - Number(first.rating);
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filterCount = filters.provinces.length + filters.types.length
    + filters.amenities.length + filters.environments.length
    + Number(filters.minimumPrice > 0 || filters.maximumPrice < 350)
    + Number(filters.minimumRating > 0);

  // Restablece la página cuando cambia un filtro
  const updateFilters = (next: CatalogFilters) => {
    setFilters(next);
    setPage(1);
  };

  // Limpia la búsqueda y todos los filtros del catálogo
  const reset = () => {
    setQuery("");
    setSearch("");
    setFilters(defaultFilters);
    setPage(1);
  };

  // Desplaza los resultados al cambiar de página
  const changePage = (next: number) => {
    setPage(next);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsHeading.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <main id="contenido">
      {/* Conserva la misma imagen y el buscador del banner principal */}
      <section className={`hero ${styles.banner}`}>
        <Image src="/P-Principal/Banner.png" alt="Playa de Panamá" fill priority
          sizes="100vw" className="hero-image" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className={styles.eyebrow}>DESCUBRE · EXPLORA · VIVE</p>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
          <form className="search-form" onSubmit={(event) => {
            event.preventDefault();
            setSearch(query.trim());
            setPage(1);
            resultsHeading.current?.scrollIntoView();
          }}>
            <Search size={24} aria-hidden="true" />
            <input aria-label="Buscar en el catálogo" value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca un destino, alojamiento o experiencia" />
            <button type="submit">Buscar</button>
          </form>
        </div>
      </section>
      <div className={`container ${styles.catalog}`}>
        <CategoryNavigation active={`/${category}`} />
        <div className={styles.layout}>
          {/* Filtros laterales en escritorio y desplegables en móvil */}
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.filtersOpen : ""}`}>
            <button className={styles.mobileFilters} aria-expanded={filtersOpen}
              aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal size={18} />Filtros {filterCount > 0 && `(${filterCount})`}
              <ChevronRight size={17} />
            </button>
            <div id="catalog-filters" className={styles.filterBody}>
              <CatalogFilterPanel category={category} filters={filters}
                onChange={updateFilters} onReset={reset} />
            </div>
          </aside>
          <div className={styles.results}>
            <LocationMap />
            <div ref={resultsHeading} className={styles.resultsHeading} id="resultados">
              <div>
                <h2>{config.title} para descubrir</h2>
                <p role="status">{filtered.length} resultados{search && ` para “${search}”`}</p>
              </div>
              <label className={styles.sort}>
                Ordenar por
                <select value={sort} onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}>
                  <option value="recommended">Recomendados</option>
                  <option value="price-low">Menor precio</option>
                  <option value="price-high">Mayor precio</option>
                  <option value="rating">Mejor calificación</option>
                </select>
              </label>
            </div>
            <div className={styles.resultsGrid}>
              {visibleItems.map((item) => (
                <ExploreCard key={item.id} item={item} unit={config.unit}
                  favorite={favorites.includes(item.id)} onOpen={() => setSelected(item)}
                  onFavorite={() => setFavorites((current) => current.includes(item.id)
                    ? current.filter((id) => id !== item.id) : [...current, item.id])} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className={styles.empty}>
                <Search size={30} />
                <h3>No encontramos resultados</h3>
                <p>Prueba otra ubicación o ajusta los filtros.</p>
                <button onClick={reset} className={styles.primaryButton}>Limpiar filtros</button>
              </div>
            )}
            {/* Pagina únicamente los resultados que cumplen los filtros */}
            {filtered.length > 0 && (
              <nav className={styles.pagination} aria-label="Páginas de resultados">
                <button aria-label="Página anterior" disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}><ChevronLeft size={18} /></button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <button key={number} aria-label={`Página ${number}`}
                    aria-current={currentPage === number ? "page" : undefined}
                    onClick={() => changePage(number)}>{number}</button>
                ))}
                <button aria-label="Página siguiente" disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}><ChevronRight size={18} /></button>
              </nav>
            )}
            <p className={styles.demoNote}>Catálogo de demostración. Precios y atributos de ejemplo.</p>
          </div>
        </div>
      </div>
      <ServicePreviewDialog service={selected ? { ...selected, unit: config.unit } : null}
        onClose={() => setSelected(null)} />
    </main>
  );
}
