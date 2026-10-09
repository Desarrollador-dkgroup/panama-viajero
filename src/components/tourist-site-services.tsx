"use client";

import Link from "next/link";
import { useState } from "react";
import { Hotel, Utensils, Bus, LayoutGrid, Heart, MapPin, Star } from "lucide-react";

type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  city: string;
};

type TouristSiteServicesProps = {
  services: Service[];
  siteName: string;
};

const filters = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "hospedaje", label: "Hospedajes", icon: Hotel },
  { id: "restaurantes", label: "Restaurantes", icon: Utensils },
  { id: "transporte", label: "Transporte", icon: Bus },
];

// Filtra los servicios relacionados con el sitio turístico actual.
export function TouristSiteServices({ services, siteName }: TouristSiteServicesProps) {
  const [selected, setSelected] = useState("todos");
  const visible = selected === "todos"
    ? services
    : services.filter((service) => service.category === selected);
  const selectedLabel = filters.find((filter) => filter.id === selected)?.label;
  const title = selected === "todos"
    ? `Servicios en ${siteName}`
    : `${selectedLabel} en ${siteName}`;

  return (
    <>
      <div className="tourist-filter-panel">
        <div className="tourist-filters" role="tablist" aria-label="Servicios del sitio">
          {filters.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={selected === id}
              className={selected === id ? "selected" : ""} onClick={() => setSelected(id)}>
              <span><Icon size={26} /></span>{label}
            </button>
          ))}
        </div>
      </div>
      <h2 className="tourist-services-title">{title}</h2>
      <div className="tourist-services-grid">
        {visible.map((service) => (
          <Link
            key={service.id}
            className="tourist-service-card"
            href={`/servicios/${service.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tourist-service-image">
              <img src="/P-Principal/Banner.png" alt={service.name} />
              <span className="tourist-service-badge">
                {service.categoryLabel}
              </span>
              <Heart className="tourist-service-heart" size={22} />
            </div>
            <div className="tourist-service-details">
              <h3>{service.name}</h3>
              <p className="tourist-service-rating">
                <Star size={16} fill="currentColor" /> 4.8 (12 reseñas)
              </p>
              <p className="tourist-service-description">
                Servicio disponible para disfrutar este sitio turístico.
              </p>
              <p className="tourist-service-location">
                <MapPin size={15} /> {service.city || siteName}
              </p>
              <strong className="tourist-service-price">
                Ver información del servicio
              </strong>
              <span className="tourist-service-arrow">→</span>
            </div>
          </Link>
        ))}
        {!visible.length && <p>No hay servicios de esta categoría para este sitio.</p>}
      </div>
    </>
  );
}
