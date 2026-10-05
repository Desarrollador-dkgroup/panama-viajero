import Link from "next/link";

// Comparte los accesos a las páginas de cuenta
export function AccountPage({ title }: { title: string }) {
  return (
    <main id="contenido" className="container account-page">
      <nav className="account-tabs" aria-label="Secciones de cuenta">
        <Link href="/perfil">Mi perfil</Link>
        <Link href="/perfil/seguridad">Seguridad</Link>
        <Link href="/perfil/configuracion">Configuración</Link>
      </nav>
      <h1>{title}</h1>
      <p>La gestión de la cuenta estará disponible al conectar la autenticación.</p>
    </main>
  );
}
