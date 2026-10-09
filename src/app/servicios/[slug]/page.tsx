import { ServiceDetail } from "@/components/service-detail";
import { getServiceDetails } from "@/lib/service-details";

// Presenta el detalle de un servicio seleccionado desde el catálogo.
export default async function ServicePage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceDetails(slug);

  return <ServiceDetail service={service} />;
}
