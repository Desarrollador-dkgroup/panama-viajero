@AGENTS.md

# Panamá Viajero: sitio público (panama-viajero)

Este archivo es la memoria compartida entre las sesiones de Claude en local y en la nube.
La bitácora del proyecto completo está en el repo del panel: `pv_admin/docs/PROGRESO.md`.

## Sincronización local y nube (OBLIGATORIO)

El usuario trabaja en dos sitios: en su computadora (local) y en la nube (GitHub).
Ambos deben estar siempre iguales. Reglas estrictas:

1. **Al empezar cualquier sesión**: `git fetch origin`, comparar la rama de trabajo con
   `origin/main` y con su remota, e informar si hay commits sin traer o sin subir.
   Leer la bitácora (`pv_admin/docs/PROGRESO.md`; si ese repo no está en la sesión,
   leerla desde GitHub) antes de cambiar nada.
2. **Al terminar**: actualizar la bitácora, hacer commit y push en ambos repos.
3. **Recordar siempre al usuario**, al inicio y al final de cada tarea, que sincronice:
   push donde trabajó y pull en el otro lado antes de seguir. No omitir este aviso.
4. Si local y nube divergen, detenerse y avisar antes de seguir trabajando.
5. Rama de trabajo única: `fusion`, tanto en local como en la nube. No crear otras ramas
   sin que el usuario lo pida.
6. Lo que solo se dice en el chat no existe para la otra sesión: si es una decisión,
   se escribe aquí o en la bitácora.

## Reglas de trabajo

- Trabajar en español. Comentarios en español. Líneas de 100 caracteres o menos.
- TypeScript sin `any`. ESLint 9 (`eslint-config-next`).
- Verificar en llamadas separadas: `timeout 170 npx tsc --noEmit -p .` y
  `timeout 170 npx eslint <archivos>`.
- No escribir claves en el código ni en el chat. `.env.local` no se sube.
- Commits en español, bien explicados pero breves: un título claro y, si hace falta,
  2 a 4 líneas de qué cambia y por qué. Sin listas largas ni detalles de más.
- No modificar la base de producción sin confirmación explícita del usuario.

## Proyecto

- Sitio público. Next.js 16 (App Router; `params` y `searchParams` son Promises),
  React 19, Supabase (solo lectura con la clave anónima), Tailwind 4.
- Despliegue en Cloudflare. El repo no tiene `wrangler` ni OpenNext: el despliegue se
  configura desde el panel de Cloudflare (confirmar con el usuario antes de tocarlo).
- Comparte la base de Supabase con `pv_admin` (proyecto `qqhcsacdffdxcbkzgulk`).
- Las migraciones y `src/types/content.ts` vienen de `pv_admin` (`npm run sync:content`
  allí). No editar esas copias aquí directamente.

## Mapa del código

- Catálogo: `src/app/api/services/route.ts`, `src/lib/use-published-services.ts`.
- Detalle de servicio: `src/lib/service-details.ts`, `src/components/service-detail.tsx`.
- Sitios turísticos: `src/lib/tourist-sites.ts`, `src/lib/tourist-site-services.ts`.
- Cliente Supabase: `src/lib/supabase.ts`.
