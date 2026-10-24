"use client";

import { useSyncExternalStore } from "react";

// Búsquedas recientes del visitante (src/hooks/use-recent-searches.ts), en el navegador.
const STORAGE_KEY = "pv:recent-searches";
const MAX_ENTRIES = 6;
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let entries: string[] | null = null;

function read(): string[] {
  if (entries) return entries;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    entries = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    entries = [];
  }
  return entries;
}

function save(next: string[]) {
  entries = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento: las búsquedas duran mientras la página esté abierta.
  }
  for (const listener of listeners) listener();
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const key = trimmed.toLowerCase();
  save([trimmed, ...read().filter((entry) => entry.toLowerCase() !== key)].slice(0, MAX_ENTRIES));
}

export function clearRecentSearches() {
  save([]);
}

export function useRecentSearches(): string[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => EMPTY,
  );
}
