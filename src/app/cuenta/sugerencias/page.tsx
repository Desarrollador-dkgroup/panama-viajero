"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/app/account.module.css";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuthSession } from "@/lib/auth-session";

// Sugerencias para el equipo: anónimas o con el nombre de la cuenta.
export default function SuggestionsPage() {
  const { status, userId, profile } = useAuthSession();
  const [message, setMessage] = useState("");
  const [asAnonymous, setAsAnonymous] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const signedIn = status === "signedIn" && Boolean(userId);
  const anonymousOnly = !signedIn;
  const anonymous = anonymousOnly || asAnonymous;

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Sugerencias</h1>
      <p>Cuéntanos qué mejorarías o qué te gustaría encontrar en Panamá Viajero.</p>
      <form className={styles.identityCard} onSubmit={async (event) => {
        event.preventDefault();
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setResult({ ok: false, text: "No pudimos enviar tu sugerencia. Intenta más tarde." });
          return;
        }
        setSending(true);
        setResult(null);
        const { error } = await supabase.from("suggestions").insert(
          anonymous
            ? { message: message.trim(), is_anonymous: true }
            : {
              message: message.trim(),
              is_anonymous: false,
              author_id: userId,
              author_name: profile?.displayName || "Cliente",
            },
        );
        setSending(false);
        if (error) {
          setResult({ ok: false, text: "No pudimos enviar tu sugerencia. Intenta más tarde." });
          return;
        }
        setMessage("");
        setResult({ ok: true, text: "¡Gracias! Recibimos tu sugerencia." });
      }}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tu sugerencia (entre 10 y 1000 caracteres)</span>
          <textarea className={styles.input} rows={5} minLength={10} maxLength={1000} required
            value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <fieldset className={styles.field}>
          <legend className={styles.fieldLabel}>¿Cómo la enviamos?</legend>
          <label>
            <input type="radio" name="identity" checked={anonymous}
              disabled={anonymousOnly} onChange={() => setAsAnonymous(true)} /> Anónima
          </label>
          <label>
            <input type="radio" name="identity" checked={!anonymous}
              disabled={anonymousOnly} onChange={() => setAsAnonymous(false)} /> Con mi nombre
          </label>
          {anonymousOnly && (
            <small className={styles.fieldLabel}>
              Sin cuenta solo puedes enviarla de forma anónima.
            </small>
          )}
        </fieldset>
        {result && (
          <p className={result.ok ? styles.okText : styles.errorText} role="status">{result.text}</p>
        )}
        <button type="submit" className={styles.primaryButton}
          disabled={sending || message.trim().length < 10}>
          {sending ? "Enviando..." : "Enviar sugerencia"}
        </button>
      </form>
      <Link href="/cuenta" className={styles.secondaryButton}>Volver a mi cuenta</Link>
    </div>
  );
}
