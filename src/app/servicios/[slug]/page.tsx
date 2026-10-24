import type { Metadata } from "next";
import { CatalogError } from "@/components/app/catalog-status";
import { NotFoundScreen } from "@/components/app/not-found-screen";
import { ServiceScreen } from "@/components/app/service/service-screen";
import { attempt } from "@/lib/attempt";
import { getServiceDetail } from "@/lib/service-detail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await attempt(() => getServiceDetail(slug));
  const name = result.data?.item.name;
  return {
    title: name ? `${name} | Panamá Viajero` : "Panamá Viajero",
    description: result.data?.item.searchDescription || undefined,
  };
}

// Ficha de un servicio publicado, copiada de la app.
export default async function ServicePage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const result = await attempt(() => getServiceDetail(slug));
  if (result.error !== null) return <CatalogError message={result.error} />;
  if (!result.data) return <NotFoundScreen message="No encontramos este servicio." />;
  return <ServiceScreen detail={result.data} search={search} />;
}
