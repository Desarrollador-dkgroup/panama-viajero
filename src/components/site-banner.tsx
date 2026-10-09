import Image from "next/image";
import { Search } from "lucide-react";

type SiteBannerProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  eyebrow?: string;
  showSearch?: boolean;
  query?: string;
  onQueryChange?: (value: string) => void;
  onSearch?: () => void;
};

// Presenta el banner compartido por la portada y la página de destinos.
export function SiteBanner({
  title,
  description,
  eyebrow,
  showSearch = false,
  query = "",
  onQueryChange,
  onSearch,
}: SiteBannerProps) {
  return (
    <section className="hero">
      <Image src="/P-Principal/Banner.png" alt="Paisaje de Panamá" fill
        priority sizes="100vw" className="hero-image" />
      <div className="hero-overlay" />
      <div className="container hero-content">
        {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
        {showSearch && (
          <form className="search-form" onSubmit={(event) => {
            event.preventDefault();
            onSearch?.();
          }}>
            <Search aria-hidden="true" size={24} />
            <input
              aria-label="Buscar destino, alojamiento o restaurante"
              placeholder="Busca un destino, alojamiento o experiencia"
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
        )}
      </div>
    </section>
  );
}
