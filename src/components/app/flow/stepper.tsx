"use client";

import { IoAdd, IoPeopleOutline, IoRemove } from "react-icons/io5";
import styles from "./flow.module.css";

// Selector de cantidad (src/components/search/guests-stepper.tsx).
export function Stepper({ label, hint, value, onChange, min = 1, max = 20, icon = true }: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: boolean;
}) {
  return (
    <div className={styles.stepperRow}>
      {icon && <IoPeopleOutline size={18} color="var(--text-dark)" aria-hidden />}
      <span className={styles.stepperLabel}>
        {label}
        {hint && <span className={styles.stepperHint}>{hint}</span>}
      </span>
      <span className={styles.controls}>
        <button type="button" className={styles.stepButton} disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Menos ${label}`}>
          <IoRemove size={16} color={value <= min ? "#C0C0C0" : "var(--indigo)"} aria-hidden />
        </button>
        <span className={styles.count} aria-live="polite">{value}</span>
        <button type="button" className={styles.stepButton} disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Más ${label}`}>
          <IoAdd size={16} color={value >= max ? "#C0C0C0" : "var(--indigo)"} aria-hidden />
        </button>
      </span>
    </div>
  );
}
