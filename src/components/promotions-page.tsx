"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Filter, Search, Tag } from "lucide-react";
import { SiteBanner } from "@/components/site-banner";
import type { PromotionRecord } from "@/lib/promotions";
import styles from "./promotions-page.module.css";

type PromotionTab = "todas" | "hospedajes" | "restaurantes" | "actividades" |
  "transporte" | "tours";

type PromotionsPageProps = { promotions: PromotionRecord[] };

const tabs: { id: PromotionTab; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "hospedajes", label: "Hospedajes" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "actividades", label: "Actividades" },
  { id: "transporte", label: "Transporte" },
  { id: "tours", label: "Tours" },
];

// Usa imágenes locales mientras las rutas de Storage no sean públicas.
const imageSource = (path: string) => (
  path.startsWith("/") || path.startsWith("http")
    ? path
    : "/P-Principal/Banner.png"
);

// Relaciona el tipo de destino de la promoción con una sección visual.
const sectionName = (kind: string) => {
  if (kind === "service") return "Ofertas recomendadas";
  if (kind === "city") return "Escapadas por ciudad";
  if (kind === "province") return "Descubre las provincias";
  return "Experiencias para descubrir";
};

// Define el dato breve que identifica cada tipo de promoción en la tarjeta.
const cardSummary = (promotion: PromotionRecord) => {
  if (promotion.offerType === "hospedajes") return "Habitación con descuento";
  if (promotion.offerType === "restaurantes") return "Menú especial";
  if (promotion.offerType === "tours") return "Experiencia guiada";
  if (promotion.offerType === "transporte") return "Traslado privado";
  return "Experiencia para descubrir";
};

// Presenta la fecha final de la promoción en un formato corto para la tarjeta.
const endDate = (value: string) => new Date(value).toLocaleDateString("es-PA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function PromotionCard({ promotion }: { promotion: PromotionRecord }) {
  return (
    <article className={styles.card}>
      <Link href={`/promociones/${promotion.slug}`} target="_blank" className={styles.cardImage}>
        <img src={imageSource(promotion.photoPath)} alt="" />
        <span className={styles.discount}>
          {promotion.discountValue} {promotion.discountSuffix}
        </span>
      </Link>
      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <span>{promotion.placeName}</span>
          <span className={styles.category}>{promotion.offerType}</span>
        </div>
        <h3>{promotion.title}</h3>
        <p className={styles.description}>{cardSummary(promotion)}</p>
        <div className={styles.tags}>
          {promotion.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className={styles.cardFooter}>
          <small><CalendarDays size={15} /> Límite: {endDate(promotion.validTo)}</small>
        </div>
      </div>
    </article>
  );
}

// Presenta filtros, promoción destacada y secciones de ofertas.
export function PromotionsPage({ promotions }: PromotionsPageProps) {
  const [tab, setTab] = useState<PromotionTab>("todas");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("todas");
  const [validity, setValidity] = useState("todas");

  const filtered = useMemo(() => promotions.filter((promotion) => {
    const text = `${promotion.title} ${promotion.placeName} ${promotion.tags.join(" ")}`;
    const matchesQuery = text.toLowerCase().includes(query.toLowerCase());
    const matchesTab = tab === "todas" || promotion.offerType === tab;
    const matchesValidity = validity === "todas"
      || (validity === "vigentes" && promotion.isActive)
      || (validity === "finalizadas" && !promotion.isActive);
    const matchesProvince = province === "todas"
      || promotion.placeName.toLowerCase().includes(province.toLowerCase());
    return matchesQuery && matchesValidity && matchesProvince && matchesTab;
  }), [promotions, query, validity, province, tab]);

  const groups = Array.from(new Set(filtered.map((item) => sectionName(item.destinationKind))));
  const featured = filtered[0];

  return (
    <>
      <SiteBanner
        eyebrow="OFERTAS · EXPERIENCIAS · PANAMÁ"
        title={<>Promociones para tu próxima aventura</>}
        description={<>Encuentra descuentos especiales en hospedajes, experiencias y más.</>}
        showSearch
        query={query}
        onQueryChange={setQuery}
      />
      <main className={`container ${styles.page}`}>
        <div className={styles.tabs} role="tablist" aria-label="Tipos de promoción">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? styles.selectedTab : ""}
              onClick={() => setTab(item.id)}
              role="tab"
              aria-selected={tab === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.layout}>
          <aside className={styles.filters}>
            <div className={styles.filterHeading}>
              <h2><Filter size={19} /> Filtrar promociones</h2>
              <button onClick={() => { setProvince("todas"); setValidity("todas"); }}>
                Limpiar
              </button>
            </div>
            <label>Buscar<input value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Destino u oferta" /></label>
            <label>Provincia<select value={province} onChange={(event) => setProvince(event.target.value)}>
              <option value="todas">Todas las provincias</option>
              <option>Panamá</option><option>Veraguas</option><option>Bocas del Toro</option>
              <option>Chiriquí</option>
            </select></label>
            <label>Vigencia<select value={validity} onChange={(event) => setValidity(event.target.value)}>
              <option value="todas">Todas</option><option value="vigentes">Vigentes</option>
              <option value="finalizadas">Finalizadas</option>
            </select></label>
            <p className={styles.filterHint}><Tag size={15} /> Las promociones se actualizan desde Supabase.</p>
          </aside>
          <section className={styles.results}>
            {featured && (
              <div className={styles.featured}>
                <div><span>OFERTA DESTACADA</span><h2>{featured.title}</h2>
                  <p>{featured.placeName} · {featured.priceLine}</p>
                  <Link href={`/promociones/${featured.slug}`} target="_blank">
                    Explorar oferta <ChevronRight size={16} />
                  </Link></div>
                <img src={imageSource(featured.photoPath)} alt="" />
              </div>
            )}
            {groups.map((group) => (
              <section key={group} className={styles.group}>
                <div className={styles.groupHeading}><h2>{group}</h2>
                  <span>{filtered.length} ofertas <Search size={15} /></span></div>
                <div className={styles.grid}>
                  {filtered.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}
                </div>
              </section>
            ))}
            {!filtered.length && <p className={styles.empty}>No hay promociones con esos filtros.</p>}
          </section>
        </div>
      </main>
    </>
  );
}









