import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { CatalogImage } from "@/components/home-content";
import { getProvinceDetails } from "@/data/province-sites";
import { getTouristSites } from "@/lib/tourist-sites";
import styles from "./province-page.module.css";

// Presenta una provincia con sus sitios turísticos recomendados.
export async function ProvincePage({ slug }: { slug: string }) {
  const province = getProvinceDetails(slug);
  const databaseSites = await getTouristSites(slug);
  const sites = databaseSites.length ? databaseSites : province.sites;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src={`/P-Principal/Destinos/${province.image}`} alt={province.name} fill priority />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link href="/destinos" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver a destinos
          </Link>
          <p>DESTINO · PANAMÁ</p>
          <h1>{province.name}</h1>
          <span>{province.description}</span>
        </div>
      </section>
      <div className={styles.content}>
        <div className={styles.heading}>
          <div><p>EXPLORA {province.name.toUpperCase()}</p><h2>Sitios turísticos</h2></div>
          <span><MapPin size={18} /> Panamá</span>
        </div>
        <section className={styles.siteGrid} aria-label={`Sitios turísticos de ${province.name}`}>
          {sites.map((site) => (
            <article key={"slug" in site ? site.slug : site.name} className={styles.siteCard}>
              <Link href={`/sitios-turisticos/${"slug" in site ? site.slug : site.name}`}
                className={styles.siteImageLink}>
                <CatalogImage
                  src={"photoPath" in site ? site.photoPath : `/P-Principal/Destinos/${site.image}`}
                  alt={site.name}
                />
              </Link>
              <div className={styles.siteBody}>
                <h3>{site.name}</h3>
                <p>{"shortDescription" in site ? site.shortDescription : site.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
