"use client";

import { useRef, useState } from "react";
import { ExternalLink, LocateFixed, Map, MapPin } from "lucide-react";
import styles from "./explore-catalog.module.css";

// Solicita la ubicación únicamente después de una acción del visitante
export function LocationMap() {
  // Conserva las coordenadas en memoria sin almacenarlas ni enviarlas automáticamente
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const query = coordinates ?? "Panamá";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  // Obtiene una lectura del dispositivo y explica los errores de permiso o conexión
  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("Este navegador no permite obtener tu ubicación. Puedes abrir el mapa de Panamá.");
      return;
    }
    setLoading(true);
    setStatus("Solicitando tu ubicación…");
    const currentRequest = ++request.current;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request.current !== currentRequest) return;
        setCoordinates(`${coords.latitude},${coords.longitude}`);
        setLoading(false);
        setStatus("Ubicación disponible. Pulsa el enlace para abrirla en Google Maps.");
      },
      (error) => {
        if (request.current !== currentRequest) return;
        setLoading(false);
        setStatus(error.code === 1
          ? "Permiso de ubicación denegado. Puedes habilitarlo en tu navegador."
          : "No se pudo obtener tu ubicación. Inténtalo de nuevo o abre el mapa de Panamá.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  return (
    <section className={styles.mapPanel} aria-label="Explorar ubicación en Google Maps">
      <div className={styles.mapDecoration} aria-hidden="true">
        <Map size={115} strokeWidth={1} />
      </div>
      <div className={styles.mapContent}>
        <span className={styles.eyebrow}><MapPin size={15} />CERCA DE TU PRÓXIMA AVENTURA</span>
        <h2>Explora Panamá en el mapa</h2>
        <p>Encuentra tu ubicación y descubre qué hay a tu alrededor.</p>
        <div className={styles.mapActions}>
          <button onClick={locate} disabled={loading} className={styles.primaryButton}>
            <LocateFixed size={17} />{loading ? "Localizando…" : "Usar mi ubicación"}
          </button>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className={styles.mapLink}>
            {coordinates ? "Abrir mi ubicación" : "Explorar Google Maps"}<ExternalLink size={15} />
          </a>
        </div>
        <p className={styles.mapStatus} role="status">{status}</p>
      </div>
    </section>
  );
}
