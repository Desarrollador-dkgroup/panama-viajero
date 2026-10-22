export type CatalogCategory =
  "alojamientos" | "restaurantes" | "actividades" | "transporte" | "tours" | "promociones";

// Define las opciones de filtros de cada categoría
export const catalogConfig = {
  alojamientos: {
    title: "Alojamientos",
    folder: "Alojamientos",
    unit: "noche",
    subtitle: "Playas, montañas, cultura y experiencias inolvidables.",
    typeLabel: "Tipo de alojamiento",
    // Coinciden con hospedaje_types en Supabase, que es lo que elige el panel.
    types: [
      "Hoteles", "Resorts", "Cabañas", "Apartamentos", "Campings", "Casas rurales",
      "Eco lodges", "Casas de playa",
    ],
    amenities: ["Wi-Fi", "Desayuno incluido", "Piscina", "Pet friendly"],
  },
  restaurantes: {
    title: "Restaurantes",
    folder: "Restaurantes",
    unit: "persona",
    subtitle: "Sabores que conectan con nuestra cultura.",
    typeLabel: "Tipo de cocina",
    types: ["Panameña", "Mariscos", "Internacional", "Cafetería"],
    amenities: ["Terraza", "Opciones vegetarianas", "Estacionamiento", "Pet friendly"],
  },
  actividades: {
    title: "Actividades",
    folder: "Actividades",
    unit: "persona",
    subtitle: "Vive experiencias que recordarás siempre.",
    typeLabel: "Tipo de actividad",
    types: ["Aventura", "Cultura", "Naturaleza", "Acuática"],
    amenities: ["Guía incluido", "Equipo incluido", "Para familias", "Transporte incluido"],
  },
  transporte: {
    title: "Transporte",
    folder: "Transporte",
    unit: "viaje",
    subtitle: "Encuentra cómo llegar a tu próxima aventura.",
    typeLabel: "Tipo de transporte",
    types: ["Traslado", "Lancha", "Privado", "Compartido"],
    amenities: ["Aire acondicionado", "Equipaje incluido", "Reserva previa", "Accesible"],
  },
  tours: {
    title: "Tours",
    folder: "Tours",
    unit: "persona",
    subtitle: "Recorre Panamá con una nueva perspectiva.",
    typeLabel: "Tipo de tour",
    types: ["Cultural", "Naturaleza", "Islas", "Gastronómico"],
    amenities: ["Guía incluido", "Transporte incluido", "Para familias", "Comida incluida"],
  },
  promociones: {
    title: "Promociones",
    folder: "Promociones",
    unit: "persona",
    subtitle: "Descubre opciones para tu próxima escapada.",
    typeLabel: "Tipo de promoción",
    types: ["Hospedaje", "Gastronomía", "Experiencias", "Tours"],
    amenities: ["Reserva previa", "Para parejas", "Para familias", "Fin de semana"],
  },
};

// Incluye todas las regiones para permitir resultados vacíos reales
export const provinceOptions = [
  "Panamá",
  "Panamá Oeste",
  "Chiriquí",
  "Veraguas",
  "Bocas del Toro",
  "Coclé",
  "Colón",
  "Herrera",
  "Los Santos",
  "Darién",
  "Guna Yala",
];
export const environmentOptions = ["Playa", "Montaña", "Ciudad", "Rural"];

// Define los datos del catálogo obtenidos desde Supabase.
export type CatalogService = {
  id: string;
  slug: string;
  name: string;
  location: string;
  searchText: string;
  province: string;
  price: number;
  rating: string;
  image: string;
  imagePath: string;
  type: string;
  amenities: string[];
  environment: string;
};
