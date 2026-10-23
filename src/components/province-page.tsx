import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { CatalogImage } from "@/components/home-content";
import { getDestination } from "@/lib/destinations";
import { publicMediaUrl } from "@/lib/storage";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getTouristSites } from "@/lib/tourist-sites";
import styles from "./province-page.module.css";

type ProvinceService = {
  id: string;
  name: string;
  category: string;
  image: string;
  site: string;
};

// Hospedajes y restaurantes publicados cuyo destino es esta provincia.
async function getProvinceServices(provinceId: string): Promise<ProvinceService[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("services")
    .select(`
      id, name, category_id,
      tourist_sites!services_tourist_site_id_fkey(name),
      service_photos(storage_path, is_cover, position, lodging_area_id)
    `)
    .eq("status", "published")
    .eq("destination_province_id", provinceId)
    .in("category_id", ["hospedaje", "restaurantes"])
    .order("is_recommended", { ascending: false })
    .order("name");
  if (error || !data) return [];

  return data.map((service) => {
    const cover = [...(service.service_photos ?? [])]
      .filter((photo) => !photo.lodging_area_id)
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position)[0];
    const site = service.tourist_sites as { name?: string } | null;
    return {
      id: service.id,
      name: service.name,
      category: service.category_id,
      image: publicMediaUrl(cover?.storage_path) || "/P-Principal/Banner.png",
      site: site?.name ?? "",
    };
  });
}

// Presenta un destino del panel con sus sitios turísticos, mapa y servicios.
export async function ProvincePage({ slug }: { slug: string }) {
  const destination = await getDestination(slug);
  if (!destination) notFound();

  const [sites, services] = await Promise.all([
    getTouristSites(destination.provinceId),
    getProvinceServices(destination.provinceId),
  ]);
  const groups = [
    { title: "Hospedajes", items: services.filter((item) => item.category === "hospedaje") },
    { title: "Restaurantes", items: services.filter((item) => item.category === "restaurantes") },
  ].filter((group) => group.items.length);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src={destination.bannerImage} alt={destination.name} fill priority />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link href="/destinos" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver a destinos
          </Link>
          <p>DESTINO · PANAMÁ</p>
          <h1>{destination.name}</h1>
          <span>{destination.description || destination.subtitle}</span>
        </div>
      </section>
      <div className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p>EXPLORA {destination.name.toUpperCase()}</p>
            <h2>Sitios turísticos</h2>
          </div>
          <span>
            <MapPin size={18} /> {destination.name}
          </span>
        </div>
        <section
          className={styles.siteGrid}
          aria-label={`Sitios turísticos de ${destination.name}`}
        >
          {sites.map((site) => (
            <article key={site.id} className={styles.siteCard}>
              <Link href={`/sitios-turisticos/${site.slug}`} className={styles.siteImageLink}>
                <CatalogImage src={site.photoPath} alt={site.name} />
              </Link>
              <div className={styles.siteBody}>
                <h3>
                  <Link href={`/sitios-turisticos/${site.slug}`}>{site.name}</Link>
                </h3>
                <p>{site.shortDescription}</p>
              </div>
            </article>
          ))}
          {sites.length === 0 && <p>No hay sitios turísticos disponibles.</p>}
        </section>

        {groups.map((group) => (
          <section key={group.title}>
            <div className={styles.heading}>
              <div>
                <p>EN {destination.name.toUpperCase()}</p>
                <h2>{group.title}</h2>
              </div>
            </div>
            <div className={styles.siteGrid}>
              {group.items.map((item) => (
                <article key={item.id} className={styles.siteCard}>
                  <Link href={`/servicios/${item.id}`} className={styles.siteImageLink}>
                    <CatalogImage src={item.image} alt={item.name} />
                  </Link>
                  <div className={styles.siteBody}>
                    <h3>
                      <Link href={`/servicios/${item.id}`}>{item.name}</Link>
                    </h3>
                    {item.site && <p>{item.site}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {destination.mapsEmbedUrl && (
          <section>
            <div className={styles.heading}>
              <div>
                <h2>Ubicación</h2>
              </div>
            </div>
            <iframe
              className={styles.map}
              src={destination.mapsEmbedUrl}
              title={`Mapa de ${destination.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        )}
      </div>
    </main>
  );
}
