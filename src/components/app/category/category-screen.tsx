"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IoFilter, IoListOutline, IoMapOutline, IoSwapVertical } from "react-icons/io5";
import { BackButton } from "@/components/app/back-button";
import { Chip, RadioRow, Sheet, sheetStyles } from "@/components/app/sheet";
import type {
  CatalogCategory,
  CatalogDestination,
  CatalogItem,
  CatalogOption,
  CatalogSite,
} from "@/lib/catalog";
import {
  ALL,
  filterItems,
  sortItems,
  SORT_OPTIONS,
  type FilterSelection,
  type SortOption,
} from "@/lib/category-filters";
import { ResultCard } from "./result-card";
import styles from "./category.module.css";

type Props = {
  categoryId: string;
  categories: CatalogCategory[];
  services: CatalogItem[];
  sites: CatalogSite[];
  destinations: CatalogDestination[];
  hospedajeTypes: CatalogOption[];
  mealPlans: CatalogOption[];
  initialRegion?: string;
  initialSite?: string;
  query: string;
};

// Resultados de una categoría (src/app/(tabs)/category/[id].tsx de la app).
export function CategoryScreen(props: Props) {
  const router = useRouter();
  const [applied, setApplied] = useState<FilterSelection>({
    categoryId: props.categoryId,
    region: props.initialRegion ?? ALL,
    touristSite: props.initialSite ?? ALL,
    hospedajeType: ALL,
    mealPlan: ALL,
  });
  const [sort, setSort] = useState<SortOption | null>(null);
  const [panel, setPanel] = useState<"filter" | "sort" | null>(null);
  const [mapVisible, setMapVisible] = useState(false);

  const category = props.categories.find((item) => item.id === applied.categoryId);
  const visibleItems = useMemo(
    () => sortItems(filterItems(props.services, applied), sort),
    [props.services, applied, sort],
  );

  if (!category) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton />
            <div className={styles.titleWrap}>
              <h1 className={styles.title}>Categoría</h1>
              <span className={styles.eyebrow}>Panamá</span>
            </div>
            <span className={styles.spacer} />
          </div>
        </div>
        <p className={styles.notFound}>No encontramos esta categoría.</p>
      </div>
    );
  }

  const destination = props.destinations.find((item) => item.provinceId === applied.region);
  const mapUrl = destination?.mapsEmbedUrl ??
    `https://maps.google.com/maps?q=${encodeURIComponent(
      applied.region === ALL ? "Panamá" : `${applied.region}, Panamá`)}&output=embed`;
  const isLodging = applied.categoryId === "hospedaje";
  const noun = visibleItems.length === 1 ? category.resultsNounSingular : category.resultsNoun;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <BackButton />
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>{category.resultsNoun}</h1>
            <span className={styles.eyebrow}>
              {applied.region === ALL ? "Todo Panamá" : applied.region}
            </span>
          </div>
          {isLodging ? (
            <button
              type="button"
              className={styles.mapButton}
              onClick={() => setMapVisible((current) => !current)}
              aria-label={mapVisible ? "Ver lista" : "Ver mapa"}
            >
              {mapVisible
                ? <IoListOutline size={16} color="var(--indigo)" aria-hidden />
                : <IoMapOutline size={16} color="var(--indigo)" aria-hidden />}
              {mapVisible ? "Lista" : "Mapa"}
            </button>
          ) : (
            <span className={styles.spacer} />
          )}
        </div>
        <div className={styles.filterSortRow}>
          <button type="button" className={styles.pill} onClick={() => setPanel("filter")}>
            <IoFilter size={16} color="var(--indigo)" aria-hidden /> Filtrar
          </button>
          <button type="button" className={styles.pill} onClick={() => setPanel("sort")}>
            <IoSwapVertical size={16} color="var(--indigo)" aria-hidden /> Ordenar
          </button>
        </div>
      </div>

      <div className={styles.countRow}>
        <span className={styles.count}>{visibleItems.length.toLocaleString("es-PA")}</span>
        <span className={styles.countLabel}> {noun}</span>
      </div>

      <div className={`${styles.content} ${mapVisible ? styles.withMap : ""}`}>
        {mapVisible && (
          <iframe
            title={`Mapa de ${applied.region === ALL ? "Panamá" : applied.region}`}
            src={mapUrl}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        <div className={styles.list}>
          {visibleItems.length === 0 && (
            <p className={styles.emptyState}>
              No hay resultados con estos filtros en esta categoría. Prueba con otros filtros.
            </p>
          )}
          {visibleItems.map((item) => (
            <ResultCard key={item.id} item={item}
              href={`/servicios/${item.slug}${props.query}`} />
          ))}
        </div>
      </div>

      {panel === "filter" && (
        <FilterPanel
          {...props}
          applied={applied}
          onClose={() => setPanel(null)}
          onApply={(selection) => {
            setApplied(selection);
            setPanel(null);
            if (selection.categoryId !== props.categoryId) {
              router.replace(`/categoria/${selection.categoryId}`, { scroll: false });
            }
          }}
        />
      )}
      {panel === "sort" && (
        <SortPanel applied={sort} onClose={() => setPanel(null)}
          onApply={(next) => {
            setSort(next);
            setPanel(null);
          }} />
      )}
    </div>
  );
}

