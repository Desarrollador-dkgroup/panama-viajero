import { ProvincePage } from "@/components/province-page";

// Presenta el detalle turístico de una provincia.
export default async function ProvinceRoute({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProvincePage slug={slug} />;
}
