"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  IoArrowForward,
  IoChevronForward,
  IoClose,
  IoLocationOutline,
  IoMapOutline,
  IoRestaurantOutline,
  IoSearch,
  IoSunnyOutline,
  IoTimeOutline,
  IoTrailSignOutline,
  IoWaterOutline,
} from "react-icons/io5";
import { BackButton } from "@/components/app/back-button";
import { CoverPhoto, PhotoPlaceholder } from "@/components/app/ui";
import { addRecentSearch, clearRecentSearches, useRecentSearches } from "@/lib/recent-searches";
import {
  getSearchSuggestions,
  groupSearchSuggestions,
  suggestionHref,
  type SearchCatalog,
  type SearchSuggestion,
} from "@/lib/search-suggestions";
import styles from "./search.module.css";

const SEARCH_TAB_PLACEHOLDER = "Busca destinos o experiencias";

type ThemeTile = { id: string; label: string; icon: IconType; photo: string } &
  ({ action: "query"; query: string } | { action: "category"; categoryId: string });

const THEME_TILES: ThemeTile[] = [
  { id: "playas", label: "Playas", icon: IoSunnyOutline, photo: "/app/themes/playa-palmeras.jpg",
    action: "query", query: "playa" },
  { id: "senderismo", label: "Senderismo", icon: IoTrailSignOutline,
    photo: "/app/themes/montana-niebla.jpg", action: "query", query: "sendero" },
  { id: "gastronomia", label: "Gastronomía", icon: IoRestaurantOutline,
    photo: "/app/themes/restaurantes-plato.jpg", action: "category", categoryId: "restaurantes" },
  { id: "actividades-acuaticas", label: "Actividades acuáticas", icon: IoWaterOutline,
    photo: "/app/themes/isla-drake.jpg", action: "query", query: "snorkel" },
];

// Pestaña Buscar de la app (src/app/(tabs)/search.tsx).
export function SearchScreen({ catalog, initialQuery = "" }: {
  catalog: SearchCatalog;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const recentSearches = useRecentSearches();
  const suggestions = useMemo(() => getSearchSuggestions(query, catalog), [query, catalog]);
  const sections = useMemo(
    () => groupSearchSuggestions(suggestions, catalog.categories),
    [suggestions, catalog.categories],
  );
  const trimmed = query.trim();

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BackButton />
          <h1 className={styles.headerTitle}>Buscar</h1>
          <span className={styles.backSpacer} />
        </div>
        <label className={styles.searchField}>
          <IoSearch size={20} color="var(--indigo)" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addRecentSearch(query);
            }}
            placeholder={SEARCH_TAB_PLACEHOLDER}
            className={styles.searchInput}
            autoFocus
            autoComplete="off"
            aria-label="Buscar"
          />
          {query.length > 0 && (
            <button type="button" className={styles.clear} onClick={() => setQuery("")}
              aria-label="Borrar búsqueda">
              <IoClose size={18} color="var(--text-dark)" aria-hidden />
            </button>
          )}
        </label>
      </div>

      {trimmed ? (
        <div className={styles.list}>
          <p className={styles.summaryText}>
            <strong>{suggestions.length.toLocaleString("es-PA")}</strong>{" "}
            {suggestions.length === 1 ? "resultado" : "resultados"} para «{trimmed}»
          </p>
          {sections.length === 0 && (
            <p className={styles.emptyState}>No encontramos resultados para «{trimmed}».</p>
          )}
          {sections.map((section) => (
            <section key={section.key}>
              <h2 className={styles.sectionHeading}>{section.title}</h2>
              <div className={styles.resultsGrid}>
                {section.data.map((suggestion) => (
                  <Link
                    key={suggestion.key}
                    href={suggestionHref(suggestion)}
                    className={styles.card}
                    onClick={() => addRecentSearch(trimmed)}
                  >
                    <SuggestionThumbnail suggestion={suggestion} />
                    <span className={styles.cardInfo}>
                      <span className={styles.cardTitle}>{suggestionTitle(suggestion)}</span>
                      <span className={styles.cardDescription}>{suggestion.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.emptyContent}>
          {recentSearches.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.emptyHeading}>Búsquedas recientes</h2>
                <button type="button" className={styles.link} onClick={clearRecentSearches}>
                  Borrar
                </button>
              </div>
              <div className={styles.chipRow}>
                {recentSearches.map((entry) => (
                  <button key={entry} type="button" className={styles.chip}
                    onClick={() => setQuery(entry)}>
                    <IoTimeOutline size={14} color="var(--indigo)" aria-hidden />
                    {entry}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.emptyHeading}>Explora por destino</h2>
              <Link href="/destinos" className={styles.link}>
                Ver todo <IoChevronForward size={14} aria-hidden />
              </Link>
            </div>
            <div className={styles.cityGrid}>
              {catalog.destinations.slice(0, 4).map((destination, index) => (
                <Link
                  key={destination.id}
                  href={`/destinos/${destination.slug}`}
                  className={`${styles.cityCard} ${index >= 2 ? styles.wideOnly : ""}`}
                >
                  <CoverPhoto src={destination.cardImage} />
                  <span className={styles.cityScrim} aria-hidden />
                  <span className={styles.cityName}>{destination.name}</span>
                  {destination.subtitle && (
                    <span className={styles.cityDescription}>{destination.subtitle}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.emptyHeading}>¿Qué te gustaría hacer?</h2>
            <div className={styles.themeGrid}>
              {THEME_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={styles.themeCard}
                    onClick={() =>
                      tile.action === "query"
                        ? setQuery(tile.query)
                        : router.push(`/categoria/${tile.categoryId}`)}
                  >
                    <CoverPhoto src={tile.photo} />
                    <span className={styles.themeScrim} aria-hidden />
                    <Icon size={18} color="#FFFFFF" aria-hidden className={styles.themeIcon} />
                    <span className={styles.themeLabel}>{tile.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <Link href="/categoria/tour-operador" className={styles.banner}>
            <CoverPhoto src="/app/themes/cascada-selva.jpg" />
            <span className={styles.bannerShade} aria-hidden />
            <span className={styles.bannerTag}>Foto ilustrativa</span>
            <span className={styles.bannerText}>
              <span className={styles.bannerTitle}>Vive experiencias únicas en Panamá</span>
              <span className={styles.bannerSubtitle}>
                Naturaleza, cultura y aventura en un solo lugar.
              </span>
            </span>
            <span className={styles.bannerArrow}>
              <IoArrowForward size={18} color="var(--indigo)" aria-hidden />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

function suggestionTitle(suggestion: SearchSuggestion): string {
  if (suggestion.kind === "destination") return suggestion.destination.name;
  if (suggestion.kind === "site") return suggestion.site.name;
  return suggestion.item.name;
}

function SuggestionThumbnail({ suggestion }: { suggestion: SearchSuggestion }) {
  const photo = suggestion.kind === "destination"
    ? suggestion.destination.cardImage
    : suggestion.kind === "site" ? suggestion.site.photo : suggestion.item.photo;
  return (
    <span className={styles.thumbnail}>
      {photo ? <CoverPhoto src={photo} /> : suggestion.kind === "service"
        ? <PhotoPlaceholder className={styles.fill} />
        : (
          <span className={styles.iconTile}>
            {suggestion.kind === "destination"
              ? <IoLocationOutline size={26} color="var(--indigo)" aria-hidden />
              : <IoMapOutline size={26} color="var(--indigo)" aria-hidden />}
          </span>
        )}
    </span>
  );
}
