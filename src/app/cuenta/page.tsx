"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IoCalendarOutline,
  IoChevronForward,
  IoHeartOutline,
  IoPerson,
  IoPersonOutline,
  IoPricetagsOutline,
} from "react-icons/io5";
import styles from "@/components/app/account.module.css";
import { signOut } from "@/lib/auth-actions";
import { useAuthSession } from "@/lib/auth-session";

// Pestaña Cuenta (src/app/(tabs)/profile.tsx de la app).
export default function AccountPage() {
  const { status, email, profile } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Perfil</h1>
      {status === "signedIn" ? (
        <div className={styles.identityCard}>
          <span className={styles.avatar}><IoPerson size={32} color="var(--indigo)" /></span>
          <span className={styles.identityTitle}>{profile?.displayName ?? "Tu cuenta"}</span>
          {email && <span className={styles.identityEmail}>{email}</span>}
          <div className={styles.authButtons}>
            <Link href="/cuenta/cambiar-contrasena" className={styles.secondaryButton}>
              Cambiar contraseña
            </Link>
            <button type="button" className={styles.secondaryButton} disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await signOut().catch(() => undefined);
                setSigningOut(false);
              }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.identityCard}>
          <span className={styles.avatar}><IoPersonOutline size={32} color="var(--indigo)" /></span>
          <span className={styles.identityTitle}>No has iniciado sesión</span>
          <p className={styles.identityBody}>
            Inicia sesión o crea una cuenta para guardar tu información y gestionar tus reservas.
          </p>
          <div className={styles.authButtons}>
            <Link href="/cuenta/ingresar" className={styles.primaryButton}>Iniciar sesión</Link>
            <Link href="/cuenta/registro" className={styles.secondaryButton}>Crear cuenta</Link>
          </div>
        </div>
      )}

      <Link href="/mis-viajes" className={styles.row}>
        <span className={styles.rowIcon}><IoCalendarOutline size={18} color="var(--indigo)" /></span>
        <span className={styles.rowLabel}>Mis reservas</span>
        <IoChevronForward size={18} color="#C0C0C0" />
      </Link>
      <Link href="/favoritos" className={styles.row}>
        <span className={styles.rowIcon}><IoHeartOutline size={18} color="var(--coral)" /></span>
        <span className={styles.rowLabel}>Favoritos</span>
        <IoChevronForward size={18} color="#C0C0C0" />
      </Link>
      <Link href="/promociones" className={styles.row}>
        <span className={styles.rowIcon}><IoPricetagsOutline size={18} color="var(--indigo)" /></span>
        <span className={styles.rowLabel}>Promociones</span>
        <IoChevronForward size={18} color="#C0C0C0" />
      </Link>
    </div>
  );
}
