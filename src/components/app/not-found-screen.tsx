import { BackButton } from "@/components/app/back-button";
import styles from "./catalog-status.module.css";

// Pantalla de "no encontrado" de la app: volver y un texto gris.
export function NotFoundScreen({ message }: { message: string }) {
  return (
    <div className={styles.notFound}>
      <BackButton />
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
}
