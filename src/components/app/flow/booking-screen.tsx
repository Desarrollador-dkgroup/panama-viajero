"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoCalendarOutline, IoCardOutline, IoCheckmark, IoChevronBack, IoStar } from "react-icons/io5";
import { useAuthSession } from "@/lib/auth-session";
import {
  BookingError,
  createPaymentAttempt,
  createStayReservation,
  describeBookingError,
  formatDateLong,
  formatMoney,
  newIdempotencyKey,
  quoteStay,
  toISODate,
  type QuoteCombination,
  type ServerReservation,
} from "@/lib/booking";
import { Stepper } from "./stepper";
import styles from "./flow.module.css";

type Step = "dates" | "options" | "summary" | "checkout" | "result";
type Quote =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; nights: number; combinations: QuoteCombination[] };

// Reserva de hospedaje (src/app/booking/[id].tsx): fechas, opciones del servidor, resumen
// con datos del huésped, pago simulado (sin cobro) y resultado.
export function BookingScreen({ serviceId, serviceName, serviceSlug, place, rating, preferredRoom,
  initial }: {
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  place: string;
  rating: number;
  preferredRoom: { id: string; name: string } | null;
  initial: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const router = useRouter();
  const auth = useAuthSession();
  const today = toISODate(new Date());
  const [step, setStep] = useState<Step>("dates");
  const [checkIn, setCheckIn] = useState(initial.checkIn && initial.checkIn >= today
    ? initial.checkIn : "");
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? "");
  const [adults, setAdults] = useState(Math.max(1, Number(initial.guests) || 2));
  const [children, setChildren] = useState(0);
  const [quote, setQuote] = useState<Quote>({ status: "idle" });
  const [ignorePreference, setIgnorePreference] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Nombre y correo de la sesión como valor inicial, hasta que el viajero los cambie.
  const [nameInput, setGuestName] = useState<string | null>(null);
  const [guestPhone, setGuestPhone] = useState("");
  const [emailInput, setGuestEmail] = useState<string | null>(null);
  const guestName = nameInput ?? auth.profile?.displayName ?? "";
  const guestEmail = emailInput ?? auth.email ?? "";
  const [touched, setTouched] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [rejected, setRejected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ServerReservation | null>(null);

  const guests = adults + children;
  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn);
  const combinations = quote.status === "ready" ? quote.combinations : [];
  const visible = preferredRoom && !ignorePreference
    ? combinations.filter((combo) => combo.lines.some((line) => line.roomTypeId === preferredRoom.id))
    : combinations;
  const selected = combinations.find((combo) => combo.id === selectedId) ?? null;
  const nameError = touched && guestName.trim().length < 3;
  const emailError = touched && guestEmail.trim() !== ""
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());

  async function loadQuote() {
    setQuote({ status: "loading" });
    try {
      const result = await quoteStay(serviceId, checkIn, checkOut, guests);
      setQuote({ status: "ready", ...result });
    } catch (failure) {
      setQuote({ status: "error", message: describeBookingError(failure) });
    }
  }

  function back() {
    if (step === "options") return setStep("dates");
    if (step === "summary") return setStep("options");
    if (step === "checkout") return setStep("summary");
    if (window.history.length > 1) router.back();
    else router.push(`/servicios/${serviceSlug}`);
  }

  async function pay() {
    if (!selected || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createStayReservation({
        serviceId, checkIn, checkOut, guests, idempotencyKey, guestName, guestPhone, guestEmail,
        adults, children,
        lines: selected.lines.map((line) => ({ roomTypeId: line.roomTypeId,
          quantity: line.quantity })),
      });
      void createPaymentAttempt(created.id).catch(() => undefined);
      setReservation(created);
      setStep("result");
    } catch (failure) {
      setSubmitError(describeBookingError(failure));
      if (failure instanceof BookingError
        && (failure.code === "sold_out" || failure.code === "insufficient_capacity")) {
        setSelectedId(null);
        setIdempotencyKey(newIdempotencyKey());
        setStep("options");
        void loadQuote();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const title = step === "dates" ? "Planifica tu estadía"
    : step === "summary" ? "Revisa tu solicitud" : serviceName;
  const stayLine = datesValid
    ? `${formatDateLong(checkIn)} → ${formatDateLong(checkOut)} · ${guests} ${
      guests === 1 ? "persona" : "personas"}` : "";

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {step !== "result" && (
          <button type="button" className={styles.headerBack} onClick={back} aria-label="Volver">
            <IoChevronBack size={22} color="var(--text-strong)" aria-hidden />
          </button>
        )}
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>{step === "result" ? "Solicitud enviada" : "Reservar"}</span>
          <h1 className={styles.headerTitle}>{title}</h1>
        </div>
      </div>

      {step === "dates" && (
        <>
          <div className={styles.content}>
            <div className={styles.priceCard}>
              <span className={styles.priceCardTitle}>{serviceName}</span>
              <span className={styles.priceCardText}>
                <IoStar size={12} color="var(--star)" aria-hidden /> {rating.toFixed(1)} · {place}
              </span>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Entrada</h2>
              <label className={styles.dateField}>
                <IoCalendarOutline size={20} color="var(--indigo)" aria-hidden />
                <input type="date" className={styles.dateInput} min={today} value={checkIn}
                  aria-label="Fecha de entrada" onChange={(event) => setCheckIn(event.target.value)} />
              </label>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Salida</h2>
              <label className={styles.dateField}>
                <IoCalendarOutline size={20} color="var(--indigo)" aria-hidden />
                <input type="date" className={styles.dateInput} min={checkIn || today}
                  value={checkOut} aria-label="Fecha de salida"
                  onChange={(event) => setCheckOut(event.target.value)} />
              </label>
              {checkIn && checkOut && !datesValid && (
                <p className={styles.errorText}>
                  La fecha de salida debe ser posterior a la de entrada.
                </p>
              )}
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Viajeros</h2>
              <Stepper label="Adultos" hint="13 años o más" value={adults} onChange={setAdults}
                icon={false} />
              <Stepper label="Niños" hint="De 0 a 12 años" value={children} onChange={setChildren}
                min={0} icon={false} />
            </div>
          </div>
          <div className={styles.bar}>
            <button type="button" className={styles.primaryButton} disabled={!datesValid}
              onClick={() => {
                setStep("options");
                setSelectedId(null);
                void loadQuote();
              }}>
              Ver disponibilidad
            </button>
          </div>
        </>
      )}

      {step === "options" && (
        <>
          <div className={styles.content}>
            <div className={styles.optionTop}>
              <span className={styles.noteText}>{stayLine}</span>
              <button type="button" className={styles.linkButton} onClick={() => setStep("dates")}>
                Editar
              </button>
            </div>
            {quote.status === "loading" && (
              <p className={styles.noteText}>Consultando disponibilidad real…</p>
            )}
            {quote.status === "error" && (
              <>
                <p className={styles.errorText}>{quote.message}</p>
                <button type="button" className={styles.secondaryButton} onClick={loadQuote}>
                  Reintentar
                </button>
              </>
            )}
            {quote.status === "ready" && preferredRoom && (
              <div className={styles.optionTop}>
                <span className={styles.noteText}>
                  {ignorePreference ? "Todas las combinaciones"
                    : `Opciones que incluyen "${preferredRoom.name}"`}
                </span>
                <button type="button" className={styles.linkButton}
                  onClick={() => setIgnorePreference((value) => !value)}>
                  {ignorePreference ? "Filtrar de nuevo" : "Ver todas"}
                </button>
              </div>
            )}
            {quote.status === "ready" && visible.length === 0 && (
              <>
                <p className={styles.noteText}>
                  No hay habitaciones disponibles para {guests} {guests === 1 ? "persona" : "personas"}
                  {" "}en esas fechas.
                </p>
                <button type="button" className={styles.secondaryButton}
                  onClick={() => setStep("dates")}>
                  Modificar fechas o personas
                </button>
              </>
            )}
            {visible.map((combo) => (
              <button key={combo.id} type="button" aria-pressed={combo.id === selectedId}
                className={`${styles.optionCard} ${combo.id === selectedId ? styles.optionSelected : ""}`}
                onClick={() => setSelectedId(combo.id)}>
                <span className={styles.optionTop}>
                  <span className={styles.priceCardTitle}>
                    {combo.lines.map((line) => `${line.quantity} × ${line.name}`).join(" + ")}
                  </span>
                  <span className={styles.optionTotal}>${combo.totalPrice}</span>
                </span>
                <span className={styles.priceCardText}>
                  Hasta {combo.totalCapacity} personas · ${combo.pricePerNight} por noche ·{" "}
                  {combo.nights} {combo.nights === 1 ? "noche" : "noches"}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.bar}>
            {selected && (
              <p className={styles.barHint}>Total de la estancia: <strong>${selected.totalPrice}</strong></p>
            )}
            <button type="button" className={styles.primaryButton} disabled={!selected}
              onClick={() => setStep("summary")}>
              Continuar
            </button>
          </div>
        </>
      )}

      {step === "summary" && selected && (
        <>
          <div className={styles.content}>
            <div className={styles.priceCard}>
              <span className={styles.priceCardTitle}>{serviceName}</span>
              <span className={styles.priceCardText}>{place}</span>
              <span className={styles.priceCardText}>{stayLine}</span>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Habitaciones elegidas</h2>
              {selected.lines.map((line) => (
                <div key={line.roomTypeId} className={styles.optionTop}>
                  <span className={styles.noteText}>{line.quantity} × {line.name}</span>
                  <span className={styles.noteText}>
                    ${line.pricePerNight * line.quantity * selected.nights}
                  </span>
                </div>
              ))}
              <div className={styles.optionTop}>
                <span className={styles.blockTitle}>Total</span>
                <span className={styles.optionTotal}>${selected.totalPrice}</span>
              </div>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Datos del huésped</h2>
              <label className={styles.textField}>
                Nombre completo
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)}
                  autoComplete="name" />
              </label>
              {nameError && <p className={styles.errorText}>Ingresa el nombre completo del huésped.</p>}
              <label className={styles.textField}>
                Teléfono
                <input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)}
                  type="tel" autoComplete="tel" />
              </label>
              <label className={styles.textField}>
                Email
                <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)}
                  type="email" autoComplete="email" />
              </label>
              {emailError && <p className={styles.errorText}>Revisa el formato del email.</p>}
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Condiciones de pago</h2>
              <p className={styles.noteText}>
                El hotel debe aceptar tu solicitud. No se realiza ningún cobro en esta página.
              </p>
            </div>
          </div>
          <div className={styles.bar}>
            {auth.status !== "signedIn" && (
              <p className={styles.barHint}>Inicia sesión para continuar al pago.</p>
            )}
            <button type="button" className={styles.primaryButton} onClick={() => {
              setTouched(true);
              if (guestName.trim().length < 3 || emailError) return;
              if (auth.status !== "signedIn") {
                router.push(`/cuenta/ingresar?next=${encodeURIComponent(window.location.pathname
                  + window.location.search)}`);
                return;
              }
              setRejected(false);
              setStep("checkout");
            }}>
              Continuar
            </button>
          </div>
        </>
      )}

      {step === "checkout" && selected && (
        <div className={styles.content}>
          <div className={styles.priceCard}>
            <span className={styles.priceCardTitle}>
              <IoCardOutline size={16} aria-hidden /> Simulación de pasarela de pago
            </span>
            <span className={styles.priceCardText}>
              Ninguna pasarela real está conectada. No se pide número de tarjeta, CVV ni datos
              bancarios, y no se realiza ningún cobro.
            </span>
            <span className={styles.optionTop}>
              <span className={styles.noteText}>Importe</span>
              <span className={styles.optionTotal}>${selected.totalPrice}</span>
            </span>
            <span className={styles.priceCardText}>Referencia: {idempotencyKey.slice(0, 18)}</span>
          </div>
          {rejected && (
            <p className={styles.errorText}>
              Pago simulado rechazado. No se envió ninguna solicitud. Puedes intentarlo de nuevo.
            </p>
          )}
          {submitError && <p className={styles.errorText}>{submitError}</p>}
          <button type="button" className={styles.primaryButton} onClick={pay} disabled={submitting}>
            {submitting ? "Enviando…" : "Simular pago exitoso"}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => setRejected(true)}>
            Simular pago rechazado
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => setStep("summary")}>
            Volver sin pagar
          </button>
        </div>
      )}

      {step === "result" && reservation && selected && (
        <div className={styles.content}>
          <span className={styles.doneIcon}><IoCheckmark size={34} color="#FFFFFF" /></span>
          <h2 className={styles.doneTitle}>Solicitud enviada · pendiente de aceptación</h2>
          <p className={styles.noteText}>
            {serviceName} debe aceptar tu solicitud. Tus datos de contacto y el desglose de adultos y
            niños se guardaron con esta reserva.
          </p>
          <div className={styles.priceCard}>
            <span className={styles.priceCardTitle}>{serviceName}</span>
            <span className={styles.priceCardText}>{stayLine}</span>
            <span className={styles.priceCardTitle}>
              {formatMoney(reservation.quotedTotalCents ?? Math.round(selected.totalPrice * 100))}
            </span>
            <span className={styles.priceCardText}>Solicitud #{reservation.id.slice(0, 8)}</span>
          </div>
          <Link href={`/mis-viajes/${reservation.id}`} className={styles.primaryButton}>
            Ver en Mis viajes
          </Link>
          <Link href="/" className={styles.secondaryButton}>Volver al inicio</Link>
        </div>
      )}
    </div>
  );
}
