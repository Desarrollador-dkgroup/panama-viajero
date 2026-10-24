"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IoBriefcaseOutline } from "react-icons/io5";
import { useAuthSession } from "@/lib/auth-session";
import { describeBookingError, fetchReservations, type Reservation } from "@/lib/booking";
import { ReservationCard } from "./reservation-card";
import styles from "./trips.module.css";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; reservations: Reservation[] };

// Hook compartido: reservas que la base deja ver a esta sesión.
export function useReservations(enabled: boolean) {
  const [state, setState] = useState<State>({ status: "loading" });
  const load = useCallback(() => {
    fetchReservations()
      .then((reservations) => setState({ status: "ready", reservations }))
      .catch((failure: unknown) =>
        setState({ status: "error", message: describeBookingError(failure) }));
  }, []);
  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);
  const reload = useCallback(() => {
    setState({ status: "loading" });
    load();
  }, [load]);
  return { state, reload };
}

// Pestaña Mis viajes (src/app/(tabs)/reservations.tsx).
export function TripsScreen() {
  const auth = useAuthSession();
  const signedIn = auth.status === "signedIn";
  const { state, reload } = useReservations(signedIn);
  const mine = state.status === "ready"
    ? state.reservations.filter((item) => item.customer_id === auth.userId) : [];

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Mis viajes</h1>
      <h2 className={styles.subtitle}>Reservas</h2>

      {auth.status === "loading" && <p className={styles.muted}>Cargando…</p>}
      {auth.status === "signedOut" && (
        <div className={styles.emptyCard}>
          <IoBriefcaseOutline size={36} color="var(--photo-empty-icon)" aria-hidden />
          <p className={styles.emptyTitle}>Inicia sesión para ver tus reservas</p>
          <p className={styles.muted}>Tus solicitudes y reservas aparecen aquí.</p>
          <Link href="/cuenta/ingresar?next=/mis-viajes" className={styles.primaryButton}>
            Iniciar sesión
          </Link>
        </div>
      )}
      {signedIn && state.status === "loading" && (
        <p className={styles.muted}>Cargando tus reservas…</p>
      )}
      {signedIn && state.status === "error" && (
        <div className={styles.emptyCard}>
          <p className={styles.emptyTitle}>No pudimos cargar tus reservas</p>
          <p className={styles.muted}>{state.message}</p>
          <button type="button" className={styles.primaryButton} onClick={reload}>Reintentar</button>
        </div>
      )}
      {signedIn && state.status === "ready" && mine.length === 0 && (
        <p className={styles.muted}>Aún no tienes solicitudes. Reserva un servicio para verlo aquí.</p>
      )}
      <div className={styles.list}>
        {mine.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} onChanged={reload} />
        ))}
      </div>
    </div>
  );
}
