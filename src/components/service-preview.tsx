"use client";

import { useEffect, useRef } from "react";
import { MapPin, X } from "lucide-react";

// Define los datos visibles al seleccionar una imagen del catálogo
export type ServicePreview = {
  name: string;
  location?: string;
  subtitle?: string;
  price?: number;
  unit?: string;
};

// Presenta el servicio seleccionado en un diálogo con foco y cierre nativos
export function ServicePreviewDialog({ service, onClose }: {
  service: ServicePreview | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  // Abre el diálogo y bloquea el desplazamiento del contenido de fondo
  useEffect(() => {
    if (!service) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, [service]);

  return (
    <dialog
      ref={dialog}
      className="service-dialog"
      aria-labelledby="service-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      {service && (
        <div className="service-preview">
          <button className="dialog-close" aria-label="Cerrar vista del servicio"
            onClick={() => dialog.current?.close()}>
            <X size={22} />
          </button>
          <p className="preview-eyebrow">DESCUBRE PANAMÁ</p>
          <h2 id="service-title">{service.name}</h2>
          {service.location && <p className="location"><MapPin size={16} />{service.location}</p>}
          {service.subtitle && <p>{service.subtitle}</p>}
          {service.price !== undefined && (
            <p className="preview-price">
              Desde <strong>${service.price}</strong> / {service.unit}
            </p>
          )}
          <p className="preview-note">
            Vista previa del catálogo. Detalles del servicio próximamente.
          </p>
        </div>
      )}
    </dialog>
  );
}
