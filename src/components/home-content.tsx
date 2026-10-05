"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronRight, Heart, ImageIcon, MapPin, Search, Star,
} from "lucide-react";
import { activities, destinations, restaurants, stays } from "@/data/home";
import { ServicePreviewDialog, type ServicePreview } from "@/components/service-preview";
import { CategoryNavigation } from "@/components/category-navigation";

type CatalogItem = (typeof stays)[number];
type Collection = "destinos" | "alojamientos" | "restaurantes" | "actividades";

// Define los encabezados de las páginas de cada colección
const collectionTitles: Record<Collection, string> = {
  destinos: "Descubre los destinos de Panamá",
  alojamientos: "Encuentra tu próxima estadía",
  restaurantes: "Descubre los sabores de Panamá",
  actividades: "Vive tu próxima aventura",
};

// Reserva el espacio de las fotografías que todavía no están disponibles
export function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="catalog-image">
      {failed ? (
        <div className="image-placeholder">
          <ImageIcon size={30} /><span>{alt}</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 900px) 45vw, 33vw"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

// Presenta los datos de una tarjeta y su control de favoritos
function CatalogCard({ item, folder, unit, favorite, onFavorite, onOpen }: {
  item: CatalogItem;
  folder: string;
  unit: string;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="catalog-card">
      <button className="service-image-button" onClick={onOpen}
        aria-label={`Ver ${item.name}`}>
        <CatalogImage src={`/P-Principal/${folder}/${item.image}`} alt={item.name} />
      </button>
      <button
        className={`favorite-button ${favorite ? "selected" : ""}`}
        aria-label={`${favorite ? "Quitar" : "Añadir"} ${item.name} de favoritos`}
        aria-pressed={favorite}
        onClick={onFavorite}
      >
        <Heart size={22} fill={favorite ? "currentColor" : "none"} />
      </button>
      <div className="card-details">
        <div className="card-title">
          <h3>{item.name}</h3>
          <span className="rating"><Star size={16} fill="currentColor" />{item.rating}</span>
        </div>
        <p className="location"><MapPin size={13} />{item.location}</p>
        <p className="price">Desde <strong>${item.price}</strong> / {unit}</p>
      </div>
    </article>
  );
}

// Desplaza cada colección horizontalmente con sus botones
function CatalogSection({ id, title, showMore = true, children }: {
  id: string;
  title: string;
  showMore?: boolean;
  children: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);

  // Respeta la preferencia de movimiento del dispositivo
  const scroll = (direction: number) => {
    if (!track.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.current.scrollBy({
      left: direction * track.current.clientWidth * 0.8,
      behavior: reduced ? "instant" : "smooth",
    });
  };

  return (
    <section id={id} className="catalog-section" aria-label={title}>
      <div className="section-heading">
        <h2>{title}</h2>
        <div className="section-controls">
          {showMore && (
            <Link href={`/${id}`} className="view-more" aria-label={`Ver más ${id}`}>
              Ver más
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          )}
          <button aria-label={`Retroceder en ${title}`} onClick={() => scroll(-1)}>
            <ArrowLeft size={17} />
          </button>
          <button aria-label={`Avanzar en ${title}`} onClick={() => scroll(1)}>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <div ref={track} className={`card-track ${id === "destinos" ? "destinations" : ""}`}>
        {children}
      </div>
    </section>
  );
}

// Compone el banner, la navegación y las colecciones de la portada
export function HomeContent({ collection }: { collection?: Collection }) {
  // Mantiene los filtros y favoritos de la visita actual
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  // Conserva el servicio seleccionado para su vista previa
  const [selectedService, setSelectedService] = useState<ServicePreview | null>(null);

  // Alterna la selección de favoritos
  const toggleFavorite = (name: string) => {
    setFavorites((current) => current.includes(name)
      ? current.filter((entry) => entry !== name)
      : [...current, name]);
  };

  // Normaliza las búsquedas para comparar sin acentos ni mayúsculas
  const normalize = (value: string) => value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = (value: string) => normalize(value).includes(normalize(search));

  return (
    <main id="contenido">
      {/* Banner principal y formulario de búsqueda */}
      <section className="hero">
        <Image src="/P-Principal/Banner.png" alt="Paisaje de Panamá" fill
          priority sizes="100vw" className="hero-image" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1>
            {collection ? collectionTitles[collection] : (
              <>¿Qué quieres descubrir<br />en Panamá?</>
            )}
          </h1>
          <p>Encuentra lugares, sabores y experiencias<br />para tu próxima aventura.</p>
          <form className="search-form" onSubmit={(event) => {
            event.preventDefault();
            setSearch(query.trim());
            document.getElementById(collection ?? "destinos")?.scrollIntoView();
          }}>
            <Search aria-hidden="true" size={24} />
            <input
              aria-label="Buscar destino, alojamiento o restaurante"
              placeholder="Busca un destino, alojamiento o experiencia"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      </section>

      <div className="container home-sections">
        {/* Accesos a las categorías del catálogo */}
        <CategoryNavigation />
        {search && (
          <p role="status" className="search-status">
            Resultados para “{search}”
            <button onClick={() => { setQuery(""); setSearch(""); }}>Mostrar todos</button>
          </p>
        )}

        {(!collection || collection === "destinos") && (
        <CatalogSection id="destinos" title="Destinos populares" showMore={!collection}>
          {destinations.filter((item) => matches(item.name)).map((item) => (
            <article key={item.name} className="destination-card">
              <button className="service-image-button" onClick={() => setSelectedService(item)}
                aria-label={`Ver ${item.name}`}>
                <CatalogImage src={`/P-Principal/Destinos/${item.image}`} alt={item.name} />
              </button>
              <div className="destination-caption">
                <h3>{item.name}</h3><p>{item.subtitle}</p>
              </div>
            </article>
          ))}
          {!destinations.some((item) => matches(item.name)) && <p>No hay destinos coincidentes.</p>}
        </CatalogSection>
        )}

        {(!collection || collection === "alojamientos") && (
        <CatalogSection
          id="alojamientos"
          title="Encuentra tu próxima estadía"
          showMore={!collection}
        >
          {stays.filter((item) => matches(`${item.name} ${item.location}`)).map((item) => (
            <CatalogCard key={item.name} item={item} folder="Alojamientos" unit="noche"
              favorite={favorites.includes(item.name)}
              onFavorite={() => toggleFavorite(item.name)}
              onOpen={() => setSelectedService({ ...item, unit: "noche" })} />
          ))}
          {!stays.some((item) => matches(`${item.name} ${item.location}`))
            && <p>No hay alojamientos coincidentes.</p>}
        </CatalogSection>
        )}

        {(!collection || collection === "restaurantes") && (
        <CatalogSection id="restaurantes" title="¿Algo para comer?" showMore={!collection}>
          {restaurants.filter((item) => matches(`${item.name} ${item.location}`)).map((item) => (
            <CatalogCard key={item.name} item={item} folder="Restaurantes" unit="persona"
              favorite={favorites.includes(item.name)}
              onFavorite={() => toggleFavorite(item.name)}
              onOpen={() => setSelectedService({ ...item, unit: "persona" })} />
          ))}
          {!restaurants.some((item) => matches(`${item.name} ${item.location}`))
            && <p>No hay restaurantes coincidentes.</p>}
        </CatalogSection>
        )}

        {/* Colección de actividades con imágenes pendientes */}
        {(!collection || collection === "actividades") && (
          <CatalogSection
            id="actividades"
            title="Actividades para descubrir"
            showMore={!collection}
          >
            {activities.filter((item) => matches(`${item.name} ${item.location}`)).map((item) => (
              <CatalogCard
                key={item.name}
                item={item}
                folder="Actividades"
                unit="persona"
                favorite={favorites.includes(item.name)}
                onFavorite={() => toggleFavorite(item.name)}
                onOpen={() => setSelectedService({ ...item, unit: "persona" })}
              />
            ))}
            {!activities.some((item) => matches(`${item.name} ${item.location}`)) && (
              <p>No hay actividades coincidentes.</p>
            )}
          </CatalogSection>
        )}

        {/* Expone los favoritos seleccionados durante esta visita */}
        <section id="favoritos" className="favorites-summary" aria-live="polite">
          <p>{favorites.length > 0
            ? `Favoritos: ${favorites.join(", ")}`
            : "Marca el corazón para guardar tus favoritos en esta visita."}</p>
        </section>

        {/* Reserva la fotografía de la experiencia destacada */}
        {!collection && (
        <section id="experiencias" className="experience-banner">
          <div className="experience-art" />
          <div className="experience-content">
            <p>EXPERIENCIAS DESTACADAS</p>
            <h2>Pasadía en Isla Grande, Colón</h2>
            <a href="mailto:hola@panamaviajero.app?subject=Pasadía%20en%20Isla%20Grande">
              Descubrir <ChevronRight size={18} />
            </a>
          </div>
        </section>
        )}
      </div>
      <ServicePreviewDialog service={selectedService} onClose={() => setSelectedService(null)} />
    </main>
  );
}
