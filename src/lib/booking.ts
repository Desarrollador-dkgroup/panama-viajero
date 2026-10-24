"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// Reservas, cotización, pago y PIN (src/data/booking-queries.ts de la app). Toda escritura
// pasa por las funciones de Supabase; los identificadores son los de la base (uuid).

export class BookingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const MESSAGES: Record<string, string> = {
  authentication_required: "Debes iniciar sesión para continuar.",
  user_blocked: "Tu cuenta no puede crear solicitudes en este momento.",
  idempotency_key_required: "No se pudo preparar la solicitud. Vuelve a intentarlo.",
  invalid_dates: "Las fechas elegidas no son válidas.",
  invalid_guests: "El número de personas no es válido.",
  empty_room_lines: "Elige al menos una habitación.",
  service_not_available: "Este servicio ya no está disponible.",
  invalid_quantity: "La cantidad de habitaciones no es válida.",
  unknown_room_type: "Esa habitación ya no existe en este hospedaje.",
  sold_out: "Ya no hay disponibilidad para esas fechas. Elige otra combinación o cambia las fechas.",
  insufficient_capacity: "Las habitaciones elegidas no alcanzan para esa cantidad de personas.",
  invalid_date: "La fecha elegida no es válida.",
  use_create_stay_reservation: "Este servicio se reserva como hospedaje.",
  time_required: "Elige una hora para la reserva.",
  time_outside_hours: "Esa hora está fuera del horario de este restaurante.",
  invalid_departure_time: "Esa salida ya no está disponible para este servicio.",
  request_has_no_time: "Este servicio no pide una hora.",
  not_a_hospedaje_service: "Este servicio no es un hospedaje.",
  not_found: "No encontramos esta solicitud.",
  not_authorized: "No tienes permiso para esta acción.",
  not_pending: "Esta solicitud ya no está pendiente.",
  not_cancellable: "Esta solicitud ya no se puede cancelar.",
  network: "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
  payment_attempts_stay_only: "El pago en línea solo aplica a reservas de hospedaje por ahora.",
  reservation_not_payable: "Esta solicitud ya no admite un intento de pago.",
  no_quoted_amount: "Esta solicitud no tiene un importe cotizado.",
  reservation_not_eligible_for_checkin:
    "Esta reserva todavía no puede mostrar un PIN de llegada: el hotel debe aceptarla primero.",
  payment_not_verified: "Esta reserva necesita un pago verificado antes de continuar.",
  reservation_not_eligible_for_no_show:
    "Esta reserva no se puede marcar como no presentada en este momento.",
  adults_children_required: "Revisa adultos y niños: faltó uno de los dos valores.",
  invalid_adults_children: "El número de adultos o niños no es válido.",
  adults_children_mismatch: "Adultos + niños no coincide con el total de personas.",
};

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new BookingError("network", MESSAGES.network);
  return supabase;
}

function toBookingError(error: unknown): BookingError {
  if (error instanceof BookingError) return error;
  const raw = (error as { message?: string } | null)?.message;
  const code = raw && /^[a-z][a-z_]*$/.test(raw) ? raw : "network";
  return new BookingError(code,
    MESSAGES[code] ?? "No pudimos completar la solicitud. Intenta de nuevo.");
}

