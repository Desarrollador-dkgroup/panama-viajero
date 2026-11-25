import type { IconType } from "react-icons";
import { FaUmbrellaBeach } from "react-icons/fa6";
import { IoBoat } from "react-icons/io5";
import {
  LuBike, LuBinoculars, LuBird, LuCamera, LuCompass, LuFish, LuMapPinned, LuMountain,
  LuShipWheel, LuSparkles, LuTreePalm, LuTrees, LuUtensilsCrossed, LuWaves,
} from "react-icons/lu";

// Icono de una actividad según su nombre. Son las mismas reglas que usa la guía
// (Panama_Viajero, activityIcons.js) para que ambas webs muestren el mismo icono.
const RULES: { test: RegExp; Icon: IconType }[] = [
  { test: /(playa|playas)/, Icon: FaUmbrellaBeach },
  { test: /(aguas?\s*termales?|termales?|termal)/, Icon: LuWaves },
  { test: /(nataci|nado|nadar|swim|surf|snorkel|buce|kayak|mar|arrecife)/, Icon: LuWaves },
  { test: /(paseo(?:s)? en lancha|lancha|bote|boat)/, Icon: IoBoat },
  { test: /(pesca)/, Icon: LuFish },
  { test: /(ciclismo|patinaje|ruta|bicicleta)/, Icon: LuBike },
  { test: /(gastron|comida|restaur|sabores|culin)/, Icon: LuUtensilsCrossed },
  { test: /(senderismo|monta|trek)/, Icon: LuMountain },
  { test: /(bosque|naturaleza|parque)/, Icon: LuTrees },
  { test: /(estrella|estrellas)/, Icon: LuSparkles },
  { test: /(avistamiento|observaci).*(rana|ranas).*(roja|rojas)/, Icon: LuCamera },
  { test: /(avistamiento|observaci).*(delfin|delfines)/, Icon: LuBinoculars },
  { test: /(avistamiento|observaci).*(ballena|tortuga|marin|medusa|pez|peces)/, Icon: LuWaves },
  { test: /(avistamiento|observaci).*(coral|arrecife|manta|raya|manglar)/, Icon: LuWaves },
  { test: /(avistamiento|observaci|aves|pajar)/, Icon: LuBird },
  { test: /(tour|recorrido|museo|hist|casco|ciudad|urbano|paseo|visitas)/, Icon: LuMapPinned },
  { test: /(isla|islote)/, Icon: LuTreePalm },
  { test: /(costa|costera|marino)/, Icon: LuShipWheel },
  { test: /(fotograf|paisaje|foto|mirador)/, Icon: LuCamera },
];

export function activityIcon(name: string): IconType {
  const normalized = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return RULES.find(({ test }) => test.test(normalized))?.Icon ?? LuCompass;
}
