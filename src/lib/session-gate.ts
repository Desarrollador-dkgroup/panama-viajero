// Acceso de visitantes: sin sesión se pide iniciar sesión, salvo que elijan seguir como invitados.
const GUEST_KEY = "pv-guest-browsing";

const ACCESS_ROUTES = [
  "/cuenta/ingresar",
  "/cuenta/registro",
  "/cuenta/recuperar",
  "/cuenta/confirmar",
  "/cuenta/nueva-contrasena",
  "/cuenta/cambiar-contrasena",
];

export function isAccessRoute(pathname: string) {
  return ACCESS_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function loginHref(next: string) {
  return `/cuenta/ingresar?next=${encodeURIComponent(next)}`;
}

export function isGuestBrowsing() {
  try {
    return sessionStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

export function continueAsGuest() {
  try {
    sessionStorage.setItem(GUEST_KEY, "1");
  } catch {
    // Sin almacenamiento, el visitante verá la pantalla de acceso otra vez al cambiar de página.
  }
}
