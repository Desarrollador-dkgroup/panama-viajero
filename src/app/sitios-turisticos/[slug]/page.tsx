import Link from "next/link";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { CatalogImage } from "@/components/home-content";
import { TouristSiteServices } from "@/components/tourist-site-services";
import { getSupabaseServerClient } from "@/lib/supabase";

// Presenta el detalle de un sitio turístico almacenado en Supabase.
export default async function TouristSitePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: site } = await supabase
    .from("tourist_sites")
    .select("id, name, description, short_description, photo_storage_path, cities(name), provinces(id)")
    .eq("slug", slug)
    .maybeSingle();

  if (!site) return <main className="container"><h1>Sitio no encontrado</h1></main>;

  const { data: services } = await supabase
    .from("services")
    .select("id, slug, name, categories(id, label), cities(name)")
    .eq("tourist_site_id", site.id);

  const image = site.photo_storage_path ?? "/P-Principal/Banner.png";
  return (
    <main>
      <section style={{ position: "relative", minHeight: 390, overflow: "hidden",
        background: "var(--brand)" }}>
        <div className="tourist-hero-image" style={{ position: "absolute", inset: 0 }}>
          <CatalogImage src={image} alt={site.name} />
        </div>
        <div style={{ position: "absolute", inset: 0, padding: "70px max(24px, 8vw)",
          color: "#fff", background: "linear-gradient(90deg, rgb(0 0 0 / 65%), transparent)" }}>
          <Link href="/destinos" style={{ fontWeight: 700 }}><ArrowLeft size={17} /> Volver a destinos</Link>
          <h1 style={{ marginTop: 80, fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>{site.name}</h1>
          <p style={{ fontSize: 18, maxWidth: 650 }}>{site.short_description}</p>
        </div>
      </section>
      <div className="container" style={{ marginTop: -42, position: "relative", zIndex: 2 }}>
        <div>
          <TouristSiteServices siteName={site.name} services={(services ?? []).map((service) => ({
            id: service.id,
            slug: service.slug,
            name: service.name,
            category: (service.categories as { id?: string } | null)?.id ?? "otros",
          }))} />
        </div>
        <div className="tourist-content-grid" style={{ display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 28,
          padding: "18px 0 72px" }}>
          <section />
          <aside style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h2>Sobre {site.name}</h2>
            <p style={{ marginTop: 12, color: "var(--brand)", fontWeight: 700 }}>
              <MapPin size={16} /> {(site.cities as { name?: string } | null)?.name ?? "Panamá"}
            </p>
            <p style={{ marginTop: 8, color: "var(--muted)" }}>{site.description}</p>
            <div style={{ height: 190, marginTop: 20, borderRadius: 14, background: "#cdebf3",
              display: "grid", placeItems: "center", color: "var(--brand)" }}>
              <MapPin size={32} /> Ver ubicación en el mapa
            </div>
            <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: "#eef5fa" }}>
              <h3 style={{ color: "var(--brand)" }}><Navigation size={17} /> Cómo llegar</h3>
              <p style={{ marginTop: 7, color: "var(--muted)" }}>
                Consulta la ruta disponible desde la ciudad más cercana.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
