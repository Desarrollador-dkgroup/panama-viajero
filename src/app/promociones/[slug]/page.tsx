import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteBanner } from "@/components/site-banner";
import { formatPromotionPrice } from "@/types/content";
import { getPromotions } from "@/lib/promotions";

// Muestra el detalle completo de una promoción publicada.
export default async function PromotionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promotion = (await getPromotions()).find((item) => item.slug === slug);

  if (!promotion) {
    return (
      <main className="container">
        <h1>Promoción no encontrada</h1>
      </main>
    );
  }

  const image =
    promotion.photoPath.startsWith("/") || promotion.photoPath.startsWith("http")
      ? promotion.photoPath
      : "/P-Principal/Banner.png";

  return (
    <>
      <SiteBanner
        eyebrow={promotion.offerType.toUpperCase()}
        title={promotion.title}
        description={promotion.placeName}
      />
      <main className="container" style={{ padding: "28px 0 72px" }}>
        <Link href="/promociones" style={{ color: "var(--brand)", fontWeight: 700 }}>
          <ChevronLeft size={17} /> Volver a promociones
        </Link>
        <article
          style={{
            marginTop: 22,
            padding: 28,
            border: "1px solid var(--border)",
            borderRadius: 18,
            background: "#fff",
          }}
        >
          <p style={{ color: "var(--accent)", fontWeight: 700 }}>{promotion.offerType}</p>
          <h1 style={{ fontSize: 36, margin: "10px 0" }}>{promotion.title}</h1>
          <p>{promotion.placeName}</p>
          <h2 style={{ color: "var(--accent)", margin: "24px 0 10px" }}>
            {promotion.discountValue} {promotion.discountSuffix}
          </h2>
          {/* Diferencia el precio habitual del precio final de la oferta. */}
          {promotion.regularPriceCents !== null && (
            <p>
              Precio regular: <del>{formatPromotionPrice(promotion.regularPriceCents)}</del>
            </p>
          )}
          <p>Precio promocional: {promotion.priceLine}</p>
          <img
            src={image}
            alt=""
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              borderRadius: 14,
              marginTop: 22,
            }}
          />
          <p style={{ marginTop: 22 }}>{promotion.tags.join(" · ")}</p>
          <p style={{ color: "var(--muted)", marginTop: 12 }}>{promotion.periodLabel}</p>
          {/* Presenta exclusivamente contenido registrado en la promoción. */}
          {promotion.description && (
            <section style={{ marginTop: 22 }}>
              <h2>Información de la oferta</h2>
              <p>{promotion.description}</p>
            </section>
          )}
          {promotion.inclusions.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <h2>Incluye</h2>
              <ul>
                {promotion.inclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {promotion.exclusions.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <h2>No incluye</h2>
              <ul>
                {promotion.exclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {promotion.scheduleDetails && (
            <section style={{ marginTop: 22 }}>
              <h2>Horarios</h2>
              <p>{promotion.scheduleDetails}</p>
            </section>
          )}
          <section style={{ marginTop: 22 }}>
            <h2>Contacto y condiciones</h2>
            {promotion.conditions && <p>{promotion.conditions}</p>}
            <p>Contacta al negocio para confirmar disponibilidad, reservas y condiciones.</p>
          </section>
        </article>
      </main>
    </>
  );
}
