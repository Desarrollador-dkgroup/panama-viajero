import Link from "next/link";
import type { IconType } from "react-icons";
import {
  IoArrowForward,
  IoBedOutline,
  IoBusOutline,
  IoLocationOutline,
  IoMegaphoneOutline,
  IoRestaurantOutline,
  IoStar,
  IoWalkOutline,
} from "react-icons/io5";
import { CoverPhoto, FavoriteButton, SectionHeader } from "@/components/app/ui";
import { formatPlace, type CatalogDestination, type CatalogItem } from "@/lib/catalog";
import styles from "./home.module.css";

// Secciones de la portada de la app (src/components/home/*), con datos del panel.

type GridTile = { id: string; label: string; href: string; icon: IconType; color: string };

const HOME_GRID_TILES: GridTile[] = [
  { id: "hospedaje", label: "Hospedaje", href: "/categoria/hospedaje", icon: IoBedOutline,
    color: "#E07A3F" },
  { id: "restaurantes", label: "Restaurantes", href: "/categoria/restaurantes",
    icon: IoRestaurantOutline, color: "#2F8FE0" },
  { id: "actividades", label: "Actividades", href: "/categoria/actividades", icon: IoWalkOutline,
    color: "#A82C4C" },
  { id: "transporte", label: "Transporte", href: "/categoria/transporte", icon: IoBusOutline,
    color: "#D23B3B" },
  { id: "tour-operador", label: "Tours", href: "/categoria/tour-operador",
    icon: IoLocationOutline, color: "#324A91" },
  { id: "promociones", label: "Promociones", href: "/promociones", icon: IoMegaphoneOutline,
    color: "#2F6FE0" },
];

export function CategoryGrid() {
  return (
    <div className={styles.categoryGrid}>
      {HOME_GRID_TILES.map(({ id, label, href, icon: Icon, color }) => (
        <Link key={id} href={href} className={styles.categoryTile}>
          <span className={styles.categoryIcon}>
            <Icon size={20} color={color} aria-hidden />
          </span>
          <span className={styles.categoryLabel}>{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function DestinationsCarousel({ destinations }: { destinations: CatalogDestination[] }) {
  if (destinations.length === 0) return null;
  return (
    <section>
      <SectionHeader title="Destinos Populares" href="/destinos" />
      <div className={styles.destinationGrid}>
        {destinations.slice(0, 4).map((destination, index) => (
          <Link
            key={destination.id}
            href={`/destinos/${destination.slug}`}
            className={`${styles.destinationCard} ${index >= 2 ? styles.desktopOnly : ""}`}
          >
            <CoverPhoto src={destination.cardImage} />
            <div className={styles.destinationShade} aria-hidden />
            <div className={styles.destinationText}>
              <span className={styles.destinationName}>{destination.name}</span>
              {destination.subtitle && (
                <span className={styles.destinationDescription}>{destination.subtitle}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ToursCarousel({ tours }: { tours: CatalogItem[] }) {
  if (tours.length === 0) return null;
  return (
    <section>
      <SectionHeader title="Tours y experiencias" href="/categoria/tour-operador" />
      <div className={`${styles.carousel} no-scrollbar`}>
        {tours.map((item) => (
          <Link key={item.id} href={`/servicios/${item.slug}`} className={styles.tourCard}>
            <CoverPhoto src={item.photo} alt="" />
            <div className={styles.tourScrim} aria-hidden />
            <div className={styles.tourBody}>
              <span className={styles.tourName}>{item.name}</span>
              <span className={styles.tourDescription}>{item.searchDescription}</span>
              <div className={styles.tourFooter}>
                <span className={styles.pricePill}>
                  Desde <strong>${item.price}</strong> / persona
                </span>
                <span className={styles.arrowButton}>
                  <IoArrowForward size={16} color="#1A1A1A" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedServices({ services }: { services: CatalogItem[] }) {
  if (services.length === 0) return null;
  return (
    <div className={`${styles.carousel} no-scrollbar`}>
      {services.map((item) => (
        <Link key={item.id} href={`/servicios/${item.slug}`} className={styles.featuredCard}>
          <CoverPhoto src={item.photo} alt="" />
          <div className={styles.featuredScrim} aria-hidden />
          <div className={styles.featuredContent}>
            <span className={styles.eyebrow}>SERVICIO DESTACADO</span>
            <span className={styles.featuredTitle}>{item.name}, {formatPlace(item)}</span>
            <span className={styles.cta}>
              Descubrir
              <IoArrowForward size={14} color="#1A1A1A" aria-hidden />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className={styles.ratingRow}>
      <IoStar size={13} color="var(--star)" aria-hidden />
      <span className={styles.ratingText}>{value.toFixed(1)}</span>
    </span>
  );
}

function Place({ item }: { item: CatalogItem }) {
  return (
    <span className={styles.locationRow}>
      <IoLocationOutline size={13} color="var(--text-muted)" aria-hidden />
      <span className={styles.location}>{formatPlace(item)}</span>
    </span>
  );
}

export function StaysCarousel({ stays }: { stays: CatalogItem[] }) {
  if (stays.length === 0) return null;
  return (
    <section>
      <SectionHeader title="Encuentra tu próxima estadía" href="/categoria/hospedaje" />
      <div className={`${styles.carousel} no-scrollbar`}>
        {stays.map((item) => (
          <div key={item.id} className={styles.stayCard}>
            <Link
              href={`/servicios/${item.slug}`}
              className={styles.cardLink}
              aria-label={`${item.name}, ${formatPlace(item)}`}
            />
            <div className={styles.stayPhoto}>
              <CoverPhoto src={item.photo} alt="" />
            </div>
            <FavoriteButton serviceId={item.id} />
            <div className={styles.cardBody}>
              <div className={styles.titleRow}>
                <span className={styles.stayName}>{item.name}</span>
                <Rating value={item.rating} />
              </div>
              <Place item={item} />
              <div className={styles.divider} />
              <span className={styles.priceLine}>
                Desde <strong>${item.price}</strong> / noche
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RestaurantsCarousel({ restaurants }: { restaurants: CatalogItem[] }) {
  if (restaurants.length === 0) return null;
  return (
    <section>
      <SectionHeader title="¿Algo para comer?" href="/categoria/restaurantes" />
      <div className={`${styles.carousel} no-scrollbar`}>
        {restaurants.map((item) => (
          <div key={item.id} className={styles.restaurantCard}>
            <Link
              href={`/servicios/${item.slug}`}
              className={styles.cardLink}
              aria-label={`${item.name}, ${formatPlace(item)}`}
            />
            <div className={styles.restaurantPhoto}>
              <CoverPhoto src={item.photo} alt="" />
            </div>
            <FavoriteButton serviceId={item.id} />
            <div className={styles.cardBody}>
              <div className={styles.titleRow}>
                <span className={styles.restaurantName}>{item.name}</span>
                <Rating value={item.rating} />
              </div>
              <Place item={item} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
