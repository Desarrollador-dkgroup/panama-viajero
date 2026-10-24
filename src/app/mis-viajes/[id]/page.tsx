import { ReservationDetail } from "@/components/app/trips/reservation-detail";

export const metadata = { title: "Solicitud | Panamá Viajero" };

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReservationDetail id={id} />;
}
