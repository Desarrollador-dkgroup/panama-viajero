import { PromotionsPage } from "@/components/promotions-page";
import { getPromotions } from "@/lib/promotions";

// Presenta el catálogo de promociones publicado en la base de datos.
export default async function Page() {
  const promotions = await getPromotions();

  return <PromotionsPage promotions={promotions} />;
}
