import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteMenu } from "@/components/site-menu";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Carga Inter localmente para los textos y títulos del catálogo
const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

// Carga los encabezados de marca desde el archivo local
const invisible = localFont({
  src: "./fonts/Invisible-ExtraBold.otf",
  variable: "--font-invisible",
  weight: "800",
  display: "swap",
});

// Registra los cuatro estilos de TangoSans
const tango = localFont({
  src: [
    { path: "./fonts/TangoSans.ttf", weight: "400", style: "normal" },
    { path: "./fonts/TangoSans_Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/TangoSans_Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/TangoSans_BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-tango",
  display: "swap",
});

// Define los datos de la pestaña y los buscadores
export const metadata: Metadata = {
  title: "Panamá Viajero | Descubre tu próxima aventura",
  description: "Descubre destinos, alojamientos y sabores de Panamá.",
};

// Comparte las fuentes, el menú y el pie de página
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${invisible.variable} ${tango.variable} ${inter.variable}`}
    >
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <SiteMenu />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
