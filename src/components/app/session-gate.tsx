"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/lib/auth-session";
import { isAccessRoute, isGuestBrowsing, loginHref } from "@/lib/session-gate";

// Al abrir la app, sin sesión y sin haber elegido seguir como invitado, muestra el acceso.
export function SessionGate() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { status } = useAuthSession();

  useEffect(() => {
    if (status !== "signedOut" || isAccessRoute(pathname) || isGuestBrowsing()) return;
    router.replace(loginHref(`${pathname}${window.location.search}`));
  }, [status, pathname, router]);

  return null;
}
