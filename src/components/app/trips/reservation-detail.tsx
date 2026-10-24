"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/app/back-button";
import { useAuthSession } from "@/lib/auth-session";
import {
  acceptReservation,
  declineReservation,
  describeBookingError,
  fetchReservation,
  formatMoney,
  getOrIssueCheckinPin,
  markNoShow,
  validateCheckinPin,
  type CheckinPin,
  type Reservation,
} from "@/lib/booking";
import { PAYMENT_LABEL, reservationDateLine, STATUS_LABEL } from "./reservation-card";
import styles from "./trips.module.css";

const VISIT_LABEL: Record<Reservation["visit_status"], string> = {
  pending_arrival: "Llegada pendiente",
  validated: "Llegada validada",
  no_show: "No se presentó",
  cancelled: "Cancelada",
};

// Detalle de una reserva: la del viajero (src/app/reservation/[id].tsx, con PIN de llegada)
// o la del negocio (src/app/business/reservation/[id].tsx: aceptar, rechazar, validar PIN).
export function ReservationDetail({ id, business = false }: { id: string; business?: boolean }) {
  const auth = useAuthSession();
  const [reservation, setReservation] = useState<Reservation | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<CheckinPin | null>(null);
  const [pinNote, setPinNote] = useState<string | null>(null);
  const [typedPin, setTypedPin] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchReservation(id)
      .then(setReservation)
      .catch((failure: unknown) => setError(describeBookingError(failure)));
  }, [id]);

  useEffect(() => {
    if (auth.status === "signedIn") load();
  }, [auth.status, load]);

  useEffect(() => {
    if (business || reservation?.status !== "accepted" || reservation.kind !== "stay") return;
    getOrIssueCheckinPin(reservation.id)
      .then(setPin)
      .catch((failure: unknown) => setPinNote(describeBookingError(failure)));
  }, [business, reservation]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      load();
    } catch (failure) {
      setError(describeBookingError(failure));
    } finally {
      setBusy(false);
    }
  }

  const back = business ? "/negocio/reservas" : "/mis-viajes";
  const service = reservation?.services;

  return (
    <div className={styles.screen}>
      <div className={styles.detailHeader}>
        <BackButton fallback={back} />
        <div>
          <span className={styles.eyebrow}>Solicitud</span>
          <h1 className={styles.detailTitle}>{service?.name ?? "Solicitud"}</h1>
        </div>
      </div>

      {auth.status === "signedOut" && (
        <Link href={`/cuenta/ingresar?next=${back}`} className={styles.primaryButton}>
          Iniciar sesión
        </Link>
      )}
      {reservation === null && (
        <p className={styles.muted}>No encontramos esta solicitud, o ya no tienes acceso a ella.</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {reservation && (
        <>
          <div className={styles.detailCard}>
            <span className={`${styles.status} ${styles[`status_${reservation.status}`]}`}>
              {STATUS_LABEL[reservation.status]}
            </span>
            {reservation.is_test && <span className={styles.testTag}>PRUEBA</span>}
            <dl className={styles.facts}>
              <dt>Fechas</dt><dd>{reservationDateLine(reservation)}</dd>
              <dt>Personas</dt>
              <dd>
                {reservation.guests}
                {reservation.adults != null && ` (${reservation.adults} adultos, ${
                  reservation.children ?? 0} niños)`}
              </dd>
              {reservation.reservation_room_lines.length > 0 && (
                <>
                  <dt>Habitaciones</dt>
                  <dd>{reservation.reservation_room_lines.map((line) =>
                    `${line.quantity} × ${line.room_types?.name ?? "Habitación"}`).join(" + ")}</dd>
                </>
              )}
              {reservation.quoted_total_cents !== null && (
                <><dt>Total</dt><dd>{formatMoney(reservation.quoted_total_cents)}</dd></>
              )}
              <dt>Pago</dt><dd>{PAYMENT_LABEL[reservation.reservation_payment_state]}</dd>
              <dt>Llegada</dt><dd>{VISIT_LABEL[reservation.visit_status]}</dd>
              {reservation.decline_reason && (
                <><dt>Motivo</dt><dd>{reservation.decline_reason}</dd></>
              )}
            </dl>
            {(reservation.guest_name || reservation.guest_phone || reservation.guest_email) && (
              <>
                <h2 className={styles.subtitle}>Datos del huésped</h2>
                <p className={styles.muted}>
                  {[reservation.guest_name, reservation.guest_phone, reservation.guest_email]
                    .filter(Boolean).join(" · ")}
                </p>
              </>
            )}
            <span className={styles.reference}>Solicitud #{reservation.id.slice(0, 8)}</span>
          </div>

          {!business && pin && (
            <div className={styles.pinCard}>
              <h2 className={styles.subtitle}>PIN de llegada</h2>
              <p className={styles.muted}>Muéstralo en recepción al llegar.</p>
              <span className={styles.pinCode}>{pin.pinCode}</span>
            </div>
          )}
          {!business && pinNote && <p className={styles.muted}>{pinNote}</p>}
          {!business && service && (
            <Link href={`/servicios/${service.slug}`} className={styles.secondaryButton}>
              Volver a la ficha del servicio
            </Link>
          )}

          {business && reservation.status === "pending" && (
            <div className={styles.detailCard}>
              <button type="button" className={styles.primaryButton} disabled={busy}
                onClick={() => run(() => acceptReservation(reservation.id))}>
                Aceptar solicitud
              </button>
              <label className={styles.field}>
                Motivo del rechazo (opcional)
                <input value={reason} onChange={(event) => setReason(event.target.value)} />
              </label>
              <button type="button" className={styles.dangerButton} disabled={busy}
                onClick={() => run(() => declineReservation(reservation.id, reason))}>
                Rechazar
              </button>
            </div>
          )}
          {business && reservation.status === "accepted"
            && reservation.visit_status === "pending_arrival" && (
            <div className={styles.detailCard}>
              <h2 className={styles.subtitle}>Validar llegada</h2>
              <label className={styles.field}>
                PIN del huésped
                <input value={typedPin} inputMode="numeric" maxLength={8}
                  onChange={(event) => setTypedPin(event.target.value.replace(/\D/g, ""))} />
              </label>
              <button type="button" className={styles.primaryButton} disabled={busy || !typedPin}
                onClick={() => run(async () => {
                  const result = await validateCheckinPin(reservation.id, typedPin);
                  if (result.result === "incorrect") {
                    throw new Error("PIN incorrecto. Intenta de nuevo.");
                  }
                })}>
                Validar PIN
              </button>
              <button type="button" className={styles.secondaryButton} disabled={busy}
                onClick={() => run(() => markNoShow(reservation.id))}>
                Marcar como no presentado
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
