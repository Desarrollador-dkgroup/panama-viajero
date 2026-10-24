import { permanentRedirect } from "next/navigation";

// Dirección anterior: las categorías viven ahora en /categoria/[id], como en la app.
export default function LegacyCategoryPage() {
  permanentRedirect("/categoria/restaurantes");
}
