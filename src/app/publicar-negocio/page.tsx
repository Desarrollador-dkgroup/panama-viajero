"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/app/account.module.css";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Formulario para propietarios que quieren que su negocio aparezca en la app.
const EMPTY = {
  businessName: "",
  legalName: "",
  ruc: "",
  contactPerson: "",
  phone: "",
  email: "",
};

export default function PublishBusinessPage() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function update(field: keyof typeof EMPTY) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setResult({ ok: false, text: "No pudimos enviar tu solicitud. Intenta más tarde." });
      return;
    }
    setSending(true);
    setResult(null);
    const { error } = await supabase.from("business_leads").insert({
      business_name: form.businessName.trim(),
      legal_name: form.legalName.trim(),
      ruc: form.ruc.trim(),
      contact_person: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
    setSending(false);
    if (error) {
      // 23514: un dato no cumple el largo o el formato que pide la base.
      const text = error.code === "23514"
        ? "Revisa los datos: el teléfono debe tener al menos 7 dígitos y el RUC al menos 5 caracteres."
        : "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.";
      setResult({ ok: false, text });
      return;
    }
    setForm(EMPTY);
    setResult({ ok: true, text: "¡Gracias! Recibimos los datos de tu negocio. Te contactaremos pronto." });
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Quiero publicar mi negocio</h1>
      <p>
        Déjanos los datos de tu empresa y te contactamos para que tus servicios aparezcan en
        Panamá Viajero.
      </p>
      <form className={styles.identityCard} onSubmit={submit}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Nombre comercial</span>
          <input className={styles.input} required minLength={2} maxLength={120} value={form.businessName}
            onChange={update("businessName")} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Razón social</span>
          <input className={styles.input} required minLength={2} maxLength={160} value={form.legalName}
            onChange={update("legalName")} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Número de RUC</span>
          <input className={styles.input} required minLength={5} maxLength={40} value={form.ruc}
            onChange={update("ruc")} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Persona de contacto</span>
          <input className={styles.input} required minLength={2} maxLength={120} value={form.contactPerson}
            onChange={update("contactPerson")} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Teléfono</span>
          <input className={styles.input} type="tel" required minLength={7} maxLength={30} value={form.phone}
            onChange={update("phone")} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Correo</span>
          <input className={styles.input} type="email" required maxLength={160} value={form.email}
            onChange={update("email")} />
        </label>
        {result && (
          <p className={result.ok ? styles.okText : styles.errorText} role="status">{result.text}</p>
        )}
        <button type="submit" className={styles.primaryButton} disabled={sending}>
          {sending ? "Enviando..." : "Enviar datos"}
        </button>
      </form>
      <Link href="/" className={styles.secondaryButton}>Volver al inicio</Link>
    </div>
  );
}
