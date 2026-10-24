"use client";

import Image from "next/image";
import Link from "next/link";
import { IoNotificationsOutline, IoSearch } from "react-icons/io5";
import { useAuthSession } from "@/lib/auth-session";
import styles from "./home.module.css";

export const SEARCH_PLACEHOLDER = "Busca destinos, hospedajes o experiencias";

// Cabecera con foto de la portada (src/components/home/home-header.tsx de la app): logo,
// saludo con el nombre real de la sesión, campana sin avisos falsos, título y buscador.
export function HomeHeader() {
  const session = useAuthSession();
  const name = session.status === "signedIn" ? session.profile?.displayName : undefined;

  return (
    <section className={styles.header}>
      <Image
        src="/app/home/header-beach.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.headerPhoto}
      />
      <div className={styles.headerScrim} aria-hidden />
      <div className={styles.headerFade} aria-hidden />

      <div className={styles.headerContent}>
        <div className={styles.topRow}>
          <div className={styles.logoRow}>
            <Image src="/app/brand/icon.png" alt="" width={40} height={40} />
            <Image
              src="/app/brand/wordmark-transparent.png"
              alt="Panamá Viajero"
              width={82}
              height={40}
            />
          </div>
          <div className={styles.accountRow}>
            <span className={styles.greeting}>{name ? `Hola, ${name}` : "Hola,"}</span>
            <button
              type="button"
              className={styles.bell}
              aria-label="Notificaciones"
              onClick={() => window.alert("No tienes notificaciones por el momento.")}
            >
              <IoNotificationsOutline size={20} color="#FFFFFF" aria-hidden />
            </button>
          </div>
        </div>

        <div className={styles.titleBlock}>
          <div className={styles.titleScrim} aria-hidden />
          <h1 className={styles.title}>
            ¿Qué quieres descubrir
            <br />
            en Panamá?
          </h1>
        </div>

        <Link href="/buscar" className={styles.searchBar}>
          <IoSearch size={20} color="var(--indigo)" aria-hidden />
          <span>{SEARCH_PLACEHOLDER}</span>
        </Link>
      </div>
    </section>
  );
}
