"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronRight, Heart, ImageIcon, MapPin, Star,
} from "lucide-react";
import { activities, restaurants, stays } from "@/data/home";
import { CategoryNavigation } from "@/components/category-navigation";
import { SiteBanner } from "@/components/site-banner";

const homeProvinces = [
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

type CatalogItem = (typeof stays)[number] & { slug?: string };
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
  const imageSource = src.startsWith("/") || src.startsWith("http")
    ? src
    : "/P-Principal/Banner.png";

  return (
    <div className="catalog-image">
      {failed ? (
        <div className="image-placeholder">
          <ImageIcon size={30} /><span>{alt}</span>
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
function CatalogCard({ item, folder, unit, favorite, onFavorite }: {
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
      <Link className="service-image-button" href={`/servicios/${serviceSlug}`}
        target="_blank" rel="noopener noreferrer" aria-label={`Ver ${item.name}`}>
        <CatalogImage
          src={item.image.startsWith("http")
            ? item.image
            : item.image.includes("/")
              ? "/P-Principal/Banner.png"
              : `/P-Principal/${folder}/${item.image}`}
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
  const [databaseStays, setDatabaseStays] = useState<typeof stays>(stays);
  const [databaseRestaurants, setDatabaseRestaurants] = useState<typeof restaurants>([]);

  // Carga los hospedajes publicados para reflejarlos también en la portada.
  useEffect(() => {
    fetch("/api/services?category=hospedaje")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as {
          services?: Array<Record<string, unknown>>;
        };
        const services = result.services ?? [];
        if (!services.length) return;

        const mapped = services.map((service) => {
          const city = service.cities as { name?: string } | null;
          const photos = service.service_photos as Array<{ storage_path?: string }> | null;
          const cents = service.cached_price_from_cents ?? service.base_price_cents;

          return {
            slug: String(service.slug ?? service.id),
            name: String(service.name),
            location: city?.name ?? "Panamá",
            price: Number(cents ?? 0) / 100,
            rating: Number(service.rating_avg ?? 0).toFixed(1),
            image: photos?.[0]?.storage_path ?? "",
          };
        });

        setDatabaseStays(mapped);
      })
      .catch(() => undefined);
  }, []);

  // Carga todos los restaurantes publicados para la colección de la portada.
  useEffect(() => {
    fetch("/api/services?category=restaurantes")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as {
          services?: Array<Record<string, unknown>>;
        };
        const services = result.services ?? [];
        if (!services.length) return;

        const mapped = services.map((service) => {
          const city = service.cities as { name?: string } | null;
          const photos = service.service_photos as Array<{ storage_path?: string }> | null;
          const cents = service.cached_price_from_cents ?? service.base_price_cents;

          return {
            slug: String(service.slug ?? service.id),
            name: String(service.name),
            location: city?.name ?? "Panamá",
            price: Number(cents ?? 0) / 100,
            rating: Number(service.rating_avg ?? 0).toFixed(1),
            image: photos?.[0]?.storage_path ?? "",
          };
        });

        setDatabaseRestaurants(mapped);
      })
      .catch(() => undefined);
  }, []);

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
      <SiteBanner
        title={collection ? collectionTitles[collection] : (
          <>¿Qué quieres descubrir<br />en Panamá?</>
        )}
        description={<>Encuentra lugares, sabores y experiencias<br />para tu próxima aventura.</>}
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
            <button onClick={() => { setQuery(""); setSearch(""); }}>Mostrar todos</button>
          </p>
        )}

        {(!collection || collection === "destinos") && (
        <CatalogSection id="destinos" title="Destinos populares" showMore={!collection}>
          {homeProvinces.filter((item) => matches(item.name)).map((item) => (
            <article key={item.slug} className="destination-card">
              <Link className="service-image-button" href={`/destinos/${item.slug}`}>
                <CatalogImage src={`/P-Principal/Destinos/${item.image}`} alt={item.name} />
              </Link>
              <div className="destination-caption">
                <h3>{item.name}</h3><p>{item.subtitle}</p>
              </div>
            </article>
          ))}
          {!homeProvinces.some((item) => matches(item.name)) && <p>No hay destinos coincidentes.</p>}
        </CatalogSection>
        )}

        {(!collection || collection === "alojamientos") && (
        <CatalogSection
          id="alojamientos"
          title="Encuentra tu próxima estadía"
          showMore={!collection}
        >
          {databaseStays.filter((item) => matches(`${item.name} ${item.location}`)).map((item) => (
            <CatalogCard key={item.slug ?? `${item.name}-${item.location}`} item={item}
              folder="Alojamientos" unit="noche"
              favorite={favorites.includes(item.name)}
            onFavorite={() => toggleFavorite(item.name)} />
          ))}
          {!databaseStays.some((item) => matches(`${item.name} ${item.location}`))
            && <p>No hay alojamientos coincidentes.</p>}
        </CatalogSection>
        )}

        {(!collection || collection === "restaurantes") && (
        <CatalogSection id="restaurantes" title="¿Algo para comer?" showMore={!collection}>
          {databaseRestaurants.filter((item) => matches(`${item.name} ${item.location}`)).map((item) => (
            <CatalogCard key={item.slug ?? `${item.name}-${item.location}`} item={item}
              folder="Restaurantes" unit="persona"
              favorite={favorites.includes(item.name)}
              onFavorite={() => toggleFavorite(item.name)} />
          ))}
          {!databaseRestaurants.some((item) => matches(`${item.name} ${item.location}`))
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
                key={item.slug ?? `${item.name}-${item.location}`}
                item={item}
                folder="Actividades"
                unit="persona"
                favorite={favorites.includes(item.name)}
                onFavorite={() => toggleFavorite(item.name)}
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
    </main>
  );
}