export function describeBookingError(error: unknown): string {
  return toBookingError(error).message;
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export type QuoteLine = { roomTypeId: string; name: string; quantity: number; pricePerNight: number };
export type QuoteCombination = {
  id: string;
  lines: QuoteLine[];
  totalCapacity: number;
  pricePerNight: number;
  nights: number;
  totalPrice: number;
};
export type StayQuote = { nights: number; combinations: QuoteCombination[] };

// Cotización del servidor: es la autoridad sobre precios y disponibilidad.
export async function quoteStay(serviceId: string, checkIn: string, checkOut: string,
  guests: number): Promise<StayQuote> {
  const { data, error } = await client().rpc("quote_stay", {
    p_service_id: serviceId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: guests,
  });
  if (error) throw toBookingError(error);
  const result = data as { nights: number; combinations: Omit<QuoteCombination, "id">[] };
  return {
    nights: result.nights,
    combinations: (result.combinations ?? []).map((combo) => ({
      ...combo,
      id: combo.lines.map((line) => `${line.roomTypeId}x${line.quantity}`).join("+"),
      pricePerNight: combo.pricePerNight / 100,
      totalPrice: combo.totalPrice / 100,
      lines: combo.lines.map((line) => ({ ...line, pricePerNight: line.pricePerNight / 100 })),
    })),
  };
}

export type ServerReservation = {
  id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  quotedTotalCents: number | null;
};

export async function createStayReservation(params: {
  serviceId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  lines: { roomTypeId: string; quantity: number }[];
  idempotencyKey: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  adults: number;
  children: number;
}): Promise<ServerReservation> {
  const { data, error } = await client().rpc("create_stay_reservation", {
    p_service_id: params.serviceId,
    p_check_in: params.checkIn,
    p_check_out: params.checkOut,
    p_guests: params.guests,
    p_room_lines: params.lines,
    p_idempotency_key: params.idempotencyKey,
    p_guest_name: params.guestName.trim() || null,
    p_guest_phone: params.guestPhone.trim() || null,
    p_guest_email: params.guestEmail.trim() || null,
    p_adults: params.adults,
    p_children: params.children,
  });
  if (error) throw toBookingError(error);
  return { id: data.id, status: data.status, quotedTotalCents: data.quoted_total_cents };
}

export async function createRequestReservation(params: {
  serviceId: string;
  date: string;
  time: string | null;
  guests: number;
  idempotencyKey: string;
}): Promise<ServerReservation> {
  const { data, error } = await client().rpc("create_request_reservation", {
    p_service_id: params.serviceId,
    p_reservation_date: params.date,
    p_reservation_time: params.time,
    p_guests: params.guests,
    p_idempotency_key: params.idempotencyKey,
  });
  if (error) throw toBookingError(error);
  return { id: data.id, status: data.status, quotedTotalCents: data.quoted_total_cents };
}

async function call(name: string, args: Record<string, unknown>) {
  const { data, error } = await client().rpc(name, args);
  if (error) throw toBookingError(error);
  return data;
}

export const cancelReservation = (id: string) =>
  call("cancel_reservation", { p_reservation_id: id });
export const acceptReservation = (id: string) =>
  call("accept_reservation", { p_reservation_id: id });
export const declineReservation = (id: string, reason?: string) =>
  call("decline_reservation", { p_reservation_id: id, p_reason: reason?.trim() || null });
export const markNoShow = (id: string) =>
  call("mark_reservation_no_show", { p_reservation_id: id });

export type PaymentAttempt = { id: string; status: string; amountCents: number; currency: string };

export async function createPaymentAttempt(reservationId: string): Promise<PaymentAttempt> {
  const data = await call("create_payment_attempt", {
    p_reservation_id: reservationId,
    p_attempt_reference: newIdempotencyKey(),
  });
  return { id: data.id, status: data.status, amountCents: data.amount_cents,
    currency: data.currency };
}

export type CheckinPin = { pinCode: string; status: string; attempts: number; maxAttempts: number };

export async function getOrIssueCheckinPin(reservationId: string): Promise<CheckinPin> {
  const data = await call("get_or_issue_checkin_pin", { p_reservation_id: reservationId });
  return { pinCode: data.pin_code, status: data.status, attempts: data.attempts,
    maxAttempts: data.max_attempts };
}

export async function validateCheckinPin(reservationId: string, pin: string) {
  const data = await call("validate_checkin_pin", { p_reservation_id: reservationId, p_pin: pin });
  return data as { result: string; attempts?: number; maxAttempts?: number };
}

export type Reservation = {
  id: string;
  created_at: string;
  customer_id: string;
  service_id: string;
  kind: "stay" | "table" | "activity" | "request";
  status: "pending" | "accepted" | "declined" | "cancelled";
  check_in: string | null;
  check_out: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  guests: number;
  quoted_total_cents: number | null;
  price_detail: string | null;
  decline_reason: string | null;
  cancelled_by: "customer" | "business" | null;
  is_test: boolean;
  hold_expires_at: string | null;
  visit_status: "pending_arrival" | "validated" | "no_show" | "cancelled";
  reservation_payment_state: "unpaid" | "verified" | "failed" | "refunded";
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  adults: number | null;
  children: number | null;
  reservation_room_lines: { quantity: number; price_cents_per_night: number;
    room_types: { name: string } | null }[];
  services: { name: string; slug: string; category_id: string;
    destination_province_id: string | null } | null;
};

const RESERVATION_SELECT =
  "id, created_at, customer_id, service_id, kind, status, check_in, check_out, reservation_date, " +
  "reservation_time, guests, quoted_total_cents, price_detail, decline_reason, cancelled_by, " +
  "is_test, hold_expires_at, visit_status, reservation_payment_state, guest_name, guest_phone, " +
  "guest_email, adults, children, " +
  "reservation_room_lines(quantity, price_cents_per_night, room_types(name)), " +
  "services(name, slug, category_id, destination_province_id)";

// Las políticas de la base ya limitan qué reservas ve cada quien (cliente o negocio).
export async function fetchReservations(): Promise<Reservation[]> {
  const { data, error } = await client().from("reservations").select(RESERVATION_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw toBookingError(error);
  return (data ?? []) as unknown as Reservation[];
}

export async function fetchReservation(id: string): Promise<Reservation | null> {
  const { data, error } = await client().from("reservations").select(RESERVATION_SELECT)
    .eq("id", id).maybeSingle();
  if (error) throw toBookingError(error);
  return (data as unknown as Reservation | null) ?? null;
}

export type BusinessMembership = { businessId: string; role: string; businessName: string };

export async function fetchBusinessMemberships(): Promise<BusinessMembership[]> {
  const { data, error } = await client().from("business_members")
    .select("business_id, role, businesses(name)");
  if (error) throw toBookingError(error);
  return ((data ?? []) as unknown as { business_id: string; role: string;
    businesses: { name: string } | null }[]).map((row) => ({
    businessId: row.business_id,
    role: row.role,
    businessName: row.businesses?.name ?? "Comercio",
  }));
}

// "2026-10-24" ↔ fecha local, sin desfases de zona horaria.
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()).padStart(2, "0")}`;
}

export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateLong(value: string | Date): string {
  const date = typeof value === "string" ? parseISODate(value) : value;
  if (!date) return "";
  return date.toLocaleDateString("es-PA", { weekday: "short", day: "numeric", month: "short",
    year: "numeric" });
}

export function formatMoney(cents: number | null): string {
  if (cents == null) return "";
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
