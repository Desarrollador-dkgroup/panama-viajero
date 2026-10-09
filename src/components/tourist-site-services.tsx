"use client";

import Link from "next/link";
import { useState } from "react";
import { Hotel, Utensils, Bus, LayoutGrid } from "lucide-react";

type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
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
          <Link key={service.id} href={`/servicios/${service.slug}`} target="_blank">
            <strong>{service.name}</strong>
            <span>{service.category}</span>
          </Link>
        ))}
        {!visible.length && <p>No hay servicios de esta categoría para este sitio.</p>}
      </div>
    </>
  );
}
