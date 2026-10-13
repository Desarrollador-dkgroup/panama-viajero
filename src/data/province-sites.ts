export type ProvinceDetails = {
  name: string;
  description: string;
  image: string;
};

// Define la información editorial de las provincias; los sitios se consultan en Supabase.
export const provinceDetails: Record<string, ProvinceDetails> = {
  bocas: {
    name: "Bocas del Toro",
    description: "Playas caribeñas, naturaleza salvaje y experiencias entre islas.",
    image: "bocas-del-toro.jpg",
  },
  cocle: {
    name: "Coclé",
    description: "Playas, montañas y pueblos llenos de tradición.",
    image: "el-valle.jpg",
  },
  colon: {
    name: "Colón",
    description: "Historia, selva y costas del Caribe panameño.",
    image: "portobelo.jpg",
  },
};

// Devuelve contenido provisional para provincias que aún esperan información editorial.
export function getProvinceDetails(slug: string): ProvinceDetails {
  return (
    provinceDetails[slug] ?? {
      name: "Panamá",
      description: "Descubre paisajes, cultura y experiencias únicas.",
      image: "ciudad-de-panama.jpg",
    }
  );
}
