"use client";

import { useSyncExternalStore } from "react";

// Favoritos del visitante, como en la app (src/hooks/use-favorites.ts): se guardan en el
// navegador y, con sesión iniciada, también en la tabla `favorites` (ver favorites-sync).
const STORAGE_KEY = "pv:favorites";
const listeners = new Set<() => void>();
let ids: string[] | null = null;
const EMPTY: string[] = [];

function read(): string[] {
  if (ids) return ids;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    ids = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    ids = [];
  }
  return ids;
}

function write(next: string[]) {
  ids = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento (modo privado): el favorito dura mientras la página esté abierta.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFavoriteIds(): string[] {
  return read();
}

export function setFavoriteIds(next: string[]) {
  write([...new Set(next)]);
}

// Avisa a quien sincroniza con Supabase de cada cambio hecho por el visitante.
type ToggleHandler = (serviceId: string, added: boolean) => void;
let onToggle: ToggleHandler | null = null;

export function setFavoriteToggleHandler(handler: ToggleHandler | null) {
  onToggle = handler;
}

export function toggleFavorite(serviceId: string) {
  const current = read();
  const added = !current.includes(serviceId);
  write(added ? [...current, serviceId] : current.filter((id) => id !== serviceId));
  onToggle?.(serviceId, added);
}

export function useFavoriteIds(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useIsFavorite(serviceId: string): boolean {
  return useFavoriteIds().includes(serviceId);
}
