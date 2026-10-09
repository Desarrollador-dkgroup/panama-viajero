import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Heart, MapPin, Share2, Star, Users } from "lucide-react";
import { demoHotel } from "@/data/service-details";
import type { ServiceDetailData } from "@/lib/service-details";
import styles from "./service-detail.module.css";

// Presenta la información completa de un servicio de hospedaje de demostración.
export function ServiceDetail({ service }: { service: ServiceDetailData | null }) {
  const hotel = service ?? {
    ...demoHotel,
    category: "hospedaje",
    id: "demo",
    slug: "demo",
    menu: [],
  };
  const isRestaurant = hotel.category === "restaurantes";

  return (
    <main className={styles.page}>
      <section className={styles.cover}>
        <Image src={hotel.image} alt={hotel.name} fill priority />
        <div><p>ALOJAMIENTO · BOCAS DEL TORO</p><h1>{hotel.name}</h1></div>
      </section>
      <div className={styles.content}>
        <Link href="/alojamientos" className={styles.back}>← Volver a alojamientos</Link>
        <header className={styles.header}>
          <div><p className={styles.location}><MapPin size={16} />{hotel.location}</p><h2>{hotel.name}</h2></div>
          <span className={styles.rating}><Star size={17} fill="currentColor" /> {hotel.rating} · {hotel.reviews} reseñas</span>
        </header>
        <div className={styles.gallery}>
          <Image src={hotel.image} alt="Vista principal del hotel" fill />
          <div className={styles.galleryTiles}><Image src={hotel.image} alt="Habitación" fill /><Image src={hotel.image} alt="Exterior" fill /></div>
        </div>
        <section className={styles.intro}>
          <div><h3>Descripción</h3><p>{hotel.description}</p></div>
          <div className={styles.actions}><button aria-label="Añadir a favoritos"><Heart size={20} /></button><button aria-label="Compartir"><Share2 size={20} /></button><button className={styles.reserve}>Reservar ahora</button></div>
        </section>
        <section className={styles.bookingGrid}>
          <div><h3>{isRestaurant ? "Opciones de reserva" : "Opciones de reserva"}</h3><label><Users size={17} /> 2 personas</label><label><CalendarDays size={17} /> Selecciona la fecha</label></div>
          <div className={styles.rooms}>
            <h3>{isRestaurant ? "Menú del restaurante" : "Habitaciones disponibles"}</h3>
            {isRestaurant ? hotel.menu.map((section) => (
              <div key={section.section} className={styles.menuSection}>
                <h4>{section.section}</h4>
                {section.dishes.map((dish) => <article key={dish.name}><div><strong>{dish.name}</strong><p>{dish.description}</p></div><strong>${dish.price.toFixed(2)}</strong></article>)}
              </div>
            )) : hotel.rooms.map((room) => <article key={room.name}><div><h4>{room.name}</h4><p>{room.description}</p><small>{room.beds} · {room.capacity}</small></div><strong>${room.price}<small>/ noche</small></strong><button>Seleccionar</button></article>)}
          </div>
        </section>
        <section className={styles.infoSection}><h3>Servicios y comodidades</h3><div className={styles.amenities}>{hotel.amenities.map((item) => <span key={item}><Check size={16} />{item}</span>)}</div></section>
        <section className={styles.infoColumns}><div><h3>Normas de la casa</h3>{hotel.policies.map((item) => <p key={item}>• {item}</p>)}</div><div><h3>Ubicación</h3><div className={styles.map}><MapPin size={25} /><span>{hotel.location}</span></div></div></section>
        <section className={styles.reviews}><h3>Comentarios</h3><div className={styles.reviewGrid}>{["La atención fue excelente y el lugar muy tranquilo.", "Las habitaciones son cómodas y la ubicación es perfecta.", "Una experiencia caribeña que volveríamos a repetir."].map((text) => <article key={text}><strong>Viajero verificado</strong><span>★★★★★</span><p>{text}</p></article>)}</div></section>
      </div>
    </main>
  );
}
