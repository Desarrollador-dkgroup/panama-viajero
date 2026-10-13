import { PromotionsPage } from "@/components/promotions-page";
import { getPromotions } from "@/lib/promotions";

// Consulta las promociones en cada visita para reflejar cambios desde el padmin.
export const dynamic = "force-dynamic";

// Presenta el catálogo de promociones publicado en la base de datos.
export default async function Page() {
  const promotions = await getPromotions();

  return <PromotionsPage promotions={promotions} />;
}
