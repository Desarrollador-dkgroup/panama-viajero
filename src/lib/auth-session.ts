"use client";

import { useSyncExternalStore } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Sesión del visitante, igual que la app (src/hooks/use-auth-session.ts): nombre real de
// `profiles.display_name`, nunca uno inventado.

export type AuthProfile = { displayName: string; avatarStoragePath: string | null };

export type AuthState = {
  status: "loading" | "signedIn" | "signedOut";
  userId: string | null;
  email: string | null;
  profile: AuthProfile | null;
};

const SERVER_STATE: AuthState = { status: "loading", userId: null, email: null, profile: null };
let state: AuthState = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_storage_path")
    .eq("id", userId)
    .maybeSingle();
  return data
    ? { displayName: data.display_name, avatarStoragePath: data.avatar_storage_path }
    : null;
}

async function setFromSession(userId: string | null, email: string | null) {
  if (!userId) {
    state = { status: "signedOut", userId: null, email: null, profile: null };
    notify();
    return;
  }
  state = {
    status: "signedIn",
    userId,
    email,
    profile: state.userId === userId ? state.profile : null,
  };
  notify();
  const profile = await fetchProfile(userId);
  state = { status: "signedIn", userId, email, profile };
  notify();
}

function start() {
  if (started) return;
  started = true;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    state = { status: "signedOut", userId: null, email: null, profile: null };
    return;
  }
  supabase.auth.getSession().then(({ data }) => {
    void setFromSession(data.session?.user.id ?? null, data.session?.user.email ?? null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    void setFromSession(session?.user.id ?? null, session?.user.email ?? null);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthSession(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

export function getAuthSession(): AuthState {
  start();
  return state;
}

export async function refreshProfile() {
  if (!state.userId) return;
  const profile = await fetchProfile(state.userId);
  state = { ...state, profile };
  notify();
}
