"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/app/back-button";
import { useAuthSession } from "@/lib/auth-session";
import { fetchBusinessMemberships, type BusinessMembership } from "@/lib/booking";
import { ReservationCard } from "./reservation-card";
import { useReservations } from "./trips-screen";
import styles from "./trips.module.css";

// Panel del hotel (src/app/business/reservations.tsx): reservas de los servicios del negocio.
export function BusinessScreen() {
  const auth = useAuthSession();
  const signedIn = auth.status === "signedIn";
  const [memberships, setMemberships] = useState<BusinessMembership[] | null>(null);
  const { state, reload } = useReservations(signedIn);

  useEffect(() => {
    if (!signedIn) return;
    fetchBusinessMemberships().then(setMemberships).catch(() => setMemberships([]));
  }, [signedIn]);

  const theirs = state.status === "ready"
    ? state.reservations.filter((item) => item.customer_id !== auth.userId) : [];
  const pending = theirs.filter((item) => item.status === "pending");
  const others = theirs.filter((item) => item.status !== "pending");

  return (
    <div className={styles.screen}>
      <div className={styles.detailHeader}>
        <BackButton fallback="/cuenta" />
        <div>
          <span className={styles.eyebrow}>Panel del hotel</span>
          <h1 className={styles.detailTitle}>
            {memberships?.map((item) => item.businessName).join(", ") || "Reservas"}
          </h1>
        </div>
      </div>
      {auth.status === "signedOut" && (
        <Link href="/cuenta/ingresar?next=/negocio/reservas" className={styles.primaryButton}>
          Iniciar sesión
        </Link>
      )}
      {memberships && memberships.length === 0 && (
        <p className={styles.muted}>Tu cuenta no pertenece a ningún negocio.</p>
      )}
      {state.status === "error" && <p className={styles.error}>{state.message}</p>}
      {state.status === "ready" && theirs.length === 0 && memberships?.length !== 0 && (
        <p className={styles.muted}>Todavía no hay solicitudes para tus servicios.</p>
      )}
      {pending.length > 0 && <h2 className={styles.subtitle}>Pendientes</h2>}
      <div className={styles.list}>
        {pending.map((item) => (
          <ReservationCard key={item.id} reservation={item} onChanged={reload} business />
        ))}
      </div>
      {others.length > 0 && <h2 className={styles.subtitle}>Historial</h2>}
      <div className={styles.list}>
        {others.map((item) => (
          <ReservationCard key={item.id} reservation={item} onChanged={reload} business />
        ))}
      </div>
    </div>
  );
}
