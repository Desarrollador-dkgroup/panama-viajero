"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Heart, ImageIcon, MapPin, Star } from "lucide-react";
import type { CatalogService } from "@/data/catalog";
import { usePublishedServices } from "@/lib/use-published-services";
import { useDestinations } from "@/lib/use-destinations";
import { CategoryNavigation } from "@/components/category-navigation";
import { SiteBanner } from "@/components/site-banner";

type CatalogItem = CatalogService;
type Collection = "destinos" | "alojamientos" | "restaurantes" | "actividades";

// Define los encabezados de las páginas de cada colección
const collectionTitles: Record<Collection, string> = {
  destinos: "Descubre los destinos de Panamá",
  alojamientos: "Encuentra tu próxima estadía",
  restaurantes: "Descubre los sabores de Panamá",
  actividades: "Vive tu próxima aventura",
};

// Explica el estado de una colección sin sustituir datos ausentes.
function serviceMessage(status: string, category: string) {
  if (status === "loading") return "Cargando servicios...";
  if (status === "error") return "No se pudieron cargar los servicios.";
  return `No hay ${category} coincidentes.`;
}

// Reserva el espacio de las fotografías que todavía no están disponibles
export function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const imageSource =
    src.startsWith("/") || src.startsWith("http") ? src : "/P-Principal/Banner.png";

  return (
    <div className="catalog-image">
      {failed ? (
        <div className="image-placeholder">
          <ImageIcon size={30} />
          <span>{alt}</span>
        </div>
      ) : (
        <Image
          src={imageSource}
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
function CatalogCard({
  item,
  folder,
  unit,
  favorite,
  onFavorite,
}: {
  item: CatalogItem;
  folder: string;
  unit: string;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const fallbackSlug = item.name.toLowerCase().replace(/\s+/g, "-");
  const serviceSlug = item.slug ?? fallbackSlug;

  return (
    <article className="catalog-card">
      <Link
        className="service-image-button"
        href={`/servicios/${serviceSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver ${item.name}`}
      >
        <CatalogImage
          src={
            item.image.startsWith("http")
              ? item.image
              : item.image.includes("/")
                ? "/P-Principal/Banner.png"
                : `/P-Principal/${folder}/${item.image}`
          }
          alt={item.name}
        />
      </Link>
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
          <span className="rating">
            <Star size={16} fill="currentColor" />
            {item.rating}
          </span>
        </div>
        <p className="location">
          <MapPin size={13} />
          {item.location}
        </p>
        <p className="price">
          {item.price > 0
            ? <>Desde <strong>${item.price}</strong> / {unit}</>
            : "Consultar precio"}
        </p>
      </div>
    </article>
  );
}

// Desplaza cada colección horizontalmente con sus botones
function CatalogSection({
  id,
  title,
  showMore = true,
  children,
}: {
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
  // Carga las colecciones reales sin registros de demostración.
  const destinations = useDestinations();
  const staysResult = usePublishedServices("hospedaje");
  const restaurantsResult = usePublishedServices("restaurantes");
  const activitiesResult = usePublishedServices("actividades");
  const databaseStays = staysResult.items;
  const databaseRestaurants = restaurantsResult.items;
  const activities = activitiesResult.items;

  // Alterna la selección de favoritos
  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name],
    );
  };

  // Normaliza las búsquedas para comparar sin acentos ni mayúsculas
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const matches = (value: string) => normalize(value).includes(normalize(search));

  return (
    <main id="contenido">
      {/* Banner principal y formulario de búsqueda */}
      <SiteBanner
        title={
          collection ? (
            collectionTitles[collection]
          ) : (
            <>
              ¿Qué quieres descubrir
              <br />
              en Panamá?
            </>
          )
        }
        description={
          <>
            Encuentra lugares, sabores y experiencias
            <br />
            para tu próxima aventura.
          </>
        }
        query={query}
        showSearch
        onQueryChange={setQuery}
        onSearch={() => {
          setSearch(query.trim());
          document.getElementById(collection ?? "destinos")?.scrollIntoView();
        }}
      />

      <div className="container home-sections">
        {/* Accesos a las categorías del catálogo */}
        <CategoryNavigation />
        {search && (
          <p role="status" className="search-status">
            Resultados para “{search}”
            <button
              onClick={() => {
                setQuery("");
                setSearch("");
              }}
            >
              Mostrar todos
            </button>
          </p>
        )}

        {(!collection || collection === "destinos") && (
          <CatalogSection id="destinos" title="Destinos populares" showMore={!collection}>
            {destinations.items
              .filter((item) => matches(item.name))
              .map((item) => (
                <article key={item.slug} className="destination-card">
                  <Link className="service-image-button" href={`/destinos/${item.slug}`}>
                    <CatalogImage src={item.cardImage} alt={item.name} />
                  </Link>
                  <div className="destination-caption">
                    <h3>{item.name}</h3>
                    <p>{item.subtitle}</p>
                  </div>
                </article>
              ))}
            {destinations.status === "ready" &&
              !destinations.items.some((item) => matches(item.name)) && (
              <p>No hay destinos coincidentes.</p>
            )}
          </CatalogSection>
        )}

        {(!collection || collection === "alojamientos") && (
          <CatalogSection
            id="alojamientos"
            title="Encuentra tu próxima estadía"
            showMore={!collection}
          >
            {databaseStays
              .filter((item) => matches(`${item.name} ${item.location} ${item.searchText}`))
              .map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  folder="Alojamientos"
                  unit="noche"
                  favorite={favorites.includes(item.name)}
                  onFavorite={() => toggleFavorite(item.name)}
                />
              ))}
            {!databaseStays.some((item) =>
              matches(`${item.name} ${item.location} ${item.searchText}`),
            ) && <p>{serviceMessage(staysResult.status, "alojamientos")}</p>}
          </CatalogSection>
        )}

        {(!collection || collection === "restaurantes") && (
          <CatalogSection id="restaurantes" title="¿Algo para comer?" showMore={!collection}>
            {databaseRestaurants
              .filter((item) => matches(`${item.name} ${item.location} ${item.searchText}`))
              .map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  folder="Restaurantes"
                  unit="persona"
                  favorite={favorites.includes(item.name)}
                  onFavorite={() => toggleFavorite(item.name)}
                />
              ))}
            {!databaseRestaurants.some((item) =>
              matches(`${item.name} ${item.location} ${item.searchText}`),
            ) && <p>{serviceMessage(restaurantsResult.status, "restaurantes")}</p>}
          </CatalogSection>
        )}

        {/* Colección de actividades con imágenes pendientes */}
        {(!collection || collection === "actividades") && (
          <CatalogSection
            id="actividades"
            title="Actividades para descubrir"
            showMore={!collection}
          >
            {activities
              .filter((item) => matches(`${item.name} ${item.location} ${item.searchText}`))
              .map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  folder="Actividades"
                  unit="persona"
                  favorite={favorites.includes(item.name)}
                  onFavorite={() => toggleFavorite(item.name)}
                />
              ))}
            {!activities.some((item) =>
              matches(`${item.name} ${item.location} ${item.searchText}`),
            ) && <p>{serviceMessage(activitiesResult.status, "actividades")}</p>}
          </CatalogSection>
        )}

        {/* Expone los favoritos seleccionados durante esta visita */}
        <section id="favoritos" className="favorites-summary" aria-live="polite">
          <p>
            {favorites.length > 0
              ? `Favoritos: ${favorites.join(", ")}`
              : "Marca el corazón para guardar tus favoritos en esta visita."}
          </p>
        </section>
      </div>
    </main>
  );
}
