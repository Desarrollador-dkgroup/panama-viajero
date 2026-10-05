import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { LegalButton } from "@/components/legal-button";

// Presenta la identidad, el contacto y las redes de la marca
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Image src="/Logo-rectangular-blanco.svg" width={250} height={80}
              alt="Panamá Viajero" className="footer-logo" />
            <p className="footer-tagline">¡Descubre el Panamá que nadie te muestra!</p>
          </div>
          <div className="footer-contact">
            <p className="social-title">¡SÍGUENOS EN NUESTRAS REDES!</p>
            {/* Abre los perfiles oficiales en una nueva pestaña */}
            <nav className="social-icons" aria-label="Redes sociales">
              <a
                href="https://www.instagram.com/panamaviajero.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Panamá Viajero (nueva pestaña)"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              <a
                href="https://www.tiktok.com/@panamaviajero.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de Panamá Viajero (nueva pestaña)"
              >
                <FaTiktok aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/share/19NAmdDfxk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Panamá Viajero (nueva pestaña)"
              >
                <FaFacebookF aria-hidden="true" />
              </a>
            </nav>
            <p>Contacto: <a href="mailto:hola@panamaviajero.app">hola@panamaviajero.app</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 <strong>Panamá Viajero.</strong></p>
          <span className="footer-dot">•</span>
          {/* Mantiene los accesos legales deshabilitados hasta publicar su contenido */}
          <LegalButton href="/politica-de-privacidad">Política de Privacidad</LegalButton>
          <LegalButton href="/terminos-y-condiciones">Términos y condiciones</LegalButton>
          <p className="developer-credit">
            Desarrollado por
            <Image
              src="/DMarketing.svg"
              width={126}
              height={28}
              alt="Davis Marketing"
              className="developer-logo"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
