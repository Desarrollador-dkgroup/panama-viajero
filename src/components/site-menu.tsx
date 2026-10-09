"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MouseEvent } from "react";
import { ArrowUpRight, LogOut, Menu, Settings, ShieldCheck, UserCircle, X } from "lucide-react";

// Comparte las rutas entre las versiones de escritorio y móvil
const links = [
  { label: "Inicio", href: "/" },
  { label: "Destinos", href: "/destinos" },
  { label: "Promociones", href: "/promociones" },
  { label: "Favoritos", href: "/#favoritos" },
];

// Define las opciones disponibles en el menú del perfil
const profileLinks = [
  { label: "Mi perfil", href: "/perfil", icon: UserCircle },
  { label: "Seguridad", href: "/perfil/seguridad", icon: ShieldCheck },
  { label: "Configuración", href: "/perfil/configuracion", icon: Settings },
];

// Sincroniza la selección del menú con el fragmento y el historial del navegador
function subscribeToSection(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
  };
}

const getSection = () => window.location.hash;
const getServerSection = () => "";

// Presenta la navegación y los controles de cuenta
export function SiteMenu() {
  // Obtiene la ruta y la sección para identificar el enlace seleccionado
  const pathname = usePathname();
  const section = useSyncExternalStore(subscribeToSection, getSection, getServerSection);
  const selectedHref = section === "#experiencias" || section === "#favoritos"
    ? `/${section}`
    : section ? "/alojamientos" : "/";

  // Identifica las páginas de catálogo sin alterar la apariencia del menú
  const isSelected = (href: string) => {
    if (pathname === "/") return selectedHref === href;
    return href === "/destinos" && [
      "/destinos",
      "/alojamientos", "/restaurantes", "/actividades", "/transporte", "/tours", "/promociones",
    ].includes(pathname);
  };
  // Controla ambos desplegables y conserva sus elementos de referencia
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const profileButton = useRef<HTMLButtonElement>(null);

  // Cierra el perfil al pulsar fuera del desplegable o presionar Escape
  useEffect(() => {
    if (!profileOpen) return;

    const outside = (event: PointerEvent) => {
      if (!account.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButton.current?.focus();
      }
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [profileOpen]);

  // Bloquea el fondo y mantiene el teclado dentro del menú móvil abierto
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key !== "Tab") return;

      const elements = [
        menuButton.current,
        ...Array.from(drawer.current?.querySelectorAll<HTMLElement>("a, button:enabled") ?? []),
      ].filter((element): element is HTMLElement => element !== null);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    const breakpoint = window.matchMedia("(min-width: 641px)");
    const resize = () => {
      if (breakpoint.matches) setOpen(false);
    };
    document.addEventListener("keydown", keyboard);
    breakpoint.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyboard);
      breakpoint.removeEventListener("change", resize);
    };
  }, [open]);

  // Cierra los desplegables al navegar
  const closeMenus = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  // Desplaza suavemente la portada sin recargarla y conserva los enlaces normales
  const navigateSection = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMenus();
    const isHomeSection = href === "/" || href.startsWith("/#");
    if (pathname !== "/" || !isHomeSection
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    window.history.pushState(null, "", href);
    window.dispatchEvent(new Event("hashchange"));

    // Espera a que el menú móvil libere el desplazamiento del fondo
    requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior = reduced ? "instant" : "smooth";
      const id = href.split("#")[1];
      if (id) document.getElementById(id)?.scrollIntoView({ behavior });
      else window.scrollTo({ top: 0, behavior });
    });
  };

  return (
    <header className="site-header">
      <div className="container menu-bar">
        <Link href="/" aria-label="Panamá Viajero, inicio" onClick={closeMenus}>
          <Image src="/Logo-rectangular.svg" width={158} height={50}
            alt="Panamá Viajero" className="desktop-logo" />
          <Image src="/Logo.svg" width={42} height={42}
            alt="Panamá Viajero" className="mobile-logo" />
        </Link>
        <nav aria-label="Navegación principal" className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={isSelected(link.href) ? "active" : ""}
              aria-current={isSelected(link.href) ? "location" : undefined}
              onClick={(event) => navigateSection(event, link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div ref={account} className="account-menu">
          <button ref={profileButton} className="account-label"
            aria-label="Abrir opciones de perfil" aria-expanded={profileOpen}
            aria-controls="opciones-perfil" onClick={() => setProfileOpen(!profileOpen)}>
            <span className="account-greeting">Hola, Ariel</span><UserCircle size={29} />
          </button>
          {profileOpen && (
            <nav id="opciones-perfil" className="profile-dropdown" aria-label="Opciones de perfil">
              {profileLinks.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} onClick={closeMenus}>
                  <Icon size={18} />{label}
                </Link>
              ))}
              {/* Reserva el cierre de sesión hasta integrar la autenticación */}
              <button className="logout-button" disabled
                title="Disponible al conectar la autenticación">
                <LogOut size={18} />Cerrar sesión
              </button>
            </nav>
          )}
        </div>
        <button ref={menuButton} className="menu-toggle"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open} aria-controls="menu-movil" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {/* Conserva el panel montado para animar tanto su entrada como su salida */}
      <div ref={drawer} id="menu-movil" className={`mobile-sheet ${open ? "is-open" : ""}`}
        inert={!open} aria-hidden={!open}>
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={isSelected(link.href) ? "active" : ""}
              aria-current={isSelected(link.href) ? "location" : undefined}
              onClick={(event) => navigateSection(event, link.href)}
            >
              {link.label}<ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="mobile-account">
          <Link href="/perfil" onClick={closeMenus} className="mobile-profile">
            <UserCircle size={36} />
            <span><strong>Hola, Ariel</strong><small>Mi perfil</small></span>
          </Link>
          <button className="logout-button" disabled
            title="Disponible al conectar la autenticación">
            <LogOut size={19} />Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
