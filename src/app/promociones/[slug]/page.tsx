import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteBanner } from "@/components/site-banner";
import { getPromotions } from "@/lib/promotions";

// Muestra el detalle completo de una promoción publicada.
export default async function PromotionDetail({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promotion = (await getPromotions()).find((item) => item.slug === slug);

  if (!promotion) {
    return <main className="container"><h1>Promoción no encontrada</h1></main>;
  }

  const image = promotion.photoPath.startsWith("/")
    || promotion.photoPath.startsWith("http")
    ? promotion.photoPath : "/P-Principal/Banner.png";
  const details = promotion.offerType === "tours"
    ? ["Punto de encuentro: muelle principal", "Salida: 8:00 a. m.",
      "Duración: 8 horas", "Incluye guía y transporte"]
    : promotion.offerType === "hospedajes"
      ? ["Habitación: categoría seleccionada", "Entrada: 3:00 p. m.",
        "Salida: 12:00 p. m.", "Incluye servicios indicados en la oferta"]
      : promotion.offerType === "restaurantes"
        ? ["Menú especial incluido", "Horario: 12:00 p. m. a 10:00 p. m.",
          "Reserva previa recomendada", "Consulta ingredientes y alérgenos"]
        : promotion.offerType === "transporte"
          ? ["Servicio puerta a puerta", "Capacidad: hasta 4 pasajeros",
            "Duración según el trayecto", "Reserva previa requerida"]
          : ["Actividad guiada", "Duración según la experiencia",
            "Cupos sujetos a disponibilidad", "Consulta requisitos antes de reservar"];

  return (
    <>
      <SiteBanner eyebrow={promotion.offerType.toUpperCase()} title={promotion.title}
        description={promotion.placeName} />
      <main className="container" style={{ padding: "28px 0 72px" }}>
        <Link href="/promociones" style={{ color: "var(--brand)", fontWeight: 700 }}>
          <ChevronLeft size={17} /> Volver a promociones
        </Link>
        <article style={{ marginTop: 22, padding: 28, border: "1px solid var(--border)",
          borderRadius: 18, background: "#fff" }}>
          <p style={{ color: "var(--accent)", fontWeight: 700 }}>{promotion.offerType}</p>
          <h1 style={{ fontSize: 36, margin: "10px 0" }}>{promotion.title}</h1>
          <p>{promotion.placeName}</p>
          <h2 style={{ color: "var(--accent)", margin: "24px 0 10px" }}>
            {promotion.discountValue} {promotion.discountSuffix}
          </h2>
          <p>{promotion.priceLine}</p>
          <img src={image} alt="" style={{ width: "100%", maxHeight: 380, objectFit: "cover",
            borderRadius: 14, marginTop: 22 }} />
          <p style={{ marginTop: 22 }}>{promotion.tags.join(" · ")}</p>
          <p style={{ color: "var(--muted)", marginTop: 12 }}>{promotion.periodLabel}</p>
          <section style={{ marginTop: 22 }}>
            <h2>Información de la oferta</h2>
            <ul>
              {details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          </section>
          <section style={{ marginTop: 22 }}>
            <h2>Contacto y condiciones</h2>
            <p>Contacta al negocio para confirmar disponibilidad, reservas y condiciones.</p>
          </section>
        </article>
      </main>
    </>
  );
}
