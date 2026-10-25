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

## Flujo de ramas

- `main` es producción. `fusion` es la rama de trabajo e integración.
- Todo cambio se hace en `fusion`, se verifica (`tsc` y `eslint`) y se pasa a `main`
  directamente, sin preguntar (decisión del usuario, 2026-10-22).
- Cuando `feat/merchant-dashboard`, `feat/merchant-panel` u otra rama de colaboradores
  reciba cambios: traerlos a `fusion` con merge, resolver conflictos, verificar con `tsc`
  y `eslint`, revisar si traen migraciones (no se aplican solas) y solo entonces pasar
  `fusion` a `main`. Avisar al usuario si traen migraciones o cambian su flujo.
- Nunca reescribir historia de `main` ni de ramas de otros (sin rebase ni force-push).

## Reglas de trabajo

- Trabajar en español. Comentarios en español. Líneas de 100 caracteres o menos.
- TypeScript sin `any`. ESLint 9 (`eslint-config-next`).
- Verificar en llamadas separadas: `timeout 170 npx tsc --noEmit -p .` y
  `timeout 170 npx eslint <archivos>`.
- No escribir claves en el código ni en el chat. `.env.local` no se sube.
- Commits en español, bien explicados pero breves: un título claro y, si hace falta,
  2 a 4 líneas de qué cambia y por qué. Sin listas largas ni detalles de más.
- Base de producción: Claude aplica migraciones y SQL sin preguntar, incluido lo
  destructivo (decisión del usuario, 2026-10-22). Solo pide confirmación para cambios en
  cuentas de usuario (`auth`). Cada cambio va primero a una migración del repo y, si se
  puede, se prueba antes en una transacción con ROLLBACK.

## Proyecto

- Sitio público. Next.js 16 (App Router; `params` y `searchParams` son Promises),
  React 19, Supabase (solo lectura con la clave anónima), Tailwind 4.
- Despliegue: Cloudflare Workers con OpenNext, igual que el panel (`wrangler.jsonc`, worker
  `panama-viajero`, `@opennextjs/cloudflare` fijo en 1.20.10 por compatibilidad con Next
  16.3.8). Compilación: `npx opennextjs-cloudflare build`; despliegue: `npx wrangler deploy`.
  Las variables públicas de Supabase están en `wrangler.jsonc` (`vars`) y deben estar también
  como variables de compilación en Cloudflare. Cambios en el despliegue: confirmar con el
  usuario.
- En esta computadora (8 GB) la compilación completa puede quedarse sin memoria; para
  probarla: `NEXT_PRIVATE_STANDALONE=true npx next build --webpack` y luego
  `npx opennextjs-cloudflare build --skipNextBuild`.
- Comparte la base de Supabase con `pv_admin` (proyecto `qqhcsacdffdxcbkzgulk`).
- Las migraciones y `src/types/content.ts` vienen de `pv_admin` (`npm run sync:content`
  allí). No editar esas copias aquí directamente.

## Mapa del código

- Catálogo: `src/app/api/services/route.ts`, `src/lib/use-published-services.ts`.
- Detalle de servicio: `src/lib/service-details.ts`, `src/components/service-detail.tsx`.
- Sitios turísticos: `src/lib/tourist-sites.ts`, `src/lib/tourist-site-services.ts`.
- Cliente Supabase: `src/lib/supabase.ts`.
