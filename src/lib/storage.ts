// Convierte una ruta de Supabase Storage en una URL pública. El panel guarda las fotos de
// servicios como rutas dentro del bucket público `service-media`; las de sitios y destinos
// ya se guardan como URL completas y no pasan por aquí.
export function publicMediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/service-media/${path}`;
}
