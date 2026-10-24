import { CatalogError } from "@/components/app/catalog-status";
import { RequestScreen } from "@/components/app/flow/request-screen";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { attempt } from "@/lib/attempt";
import { reservationConfigFor } from "@/lib/reservation-config";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reservar | Panamá Viajero" };

export default async function RequestPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkIn?: string; guests?: string }>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  const detail = result.data;
  const restaurant = detail?.restaurant;
  const config = detail && reservationConfigFor(detail.item.categoryId, {
    name: detail.item.name,
    schedule: detail.schedule,
    hours: restaurant?.hoursFrom && restaurant.hoursTo
      ? { from: restaurant.hoursFrom, to: restaurant.hoursTo } : null,
  });
  if (!detail || !config) {
    return <NotFoundScreen message="No encontramos este servicio para reservar." />;
  }
  return (
    <RequestScreen
      serviceId={detail.item.id}
      serviceName={detail.item.name}
      serviceSlug={detail.item.slug}
      price={detail.item.price}
      config={config}
      initialDate={search.checkIn ?? null}
      initialGuests={search.guests ? Number(search.guests) || null : null}
    />
  );
}
