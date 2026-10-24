"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoCalendarOutline, IoCheckmark } from "react-icons/io5";
import { BackButton } from "@/components/app/back-button";
import { useAuthSession } from "@/lib/auth-session";
import {
  createRequestReservation,
  describeBookingError,
  formatDateLong,
  formatMoney,
  newIdempotencyKey,
  toISODate,
  type ServerReservation,
} from "@/lib/booking";
import { formatGuests, formatSlot, type ReservationConfig } from "@/lib/reservation-config";
import { Stepper } from "./stepper";
import styles from "./flow.module.css";

// Solicitud de reserva de mesa, tour, actividad o transporte (src/app/reserve/[id].tsx).
export function RequestScreen({ serviceId, serviceName, serviceSlug, price, config, initialDate,
  initialGuests }: {
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  price: number;
  config: ReservationConfig;
  initialDate: string | null;
  initialGuests: number | null;
}) {
  const router = useRouter();
  const auth = useAuthSession();
  const today = toISODate(new Date());
  const [date, setDate] = useState(initialDate && initialDate >= today ? initialDate : "");
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(initialGuests ?? 2);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ServerReservation | null>(null);

  const slots = config.slots;
  const canSubmit = Boolean(date) && (slots === null || time !== null);
  const total = config.pricePerPerson ? price * guests : null;

  async function submit() {
    if (!canSubmit || submitting) return;
    if (auth.status !== "signedIn") {
      router.push(`/cuenta/ingresar?next=${encodeURIComponent(window.location.pathname
        + window.location.search)}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      setDone(await createRequestReservation({ serviceId, date, time, guests, idempotencyKey }));
    } catch (failure) {
      setError(describeBookingError(failure));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <BackButton fallback={`/servicios/${serviceSlug}`} />
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>{done ? "Solicitud enviada" : config.title}</span>
          <h1 className={styles.headerTitle}>{serviceName}</h1>
        </div>
      </div>

      {!done ? (
        <>
          <div className={styles.content}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>{config.dateLabel}</h2>
              <label className={styles.dateField}>
                <IoCalendarOutline size={20} color="var(--indigo)" aria-hidden />
                <input type="date" className={styles.dateInput} min={today} value={date}
                  onChange={(event) => setDate(event.target.value)}
                  aria-label={`Elegir ${config.dateLabel.toLowerCase()}`} />
              </label>
            </div>

            {slots && (
              <div className={styles.block}>
                <h2 className={styles.blockTitle}>Hora</h2>
                {config.slotsHint && <p className={styles.blockHint}>{config.slotsHint}</p>}
                <div className={styles.slots}>
                  {slots.map((slot) => (
                    <button key={slot} type="button" aria-pressed={slot === time}
                      className={`${styles.slot} ${slot === time ? styles.slotSelected : ""}`}
                      onClick={() => setTime(slot)}>
                      {formatSlot(slot)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!slots && config.slotsHint && <p className={styles.noteText}>{config.slotsHint}</p>}
            {config.formNote && <p className={styles.noteText}>{config.formNote}</p>}

            <div className={styles.block}>
              <Stepper label={config.guestsLabel} value={guests} onChange={setGuests} />
            </div>

            {total !== null && (
              <div className={styles.priceCard}>
                <span className={styles.priceCardTitle}>Total estimado: ${total}</span>
                <span className={styles.priceCardText}>
                  {formatGuests(config, guests)} × ${price} ({config.priceMeaning.toLowerCase()}).
                  El negocio confirma el precio al aceptar.
                </span>
              </div>
            )}
          </div>

          <div className={styles.bar}>
            {error && <p className={styles.errorText}>{error}</p>}
            <button type="button" className={styles.primaryButton} onClick={submit}
              disabled={!canSubmit || submitting}>
              {submitting ? "Enviando…" : auth.status === "signedIn"
                ? "Solicitar reserva" : "Iniciar sesión y solicitar"}
            </button>
            {!canSubmit && (
              <p className={styles.barHint}>
                {slots ? "Elige fecha y hora para continuar." : "Elige la fecha para continuar."}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className={styles.content}>
          <span className={styles.doneIcon}><IoCheckmark size={34} color="#FFFFFF" /></span>
          <h2 className={styles.doneTitle}>
            {done.status === "pending" ? "Solicitud enviada · pendiente de aceptación"
              : "Solicitud enviada"}
          </h2>
          <p className={styles.noteText}>
            Tu solicitud quedó guardada, pero todavía no está confirmada: {serviceName} debe
            aceptarla primero. No se realizó ningún cobro.
          </p>
          <div className={styles.priceCard}>
            <span className={styles.priceCardTitle}>{serviceName}</span>
            <span className={styles.priceCardText}>
              {formatDateLong(date)}{time ? ` · ${formatSlot(time)}` : ""} ·{" "}
              {formatGuests(config, guests)}
            </span>
            {done.quotedTotalCents !== null && (
              <span className={styles.priceCardTitle}>{formatMoney(done.quotedTotalCents)}</span>
            )}
            <span className={styles.priceCardText}>Solicitud #{done.id.slice(0, 8)}</span>
          </div>
          <Link href={`/servicios/${serviceSlug}`} className={styles.primaryButton}>
            Volver a la ficha
          </Link>
          <Link href="/mis-viajes" className={styles.secondaryButton}>Ver en Mis viajes</Link>
          <button type="button" className={styles.secondaryButton} onClick={() => {
            setIdempotencyKey(newIdempotencyKey());
            setDone(null);
            setError(null);
          }}>
            Hacer otra solicitud
          </button>
        </div>
      )}
    </div>
  );
}