function FilterPanel(props: Props & {
  applied: FilterSelection;
  onClose: () => void;
  onApply: (selection: FilterSelection) => void;
}) {
  const [draft, setDraft] = useState<FilterSelection>(props.applied);
  const isLodging = draft.categoryId === "hospedaje";
  const regions = [...new Set(props.destinations.map((item) => item.provinceId))];
  const sitesInScope = draft.region === ALL
    ? []
    : props.sites.filter((site) => (site.provinceId ?? site.regionId) === draft.region);
  const activeCount = 1 + (draft.region !== ALL ? 1 : 0) +
    (draft.region !== ALL && draft.touristSite !== ALL ? 1 : 0) +
    (isLodging && draft.hospedajeType !== ALL ? 1 : 0) +
    (isLodging && draft.mealPlan !== ALL ? 1 : 0);
  const resultCount = filterItems(props.services, draft).length;

  return (
    <Sheet
      title="Filtrar"
      subtitle={`${activeCount} ${activeCount === 1 ? "filtro activo" : "filtros activos"}`}
      onClose={props.onClose}
      footer={
        <>
          <button
            type="button"
            className={sheetStyles.clearButton}
            onClick={() => setDraft({ categoryId: props.applied.categoryId, region: ALL,
              touristSite: ALL, hospedajeType: ALL, mealPlan: ALL })}
          >
            Limpiar
          </button>
          <button type="button" className={sheetStyles.applyButton}
            onClick={() => props.onApply(draft)}>
            Ver {resultCount.toLocaleString("es-PA")} {resultCount === 1 ? "resultado" : "resultados"}
          </button>
        </>
      }
    >
      <h3 className={sheetStyles.sectionHeading}>Categoría</h3>
      <div className={sheetStyles.radioList}>
        {props.categories.map((category) => (
          <RadioRow key={category.id} label={category.label}
            selected={draft.categoryId === category.id}
            onSelect={() => setDraft((d) => ({ ...d, categoryId: category.id }))} />
        ))}
      </div>

      <div className={sheetStyles.divider} />
      <h3 className={sheetStyles.sectionHeading}>Destino</h3>
      <div className={sheetStyles.chipWrap}>
        {[ALL, ...regions].map((region) => (
          <Chip key={region} label={region} selected={draft.region === region}
            onSelect={() => setDraft((d) => ({ ...d, region, touristSite: ALL }))} />
        ))}
      </div>

      {draft.region !== ALL && (
        <>
          <div className={sheetStyles.divider} />
          <h3 className={sheetStyles.sectionHeading}>Sitio turístico</h3>
          {sitesInScope.length > 0 ? (
            <div className={sheetStyles.chipWrap}>
              <Chip label="Todos" selected={draft.touristSite === ALL}
                onSelect={() => setDraft((d) => ({ ...d, touristSite: ALL }))} />
              {sitesInScope.map((site) => (
                <Chip key={site.id} label={site.name} selected={draft.touristSite === site.id}
                  onSelect={() => setDraft((d) => ({ ...d, touristSite: site.id }))} />
              ))}
            </div>
          ) : (
            <p className={sheetStyles.note}>
              Aún no hay sitios turísticos registrados para {draft.region}.
            </p>
          )}
        </>
      )}

      {isLodging && (
        <>
          <div className={sheetStyles.divider} />
          <h3 className={sheetStyles.sectionHeading}>Tipo de hospedaje</h3>
          <div className={sheetStyles.chipWrap}>
            <Chip label="Todos" selected={draft.hospedajeType === ALL}
              onSelect={() => setDraft((d) => ({ ...d, hospedajeType: ALL }))} />
            {props.hospedajeTypes.map((type) => (
              <Chip key={type.id} label={type.label} selected={draft.hospedajeType === type.id}
                onSelect={() => setDraft((d) => ({ ...d, hospedajeType: type.id }))} />
            ))}
          </div>

          <div className={sheetStyles.divider} />
          <h3 className={sheetStyles.sectionHeading}>Comida</h3>
          <div className={sheetStyles.chipWrap}>
            <Chip label="Todas" selected={draft.mealPlan === ALL}
              onSelect={() => setDraft((d) => ({ ...d, mealPlan: ALL }))} />
            {props.mealPlans.map((plan) => (
              <Chip key={plan.id} label={plan.label} selected={draft.mealPlan === plan.id}
                onSelect={() => setDraft((d) => ({ ...d, mealPlan: plan.id }))} />
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

function SortPanel({ applied, onClose, onApply }: {
  applied: SortOption | null;
  onClose: () => void;
  onApply: (sort: SortOption | null) => void;
}) {
  const [draft, setDraft] = useState<SortOption | null>(applied);
  return (
    <Sheet
      title="Ordenar"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={sheetStyles.clearButton} onClick={() => setDraft(null)}>
            Restablecer
          </button>
          <button type="button" className={sheetStyles.applyButton} onClick={() => onApply(draft)}>
            Aplicar
          </button>
        </>
      }
    >
      <div className={sheetStyles.radioList}>
        {SORT_OPTIONS.map((option) => (
          <RadioRow key={option.id} label={option.label} selected={draft === option.id}
            onSelect={() => setDraft(option.id)} />
        ))}
      </div>
    </Sheet>
  );
}
