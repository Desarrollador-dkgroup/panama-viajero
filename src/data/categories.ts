import { Bus, Hotel, MapPin, Megaphone, Mountain, Utensils } from "lucide-react";

// Comparte las seis categorías y sus destinos entre la portada y el catálogo
export const categories = [
  { name: "Hospedaje", icon: Hotel, href: "/alojamientos" },
  { name: "Restaurantes", icon: Utensils, href: "/restaurantes" },
  { name: "Actividades", icon: Mountain, href: "/actividades" },
  { name: "Transporte", icon: Bus, href: "/transporte" },
  { name: "Tours", icon: MapPin, href: "/tours" },
  { name: "Promociones", icon: Megaphone, href: "/promociones" },
];
