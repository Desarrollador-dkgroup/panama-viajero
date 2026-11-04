"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IoBusinessOutline,
  IoBulbOutline,
  IoCalendarOutline,
  IoTrashOutline,
  IoChevronForward,
  IoHeartOutline,
  IoPersonCircleOutline,
  IoPersonOutline,
  IoPricetagsOutline,
} from "react-icons/io5";
import styles from "@/components/app/account.module.css";
import { deleteOwnAccount, signOut } from "@/lib/auth-actions";
import { fetchBusinessMemberships, type BusinessMembership } from "@/lib/booking";
import { useAuthSession } from "@/lib/auth-session";
import { InlineDialog } from "@/components/app/inline-dialog";
import { AvatarPicker } from "@/components/app/account/avatar-picker";

// Pestaña Cuenta (src/app/(tabs)/profile.tsx de la app).
export default function AccountPage() {
  const { status, email, profile } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [fetched, setFetched] = useState<BusinessMembership[]>([]);
  const memberships = status === "signedIn" ? fetched : [];

  useEffect(() => {
    if (status !== "signedIn") return;
    fetchBusinessMemberships().then(setFetched).catch(() => setFetched([]));
  }, [status]);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Perfil</h1>
      {status === "signedIn" ? (
        <div className={styles.identityCard}>
          <AvatarPicker avatarPath={profile?.avatarStoragePath ?? null} />
          <span className={styles.identityTitle}>
            {[profile?.displayName, profile?.lastName].filter(Boolean).join(" ") || "Tu cuenta"}
          </span>
          {email && <span className={styles.identityEmail}>{email}</span>}
          <div className={styles.authButtons}>
            <Link href="/cuenta/cambiar-contrasena" className={styles.secondaryButton}>
              Cambiar contraseña
            </Link>
            <button type="button" className={styles.secondaryButton} disabled={signingOut}
              onClick={() => setConfirmingSignOut(true)}>
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

      {status === "signedIn" && (
        <Link href="/cuenta/perfil" className={styles.row}>
          <span className={styles.rowIcon}><IoPersonCircleOutline size={18} color="var(--indigo)" /></span>
          <span className={styles.rowLabel}>Información personal</span>
          <IoChevronForward size={18} color="#C0C0C0" />
        </Link>
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
      {memberships.length > 0 && (
        <Link href="/negocio/reservas" className={styles.row}>
          <span className={styles.rowIcon}><IoBusinessOutline size={18} color="var(--indigo)" /></span>
          <span className={styles.rowLabel}>
            Panel del hotel
            <span className={styles.rowSub}>{memberships.map((m) => m.businessName).join(", ")}</span>
          </span>
          <IoChevronForward size={18} color="#C0C0C0" />
        </Link>
      )}
      <Link href="/cuenta/sugerencias" className={styles.row}>
        <span className={styles.rowIcon}><IoBulbOutline size={18} color="var(--indigo)" /></span>
        <span className={styles.rowLabel}>Sugerencias</span>
        <IoChevronForward size={18} color="#C0C0C0" />
      </Link>
      <Link href="/promociones" className={styles.row}>
        <span className={styles.rowIcon}><IoPricetagsOutline size={18} color="var(--indigo)" /></span>
        <span className={styles.rowLabel}>Promociones</span>
        <IoChevronForward size={18} color="#C0C0C0" />
      </Link>

      {status === "signedIn" && (
        <button type="button" className={styles.dangerRow} disabled={deleting}
          onClick={() => setConfirmingDelete(true)}>
          <IoTrashOutline size={16} color="#C0392B" aria-hidden /> Eliminar cuenta
        </button>
      )}
      {confirmingSignOut && (
        <InlineDialog
          title="Cerrar sesión"
          message="¿Seguro que quieres cerrar tu sesión?"
          confirmLabel="Sí"
          cancelLabel="No"
          busy={signingOut}
          onCancel={() => setConfirmingSignOut(false)}
          onConfirm={async () => {
            setSigningOut(true);
            await signOut().catch(() => undefined);
            setSigningOut(false);
            setConfirmingSignOut(false);
          }}
        />
      )}
      {confirmingDelete && (
        <InlineDialog
          title="Eliminar cuenta"
          message="Esta acción es permanente. Si tienes reservas o reseñas, tu perfil se anonimiza; si no tienes ninguna, tu cuenta se borra por completo."
          confirmLabel="Eliminar mi cuenta"
          cancelLabel="Cancelar"
          danger
          requireText={email ?? undefined}
          busy={deleting}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteOwnAccount();
              await signOut();
              setConfirmingDelete(false);
            } catch {
              setConfirmingDelete(false);
              setNotice("No se pudo eliminar la cuenta. Intenta de nuevo más tarde.");
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}
      {notice && (
        <InlineDialog
          title="Aviso"
          message={notice}
          confirmLabel="Entendido"
          onConfirm={() => setNotice(null)}
          onCancel={() => setNotice(null)}
        />
      )}
    </div>
  );
}
