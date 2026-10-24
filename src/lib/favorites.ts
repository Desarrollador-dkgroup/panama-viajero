"use client";

import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Favoritos como en la app (src/hooks/use-favorites.ts): sin sesión se guardan en el
// navegador; al iniciar sesión se unen a la cuenta (`merge_favorites`) y desde entonces se
// leen y escriben en la tabla `favorites`. Los identificadores son `services.id`.
const STORAGE_KEY = "pv:favorites";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let localIds: string[] | null = null;
let remoteIds: string[] | null = null;
let userId: string | null = null;
let started = false;

function notify() {
  for (const listener of listeners) listener();
}

function readLocal(): string[] {
  if (localIds) return localIds;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    localIds = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    localIds = [];
  }
  return localIds;
}

function writeLocal(next: string[]) {
  localIds = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento (modo privado): el favorito dura mientras la página esté abierta.
  }
}

async function handleSignedIn(uid: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || userId === uid) return;
  userId = uid;
  remoteIds = null;
  notify();
  const pending = readLocal();
  if (pending.length > 0) {
    const { error } = await supabase.rpc("merge_favorites", { p_service_ids: pending });
    if (!error) writeLocal([]);
  }
  const { data } = await supabase.from("favorites").select("service_id").eq("customer_id", uid);
  if (userId !== uid) return;
  remoteIds = (data ?? []).map((row) => String(row.service_id));
  notify();
}

function start() {
  if (started) return;
  started = true;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) void handleSignedIn(data.session.user.id);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      void handleSignedIn(session.user.id);
    } else {
      userId = null;
      remoteIds = null;
      notify();
    }
  });
}

function currentIds(): string[] {
  return userId ? remoteIds ?? EMPTY : readLocal();
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleFavorite(serviceId: string) {
  const supabase = getSupabaseBrowserClient();
  if (userId && supabase) {
    const uid = userId;
    const had = (remoteIds ?? []).includes(serviceId);
    const rollback = remoteIds ?? [];
    remoteIds = had ? rollback.filter((id) => id !== serviceId) : [...rollback, serviceId];
    notify();
    const write = had
      ? supabase.from("favorites").delete().eq("customer_id", uid).eq("service_id", serviceId)
      : supabase.from("favorites").insert({ customer_id: uid, service_id: serviceId });
    void write.then(({ error }) => {
      if (!error || userId !== uid) return;
      remoteIds = rollback;
      notify();
    });
    return;
  }
  const current = readLocal();
  writeLocal(current.includes(serviceId)
    ? current.filter((id) => id !== serviceId) : [...current, serviceId]);
  notify();
}

export function useFavoriteIds(): string[] {
  return useSyncExternalStore(subscribe, currentIds, () => EMPTY);
}

export function useIsFavorite(serviceId: string): boolean {
  return useFavoriteIds().includes(serviceId);
}

// Falso mientras se cargan los favoritos de la cuenta, para no mostrar "vacío" antes de tiempo.
export function useFavoritesHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => (userId ? remoteIds !== null : true), () => false);
}
