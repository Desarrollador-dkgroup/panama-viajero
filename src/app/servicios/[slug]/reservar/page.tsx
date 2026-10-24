import { CatalogError } from "@/components/app/catalog-status";
import { BookingScreen } from "@/components/app/flow/booking-screen";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { attempt } from "@/lib/attempt";
import { formatPlace } from "@/lib/catalog";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reservar hospedaje | Panamá Viajero" };

export default async function BookingPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string;
    preferredRoom?: string }>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const detail = result.data;
  if (!detail || detail.rooms.length === 0) {
    return <NotFoundScreen message="No encontramos este hospedaje para reservar." />;
  }
  const room = detail.rooms.find((candidate) => candidate.slug === search.preferredRoom);
  return (
    <BookingScreen
      serviceId={detail.item.id}
      serviceName={detail.item.name}
      serviceSlug={detail.item.slug}
      place={formatPlace(detail.item)}
      rating={detail.item.rating}
      preferredRoom={room ? { id: room.id, name: room.name } : null}
      initial={search}
    />
  );
}
