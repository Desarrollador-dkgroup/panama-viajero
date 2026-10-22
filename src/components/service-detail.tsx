import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays, Check, ExternalLink, Heart, Mail, MapPin, Phone, Share2, Star, Users,
} from "lucide-react";
import type { ServiceDetailData } from "@/lib/service-details";
import styles from "./service-detail.module.css";

// Página del catálogo a la que vuelve cada categoría.
const BACK_LINKS: Record<string, { href: string; label: string }> = {
  hospedaje: { href: "/alojamientos", label: "alojamientos" },
  restaurantes: { href: "/restaurantes", label: "restaurantes" },
  actividades: { href: "/actividades", label: "actividades" },
  transporte: { href: "/transporte", label: "transporte" },
  "tour-operador": { href: "/tours", label: "tours" },
};

// Presenta la información completa de un servicio de Supabase.
export function ServiceDetail({ service }: { service: ServiceDetailData | null }) {
  // Informa cuando el servicio no existe sin sustituirlo por un hotel ficticio.
  if (!service) {
    return (
      <main className="container">
        <h1>Servicio no encontrado</h1>
      </main>
    );
  }

  const isRestaurant = service.category === "restaurantes";
  const isLodging = service.category === "hospedaje";
  const back = BACK_LINKS[service.category] ?? { href: "/", label: "inicio" };
  const [mainPhoto, ...otherPhotos] = service.photos.length
    ? service.photos
    : [service.image];
  const tiles = otherPhotos.slice(0, 2);
  const { contact } = service;
  const hasContact = contact.phone || contact.email || contact.website || contact.menuUrl;
  const subtitle = [service.typeLabel || service.categoryLabel, service.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className={styles.page}>
      <section className={styles.cover}>
        <Image src={service.image} alt={service.name} fill priority />
        <div>
          <p>{subtitle}</p>
          <h1>{service.name}</h1>
        </div>
      </section>
      <div className={styles.content}>
        <Link href={back.href} className={styles.back}>
          ← Volver a {back.label}
        </Link>
        <header className={styles.header}>
          <div>
            <p className={styles.location}>
              <MapPin size={16} />
              {service.address || service.location}
            </p>
            <h2>{service.name}</h2>
          </div>
          {service.reviews > 0 && (
            <span className={styles.rating}>
              <Star size={17} fill="currentColor" /> {service.rating} · {service.reviews} reseñas
            </span>
          )}
        </header>
        <div className={tiles.length ? styles.gallery : styles.gallerySingle}>
          <Image src={mainPhoto} alt={`Foto principal de ${service.name}`} fill />
          {tiles.length > 0 && (
            <div className={styles.galleryTiles}>
              {tiles.map((photo, index) => (
                <Image key={photo} src={photo} alt={`Foto ${index + 2} de ${service.name}`} fill />
              ))}
            </div>
          )}
        </div>
        <section className={styles.intro}>
          <div>
            <h3>Descripción</h3>
            <p>{service.description}</p>
          </div>
          <div className={styles.actions}>
            <button aria-label="Añadir a favoritos">
              <Heart size={20} />
            </button>
            <button aria-label="Compartir">
              <Share2 size={20} />
            </button>
            <button className={styles.reserve}>Reservar ahora</button>
          </div>
        </section>
        {(isLodging || isRestaurant) && (
          <section className={styles.bookingGrid}>
            <div>
              <h3>Opciones de reserva</h3>
              <label>
                <Users size={17} /> 2 personas
              </label>
              <label>
                <CalendarDays size={17} /> Selecciona la fecha
              </label>
            </div>
            <div className={styles.rooms}>
              <h3>{isRestaurant ? "Menú del restaurante" : "Habitaciones disponibles"}</h3>
              {isRestaurant && !service.menu.length && (
                <p>
                  {contact.menuUrl ? "Consulta el menú en el enlace del restaurante." :
                    "El restaurante aún no ha publicado su menú."}
                </p>
              )}
              {isLodging && !service.rooms.length && (
                <p>Consulta disponibilidad y tarifas con el alojamiento.</p>
              )}
              {isRestaurant
                ? service.menu.map((section) => (
                    <div key={section.section} className={styles.menuSection}>
                      <h4>{section.section}</h4>
                      {section.dishes.map((dish) => (
                        <article key={dish.name}>
                          <div>
                            <strong>{dish.name}</strong>
                            <p>{dish.description}</p>
                          </div>
                          <strong>${dish.price.toFixed(2)}</strong>
                        </article>
                      ))}
                    </div>
                  ))
                : service.rooms.map((room) => (
                    <article key={room.name}>
                      <div>
                        <h4>{room.name}</h4>
                        <p>{room.description}</p>
                        <small>
                          {[room.beds && `${room.beds} camas`, room.capacity]
                            .filter(Boolean).join(" · ")}
                        </small>
                      </div>
                      <strong>
                        ${room.price}
                        <small>/ noche</small>
                      </strong>
                      <button>Seleccionar</button>
                    </article>
                  ))}
            </div>
          </section>
        )}
        {service.facts.length > 0 && (
          <section className={styles.infoSection}>
            <h3>{isRestaurant ? "Información y horario" : "Información del alojamiento"}</h3>
            <dl className={styles.facts}>
              {service.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {service.amenities.length > 0 && (
          <section className={styles.infoSection}>
            <h3>Servicios y comodidades</h3>
            <div className={styles.amenities}>
              {service.amenities.map((item) => (
                <span key={item}>
                  <Check size={16} />
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
        <section className={styles.infoColumns}>
          <div>
            {service.policies.length > 0 && (
              <>
                <h3>Normas y condiciones</h3>
                {service.policies.map((item) => (
                  <p key={item} style={{ whiteSpace: "pre-line" }}>{item}</p>
                ))}
              </>
            )}
            {hasContact && (
              <>
                <h3>Contacto</h3>
                {contact.phone && (
                  <p><a href={`tel:${contact.phone}`}><Phone size={15} /> {contact.phone}</a></p>
                )}
                {contact.email && (
                  <p><a href={`mailto:${contact.email}`}><Mail size={15} /> {contact.email}</a></p>
                )}
                {contact.website && (
                  <p>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={15} /> Sitio web
                    </a>
                  </p>
                )}
                {contact.menuUrl && (
                  <p>
                    <a href={contact.menuUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={15} /> Ver menú
                    </a>
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <h3>Ubicación</h3>
            {service.mapsEmbedUrl ? (
              <iframe
                className={styles.mapFrame}
                src={service.mapsEmbedUrl}
                title={`Mapa de ${service.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className={styles.map}>
                <MapPin size={25} />
                <span>{service.address || service.location}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
