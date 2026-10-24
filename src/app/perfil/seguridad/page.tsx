import { permanentRedirect } from "next/navigation";

// Dirección anterior: la cuenta vive ahora en /cuenta, como la pestaña de la app.
export default function LegacyAccountPage() {
  permanentRedirect("/cuenta/cambiar-contrasena");
}
