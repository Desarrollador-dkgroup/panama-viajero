"use client";

import Link from "next/link";
import { useState } from "react";
import {
  cancelReservation,
  describeBookingError,
  formatDateLong,
  formatMoney,
  type Reservation,
} from "@/lib/booking";
import { formatSlot } from "@/lib/reservation-config";
import styles from "./trips.module.css";

export const CATEGORY_LABEL: Record<string, string> = {
  hospedaje: "Hospedaje",
  restaurantes: "Restaurantes",
  actividades: "Actividades",
  transporte: "Transporte",
  "tour-operador": "Tour-operador",
  otras: "Otras",
};

export const STATUS_LABEL: Record<Reservation["status"], string> = {
  pending: "Pendiente de aceptación",
  accepted: "Aceptada",
  declined: "Rechazada",
  cancelled: "Cancelada",
};

export const PAYMENT_LABEL: Record<Reservation["reservation_payment_state"], string> = {
  unpaid: "Sin pago verificado",
  verified: "Pago verificado",
  failed: "Pago fallido",
  refunded: "Reembolsado",
};

export function reservationDateLine(reservation: Reservation): string {
  if (reservation.check_in && reservation.check_out) {
    return `${formatDateLong(reservation.check_in)} → ${formatDateLong(reservation.check_out)}`;
  }
  if (reservation.reservation_date) {
    return `${formatDateLong(reservation.reservation_date)}${reservation.reservation_time
      ? ` · ${formatSlot(reservation.reservation_time.slice(0, 5))}` : ""}`;
  }
  return "";
}

// Tarjeta de reserva (src/components/reservations/remote-reservation-card.tsx).
export function ReservationCard({ reservation, onChanged, business = false }: {
  reservation: Reservation;
  onChanged: () => void;
  business?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = reservation.services;
  const rooms = reservation.reservation_room_lines
    .map((line) => `${line.quantity} × ${line.room_types?.name ?? "Habitación"}`).join(" + ");
  const detailHref = business ? `/negocio/reservas/${reservation.id}`
    : `/mis-viajes/${reservation.id}`;

  return (
    <article className={styles.card}>
      <Link href={detailHref} className={styles.cardMain}>
        <span className={styles.cardTop}>
          <span className={styles.category}>
            {service ? CATEGORY_LABEL[service.category_id] ?? "Servicio" : "Servicio"}
          </span>
          {reservation.is_test && <span className={styles.testTag}>PRUEBA</span>}
          <span className={`${styles.status} ${styles[`status_${reservation.status}`]}`}>
            {STATUS_LABEL[reservation.status]}
          </span>
        </span>
        <span className={styles.serviceName}>{service?.name ?? "Servicio"}</span>
        {service?.destination_province_id && (
          <span className={styles.meta}>{service.destination_province_id}</span>
        )}
        <span className={styles.meta}>
          {reservationDateLine(reservation)} · {reservation.guests}{" "}
          {reservation.guests === 1 ? "persona" : "personas"}
        </span>
        {rooms && <span className={styles.meta}>{rooms}</span>}
        {reservation.quoted_total_cents !== null && (
          <span className={styles.total}>{formatMoney(reservation.quoted_total_cents)}</span>
        )}
        {reservation.decline_reason && (
          <span className={styles.meta}>Motivo: {reservation.decline_reason}</span>
        )}
        <span className={styles.reference}>Solicitud #{reservation.id.slice(0, 8)}</span>
      </Link>
      <div className={styles.cardActions}>
        {service && !business && (
          <Link href={`/servicios/${service.slug}`} className={styles.actionLink}>Ver servicio</Link>
        )}
        {!business && reservation.status === "pending" && (
          <button type="button" className={styles.cancelButton} disabled={busy}
            onClick={() => setConfirming(true)} aria-label="Cancelar solicitud">
            Cancelar
          </button>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {confirming && (
        <div className={styles.dialogBackdrop} role="alertdialog" aria-modal="true"
          aria-label="Cancelar solicitud">
          <div className={styles.dialog}>
            <h3 className={styles.dialogTitle}>Cancelar solicitud</h3>
            <p className={styles.dialogBody}>
              ¿Seguro que quieres cancelar esta solicitud? Esta acción no se puede deshacer.
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.dialogSecondary}
                onClick={() => setConfirming(false)}>No</button>
              <button type="button" className={styles.dialogDanger} disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    await cancelReservation(reservation.id);
                    onChanged();
                  } catch (failure) {
                    setError(describeBookingError(failure));
                  } finally {
                    setBusy(false);
                    setConfirming(false);
                  }
                }}>
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
