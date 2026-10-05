import { activities, restaurants, stays } from "@/data/home";

export type CatalogCategory =
  | "alojamientos"
  | "restaurantes"
  | "actividades"
  | "transporte"
  | "tours"
  | "promociones";

// Define las opciones de filtros de cada categoría
export const catalogConfig = {
  alojamientos: {
    title: "Alojamientos", folder: "Alojamientos", unit: "noche",
    subtitle: "Playas, montañas, cultura y experiencias inolvidables.",
    typeLabel: "Tipo de alojamiento", types: ["Hotel", "Cabaña", "Apartamento", "Resort"],
    amenities: ["Wi-Fi", "Desayuno incluido", "Piscina", "Pet friendly"],
  },
  restaurantes: {
    title: "Restaurantes", folder: "Restaurantes", unit: "persona",
    subtitle: "Sabores que conectan con nuestra cultura.",
    typeLabel: "Tipo de cocina", types: ["Panameña", "Mariscos", "Internacional", "Cafetería"],
    amenities: ["Terraza", "Opciones vegetarianas", "Estacionamiento", "Pet friendly"],
  },
  actividades: {
    title: "Actividades", folder: "Actividades", unit: "persona",
    subtitle: "Vive experiencias que recordarás siempre.",
    typeLabel: "Tipo de actividad", types: ["Aventura", "Cultura", "Naturaleza", "Acuática"],
    amenities: ["Guía incluido", "Equipo incluido", "Para familias", "Transporte incluido"],
  },
  transporte: {
    title: "Transporte", folder: "Transporte", unit: "viaje",
    subtitle: "Encuentra cómo llegar a tu próxima aventura.",
    typeLabel: "Tipo de transporte", types: ["Traslado", "Lancha", "Privado", "Compartido"],
    amenities: ["Aire acondicionado", "Equipaje incluido", "Reserva previa", "Accesible"],
  },
  tours: {
    title: "Tours", folder: "Tours", unit: "persona",
    subtitle: "Recorre Panamá con una nueva perspectiva.",
    typeLabel: "Tipo de tour", types: ["Cultural", "Naturaleza", "Islas", "Gastronómico"],
    amenities: ["Guía incluido", "Transporte incluido", "Para familias", "Comida incluida"],
  },
  promociones: {
    title: "Promociones", folder: "Promociones", unit: "persona",
    subtitle: "Descubre opciones para tu próxima escapada.",
    typeLabel: "Tipo de promoción", types: ["Hospedaje", "Gastronomía", "Experiencias", "Tours"],
    amenities: ["Reserva previa", "Para parejas", "Para familias", "Fin de semana"],
  },
};

// Relaciona las ubicaciones del catálogo de demostración con sus provincias
const provinces: Record<string, string> = {
  "Bocas del Toro": "Bocas del Toro",
  "El Valle de Antón": "Coclé",
  "Boquete": "Chiriquí",
  "Tierras Altas": "Chiriquí",
  "Santa Catalina": "Veraguas",
  "Pedasí": "Los Santos",
  "Portobelo": "Colón",
  "Ciudad de Panamá": "Panamá",
  "Isla Taboga": "Panamá",
  "San Blas": "Guna Yala",
};

// Incluye todas las regiones para permitir resultados vacíos reales
export const provinceOptions = [
  "Panamá", "Panamá Oeste", "Chiriquí", "Veraguas", "Bocas del Toro", "Coclé",
  "Colón", "Herrera", "Los Santos", "Darién", "Guna Yala",
];
export const environmentOptions = ["Playa", "Montaña", "Ciudad", "Rural"];

// Crea servicios de demostración para las categorías todavía sin datos propios
const extraCatalog = {
  transporte: activities.map((item, index) => ({
    ...item,
    name: `Traslado a ${item.location}`,
    price: 20 + index * 8,
    image: `transporte-${index + 1}.jpg`,
  })),
  tours: activities.map((item) => ({ ...item, name: `Tour: ${item.name}` })),
  promociones: stays.map((item) => ({
    ...item,
    name: `Escapada: ${item.name}`,
    price: Math.round(item.price * 0.8),
  })),
};

// Enriquece los datos de ejemplo con atributos para probar los filtros
export function getCatalog(category: CatalogCategory) {
  const collections = { alojamientos: stays, restaurantes: restaurants,
    actividades: activities, ...extraCatalog };
  const config = catalogConfig[category];

  return collections[category].map((item, index) => ({
    ...item,
    id: `${category}-${index}`,
    province: provinces[item.location] ?? "Panamá",
    type: config.types[index % config.types.length],
    amenities: config.amenities.filter((_, position) => (index + position) % 2 === 0),
    environment: ["Boquete", "Tierras Altas", "El Valle de Antón"].includes(item.location)
      ? "Montaña" : item.location === "Ciudad de Panamá" ? "Ciudad" : "Playa",
    imagePath: category === "tours"
      ? `/P-Principal/Actividades/${item.image}`
      : category === "promociones"
        ? `/P-Principal/Alojamientos/${item.image}`
        : `/P-Principal/${config.folder}/${item.image}`,
  }));
}

export type CatalogService = ReturnType<typeof getCatalog>[number];
