"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { activities, restaurants, stays } from "@/data/home";
import { CatalogImage } from "@/components/home-content";
import { CategoryNavigation } from "@/components/category-navigation";
import { SiteBanner } from "@/components/site-banner";
import styles from "./destinations-page.module.css";

const provinces = [
  { slug: "bocas", name: "Bocas del Toro", subtitle: "Playas y vida caribeña", image: "bocas-del-toro.jpg" },
  { slug: "cocle", name: "Coclé", subtitle: "Playas, cultura y naturaleza", image: "el-valle.jpg" },
  { slug: "colon", name: "Colón", subtitle: "Historia y costas del Caribe", image: "portobelo.jpg" },
  { slug: "chiriqui", name: "Chiriquí", subtitle: "Montañas, café y aventura", image: "boquete.jpg" },
  { slug: "darien", name: "Darién", subtitle: "Naturaleza y biodiversidad", image: "tierras-altas.jpg" },
  { slug: "herrera", name: "Herrera", subtitle: "Tradición y folclore", image: "pedasi.jpg" },
  { slug: "los-santos", name: "Los Santos", subtitle: "Cultura y playas del Pacífico", image: "santa-catalina.jpg" },
  { slug: "panama", name: "Panamá", subtitle: "Ciudad, historia y modernidad", image: "ciudad-de-panama.jpg" },
  { slug: "panama-oeste", name: "Panamá Oeste", subtitle: "Escapadas cerca de la ciudad", image: "isla-taboga.jpg" },
  { slug: "veraguas", name: "Veraguas", subtitle: "Islas, montañas y aventura", image: "san-blas.jpg" },
];

const sections = [
  { title: "Hoteles", href: "/alojamientos", items: stays },
  { title: "Restaurantes", href: "/restaurantes", items: restaurants },
  { title: "Actividades", href: "/actividades", items: activities },
];

type RecommendationItem = {
  name: string;
  location: string;
  rating: string;
  image: string;
};

// Presenta una tarjeta compacta para cada recomendación del destino.
function RecommendationCard({ item, folder }: {
  item: RecommendationItem;
  folder: string;
}) {
  return (
    <article className={styles.recommendationCard}>
      <CatalogImage src={`/P-Principal/${folder}/${item.image}`} alt={item.name} />
      <div className={styles.recommendationBody}>
        <div>
          <h3>{item.name}</h3>
          <p><MapPin size={14} />{item.location}</p>
        </div>
        <span className={styles.rating}>★ {item.rating}</span>
      </div>
      <div className={styles.tags}><span>Recomendado</span><span>Panamá</span></div>
    </article>
  );
}

// Construye la página de destinos y selecciona aleatoriamente el destino destacado.
export function DestinationsPage() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [query, setQuery] = useState("");

  // Selecciona una provincia destacada cuando la página ya está montada.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFeaturedIndex(Math.floor(Math.random() * provinces.length));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const featured = provinces[featuredIndex];
  const visibleProvinces = provinces.filter((_, index) => index !== featuredIndex).slice(0, 8);

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
        <div className={styles.destinationGrid}>
            <Link href={`/destinos/${featured.slug}`} className={styles.featuredDestination}>
            <CatalogImage src={`/P-Principal/Destinos/${featured.image}`} alt={featured.name} />
            <div><strong>{featured.name}</strong><span>{featured.subtitle}</span></div>
          </Link>
          {visibleProvinces.map((item) => (
            <Link key={item.name} href={`/destinos/${item.slug}`} className={styles.destinationCard}>
              <CatalogImage src={`/P-Principal/Destinos/${item.image}`} alt={item.name} />
              <div><strong>{item.name}</strong></div>
            </Link>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.title} className={styles.recommendationSection}>
            <div className={styles.sectionHeading}>
              <h2>{section.title}</h2>
              <div className={styles.sectionActions}>
                <Link href={section.href}>Ver más</Link>
                <button aria-label={`Anterior en ${section.title}`}><ArrowLeft size={18} /></button>
                <button aria-label={`Siguiente en ${section.title}`}><ArrowRight size={18} /></button>
              </div>
            </div>
            <div className={styles.recommendationGrid}>
              {section.items.slice(0, 4).map((item) => (
                <RecommendationCard key={item.name} item={item} folder={
                  section.title === "Hoteles" ? "Alojamientos" : section.title
                } />
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
