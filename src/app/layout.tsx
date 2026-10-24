import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app/app-shell";
import "./globals.css";
import "./legacy.css";

// Define los datos de la pestaña y los buscadores
export const metadata: Metadata = {
  title: "Panamá Viajero | Descubre tu próxima aventura",
  description: "Descubre destinos, hospedajes, restaurantes y experiencias en Panamá.",
};

// Ocupa toda la pantalla del celular, incluida la zona bajo la barra del sistema.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

// Comparte el marco de la app (pestañas y barra superior) en todas las páginas.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
