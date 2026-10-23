"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import type { CatalogService } from "@/data/catalog";
import { usePublishedServices } from "@/lib/use-published-services";
import { useDestinations } from "@/lib/use-destinations";
import { CatalogImage } from "@/components/home-content";
import { CategoryNavigation } from "@/components/category-navigation";
import { SiteBanner } from "@/components/site-banner";
import styles from "./destinations-page.module.css";

type RecommendationItem = CatalogService;

// Presenta una tarjeta compacta para cada recomendación del destino.
function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <article className={styles.recommendationCard}>
      <Link href={`/servicios/${item.slug}`} target="_blank" rel="noopener noreferrer">
        <CatalogImage src={item.imagePath} alt={item.name} />
      </Link>
      <div className={styles.recommendationBody}>
        <div>
          <h3>{item.name}</h3>
          <p>
            <MapPin size={14} />
            {item.location}
          </p>
        </div>
        <span className={styles.rating}>★ {item.rating}</span>
      </div>
      <div className={styles.tags}>
        <span>Recomendado</span>
        <span>Panamá</span>
      </div>
    </article>
  );
}

// Construye la página de destinos y selecciona aleatoriamente el destino destacado.
export function DestinationsPage() {
  // Consulta recomendaciones reales para cada categoría.
  const hotels = usePublishedServices("hospedaje");
  const restaurants = usePublishedServices("restaurantes");
  const activities = usePublishedServices("actividades");
  const sections = [
    { title: "Hoteles", href: "/alojamientos", ...hotels },
    { title: "Restaurantes", href: "/restaurantes", ...restaurants },
    { title: "Actividades", href: "/actividades", ...activities },
  ];

  // Los destinos, sus textos e imágenes vienen del panel (tabla destinations).
  const destinations = useDestinations();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const provinces = destinations.items.filter((item) =>
    !normalizedQuery ||
    `${item.name} ${item.subtitle}`.toLowerCase().includes(normalizedQuery));

  // Selecciona un destino destacado cuando ya se cargaron.
  useEffect(() => {
    if (!destinations.items.length) return;
    const timer = window.setTimeout(() => {
      setFeaturedIndex(Math.floor(Math.random() * destinations.items.length));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [destinations.items.length]);

  const featured = provinces[featuredIndex] ?? provinces[0];
  const visibleProvinces = provinces.filter((item) => item !== featured);

  return (
    <main className={styles.page}>
      <SiteBanner
        eyebrow="DESCUBRE · EXPLORA · VIVE"
        title="Descubre las provincias de Panamá"
        description="Explora paisajes, culturas y experiencias únicas en cada rincón del país."
        query={query}
        showSearch
        onQueryChange={setQuery}
      />

      <section className={styles.content}>
        <CategoryNavigation />
        <div className={styles.sectionHeading}>
          <h2>Destinos populares</h2>
        </div>
        {featured ? (
          <div className={styles.destinationGrid}>
            <Link href={`/destinos/${featured.slug}`} className={styles.featuredDestination}>
              <CatalogImage src={featured.cardImage} alt={featured.name} />
              <div>
                <strong>{featured.name}</strong>
                <span>{featured.subtitle}</span>
              </div>
            </Link>
            {visibleProvinces.map((item) => (
              <Link
                key={item.slug}
                href={`/destinos/${item.slug}`}
                className={styles.destinationCard}
              >
                <CatalogImage src={item.cardImage} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>
            {destinations.status === "loading"
              ? "Cargando destinos..."
              : destinations.status === "error"
                ? "No se pudieron cargar los destinos."
                : "No hay destinos que coincidan con tu búsqueda."}
          </p>
        )}

        {sections.map((section) => (
          <section key={section.title} className={styles.recommendationSection}>
            <div className={styles.sectionHeading}>
              <h2>{section.title}</h2>
              <div className={styles.sectionActions}>
                <Link href={section.href}>Ver más</Link>
                <button aria-label={`Anterior en ${section.title}`}>
                  <ArrowLeft size={18} />
                </button>
                <button aria-label={`Siguiente en ${section.title}`}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <div className={styles.recommendationGrid}>
              {section.items.slice(0, 4).map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
              {section.items.length === 0 && (
                <p>
                  {section.status === "loading"
                    ? "Cargando servicios..."
                    : section.status === "error"
                      ? "No se pudieron cargar los servicios."
                      : "No hay servicios publicados."}
                </p>
              )}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
