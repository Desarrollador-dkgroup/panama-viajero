"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  IoBriefcase,
  IoBriefcaseOutline,
  IoHome,
  IoHomeOutline,
  IoPerson,
  IoPersonOutline,
  IoSearch,
  IoSearchOutline,
} from "react-icons/io5";
import styles from "./app-shell.module.css";

type Tab = { href: string; label: string; icon: IconType; activeIcon: IconType };

// Las cuatro pestañas de la app (src/components/app-tabs.tsx): activa índigo, inactiva coral.
const TABS: Tab[] = [
  { href: "/", label: "Inicio", icon: IoHomeOutline, activeIcon: IoHome },
  { href: "/buscar", label: "Buscar", icon: IoSearchOutline, activeIcon: IoSearch },
  { href: "/mis-viajes", label: "Mis viajes", icon: IoBriefcaseOutline, activeIcon: IoBriefcase },
  { href: "/cuenta", label: "Cuenta", icon: IoPersonOutline, activeIcon: IoPerson },
];

// En la app, las fichas y los flujos de reserva tapan la barra; las pestañas y las
// categorías la dejan visible.
function showsTabBar(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/buscar") ||
    pathname.startsWith("/categoria/") ||
    pathname === "/mis-viajes" ||
    pathname === "/cuenta"
  );
}

function isActive(tab: Tab, pathname: string) {
  if (tab.href === "/") return pathname === "/" || pathname.startsWith("/categoria/");
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

// Marco común: barra superior en escritorio y barra inferior de pestañas en celular y tableta.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const withTabs = showsTabBar(pathname);

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.logo} aria-label="Panamá Viajero, inicio">
            <Image
              src="/app/brand/logotype-positivo.png"
              alt="Panamá Viajero"
              width={1600}
              height={598}
              className={styles.logoImage}
              priority
            />
          </Link>
          <nav className={styles.topNav} aria-label="Principal">
            {TABS.map((tab) => {
              const active = isActive(tab, pathname);
              const Icon = active ? tab.activeIcon : tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`${styles.topLink} ${active ? styles.topLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={20} aria-hidden />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="contenido" className={`${styles.main} ${withTabs ? styles.mainWithTabs : ""}`}>
        {children}
      </main>

      {withTabs && (
        <nav className={styles.tabBar} aria-label="Pestañas">
          {TABS.map((tab) => {
            const active = isActive(tab, pathname);
            const Icon = active ? tab.activeIcon : tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={24} aria-hidden />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
