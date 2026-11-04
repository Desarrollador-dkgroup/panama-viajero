"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarPicker } from "@/components/app/account/avatar-picker";
import styles from "@/components/app/account.module.css";
import { refreshAuthSession, useAuthSession } from "@/lib/auth-session";
import { loadOwnProfile, saveOwnProfile, type OwnProfile } from "@/lib/profile";

// Información personal de la cuenta: foto, nombre, teléfono y correo.
export default function PersonalInfoPage() {
  const { status } = useAuthSession();
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== "signedIn") return;
    loadOwnProfile()
      .then((loaded) => {
        setProfile(loaded);
        setDisplayName(loaded.displayName);
        setPhone(loaded.phone);
        setEmail(loaded.email ?? "");
        setLastName(loaded.lastName);
      })
      .catch((failure: unknown) =>
        setMessage({ ok: false, text: failure instanceof Error ? failure.message : "Intenta de nuevo." }));
  }, [status]);

  if (status === "signedOut") {
    return (
      <div className={styles.screen}>
        <h1 className={styles.title}>Información personal</h1>
        <p>Inicia sesión para ver tu información.</p>
        <Link href="/cuenta/ingresar?next=%2Fcuenta%2Fperfil" className={styles.primaryButton}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Información personal</h1>
      <div className={styles.identityCard}>
        <AvatarPicker avatarPath={profile?.avatarPath ?? null} editable />
      </div>
      <form className={styles.identityCard} onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
          const result = await saveOwnProfile({ displayName, lastName, phone, email });
          await refreshAuthSession();
          setMessage({
            ok: true,
            text: result.emailPending
              ? "Tus datos se guardaron. Revisa tu nuevo correo para confirmar el cambio."
              : "Tus datos se guardaron.",
          });
        } catch (failure) {
          setMessage({ ok: false, text: failure instanceof Error ? failure.message : "Intenta de nuevo." });
        } finally {
          setSaving(false);
        }
      }}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Nombre</span>
          <input className={styles.input} value={displayName} maxLength={80} required
            onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Apellido</span>
          <input className={styles.input} value={lastName} maxLength={80}
            onChange={(event) => setLastName(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Teléfono</span>
          <input className={styles.input} value={phone} maxLength={20} inputMode="tel"
            placeholder="+507 6000-0000" onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Correo</span>
          <input className={styles.input} type="email" value={email} maxLength={120}
            onChange={(event) => setEmail(event.target.value)} />
        </label>
        {message && (
          <p className={message.ok ? styles.okText : styles.errorText} role="status">{message.text}</p>
        )}
        <button type="submit" className={styles.primaryButton} disabled={saving || !profile}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
      <Link href="/cuenta" className={styles.secondaryButton}>Volver a mi cuenta</Link>
    </div>
  );
}
