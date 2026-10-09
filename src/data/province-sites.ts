export type ProvinceSite = {
  name: string;
  description: string;
  image: string;
};

export type ProvinceDetails = {
  name: string;
  description: string;
  image: string;
  sites: ProvinceSite[];
};

// Mantiene los sitios turísticos separados para facilitar su reemplazo posterior.
export const provinceDetails: Record<string, ProvinceDetails> = {
  bocas: {
    name: "Bocas del Toro",
    description: "Playas caribeñas, naturaleza salvaje y experiencias entre islas.",
    image: "bocas-del-toro.jpg",
    sites: [
      { name: "Isla Bastimentos", description: "Playas vírgenes y cultura auténtica del Caribe panameño.", image: "bocas-del-toro.jpg" },
      { name: "Bahía de los Delfines", description: "Un santuario de aguas tranquilas rodeado de manglares.", image: "bocas-del-toro.jpg" },
      { name: "Parque Nacional Marino", description: "Arrecifes, selva tropical y aventuras inolvidables.", image: "bocas-del-toro.jpg" },
    ],
  },
  cocle: {
    name: "Coclé", description: "Playas, montañas y pueblos llenos de tradición.", image: "el-valle.jpg",
    sites: [
      { name: "El Valle de Antón", description: "Un cráter volcánico con senderos, cascadas y clima fresco.", image: "el-valle.jpg" },
      { name: "Playa Blanca", description: "Arena clara y aguas cálidas para desconectarte.", image: "el-valle.jpg" },
      { name: "La India Dormida", description: "Una caminata con vistas únicas sobre el valle.", image: "el-valle.jpg" },
    ],
  },
  colon: {
    name: "Colón", description: "Historia, selva y costas del Caribe panameño.", image: "portobelo.jpg",
    sites: [
      { name: "Portobelo", description: "Fortalezas coloniales y relatos que viven frente al mar.", image: "portobelo.jpg" },
      { name: "Isla Grande", description: "Una escapada caribeña de aguas turquesas y palmeras.", image: "portobelo.jpg" },
      { name: "Fuerte San Lorenzo", description: "Naturaleza e historia en la entrada del río Chagres.", image: "portobelo.jpg" },
    ],
  },
};

// Devuelve contenido provisional para provincias que aún esperan información editorial.
export function getProvinceDetails(slug: string): ProvinceDetails {
  return provinceDetails[slug] ?? {
    name: "Panamá",
    description: "Descubre paisajes, cultura y experiencias únicas.",
    image: "ciudad-de-panama.jpg",
    sites: [
      { name: "Sitio turístico por descubrir", description: "Próximamente encontrarás aquí una nueva experiencia.", image: "ciudad-de-panama.jpg" },
      { name: "Experiencia panameña", description: "Un lugar preparado para tu próxima aventura.", image: "ciudad-de-panama.jpg" },
      { name: "Rincón de Panamá", description: "Naturaleza, cultura y momentos para recordar.", image: "ciudad-de-panama.jpg" },
    ],
  };
}
