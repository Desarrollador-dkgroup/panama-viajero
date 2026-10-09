"use client";

import { Filter, MapPin, RotateCcw, SlidersHorizontal } from "lucide-react";
import { catalogConfig, environmentOptions, provinceOptions } from "@/data/catalog";
import type { CatalogCategory } from "@/data/catalog";
import styles from "./explore-catalog.module.css";

export type CatalogFilters = {
  provinces: string[];
  types: string[];
  amenities: string[];
  environments: string[];
  minimumPrice: number;
  maximumPrice: number;
  minimumRating: number;
};

// Comparte los valores de restablecimiento de los filtros
export const defaultFilters: CatalogFilters = {
  provinces: [], types: [], amenities: [], environments: [],
  minimumPrice: 0, maximumPrice: 350, minimumRating: 0,
};

type ChoiceGroup = "provinces" | "types" | "amenities" | "environments";

// Presenta un grupo de casillas con etiquetas accesibles
function FilterChoices({ title, choices, selected, onToggle }: {
  title: string;
  choices: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className={styles.filterGroup}>
      <legend>{title}</legend>
      <div className={styles.checkboxGrid}>
        {choices.map((choice) => (
          <label key={choice}>
            <input type="checkbox" checked={selected.includes(choice)}
              onChange={() => onToggle(choice)} />
            {choice}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Adapta los filtros disponibles a la categoría seleccionada
export function CatalogFilterPanel({ category, filters, onChange, onReset }: {
  category: CatalogCategory;
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
}) {
  const config = catalogConfig[category];

  // Alterna una selección sin modificar el estado anterior
  const toggle = (group: ChoiceGroup, value: string) => {
    const selected = filters[group];
    onChange({ ...filters, [group]: selected.includes(value)
      ? selected.filter((entry) => entry !== value) : [...selected, value] });
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeading}>
        <h2><Filter size={20} />Filtros</h2>
        <button onClick={onReset}><RotateCcw size={13} />Limpiar</button>
      </div>
      <FilterChoices title="Ubicación" choices={provinceOptions}
        selected={filters.provinces} onToggle={(value) => toggle("provinces", value)} />
      <fieldset className={styles.filterGroup}>
        <legend>Precio por {config.unit}</legend>
        <label className={styles.rangeLabel}>
          Mínimo <strong>${filters.minimumPrice}</strong>
          <input type="range" min="0" max="350" step="5" value={filters.minimumPrice}
            onChange={(event) => onChange({ ...filters,
              minimumPrice: Math.min(Number(event.target.value), filters.maximumPrice) })} />
        </label>
        <label className={styles.rangeLabel}>
          Máximo <strong>${filters.maximumPrice}</strong>
          <input type="range" min="0" max="350" step="5" value={filters.maximumPrice}
            onChange={(event) => onChange({ ...filters,
              maximumPrice: Math.max(Number(event.target.value), filters.minimumPrice) })} />
        </label>
      </fieldset>
      <FilterChoices title={config.typeLabel} choices={config.types}
        selected={filters.types} onToggle={(value) => toggle("types", value)} />
      <fieldset className={styles.filterGroup}>
        <legend>Calificación</legend>
        <label className={styles.rangeLabel}>
          {filters.minimumRating === 0 ? "Todas" : `Desde ${filters.minimumRating.toFixed(1)}`}
          <input type="range" min="0" max="5" step="0.1" value={filters.minimumRating}
            onChange={(event) => onChange({ ...filters,
              minimumRating: Number(event.target.value) })} />
        </label>
      </fieldset>
      <FilterChoices title="Comodidades" choices={config.amenities}
        selected={filters.amenities} onToggle={(value) => toggle("amenities", value)} />
      <FilterChoices title="Entorno" choices={environmentOptions}
        selected={filters.environments} onToggle={(value) => toggle("environments", value)} />
      <p className={styles.filterFootnote}>
        <MapPin size={13} />Datos de ejemplo para probar filtros.
      </p>
      <span className={styles.filterHint}><SlidersHorizontal size={14} />Ajusta tu búsqueda</span>
    </div>
  );
}
