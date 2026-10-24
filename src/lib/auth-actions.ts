"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Acciones de cuenta (src/utils/auth-actions.ts de la app). Los enlaces del correo vuelven a
// /cuenta/confirmar, que canjea el código y sigue a `next`.

const NOT_CONFIGURED = "El sitio no tiene configurada la conexión con Supabase.";

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

function callbackUrl(next: string) {
  return `${window.location.origin}/cuenta/confirmar?next=${encodeURIComponent(next)}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 6;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  return client().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName }, emailRedirectTo: callbackUrl("/cuenta") },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return client().auth.signInWithPassword({ email: email.trim(), password });
}

export async function signOut() {
  return client().auth.signOut();
}

export async function sendPasswordResetEmail(email: string) {
  return client().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: callbackUrl("/cuenta/nueva-contrasena"),
  });
}

export async function updatePassword(newPassword: string) {
  return client().auth.updateUser({ password: newPassword });
}

export async function resendSignUpConfirmation(email: string) {
  return client().auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: callbackUrl("/cuenta") },
  });
}

export async function exchangeCode(code: string) {
  return client().auth.exchangeCodeForSession(code);
}

// Borra la cuenta con la función `delete-account` de Supabase, igual que la app.
export async function deleteOwnAccount(): Promise<"deleted" | "anonymized"> {
  const { data, error } = await client().functions.invoke<{
    status: "deleted" | "anonymized";
    error?: string;
  }>("delete-account", { method: "POST" });
  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error ?? "delete_account_failed");
  return data.status;
}
