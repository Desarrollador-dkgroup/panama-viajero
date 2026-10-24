"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  IoArrowBack,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoLogoApple,
  IoMailOutline,
  IoPersonOutline,
} from "react-icons/io5";
import {
  isValidEmail,
  isValidPassword,
  resendSignUpConfirmation,
  sendPasswordResetEmail,
  signInWithEmail,
  signUpWithEmail,
  updatePassword,
} from "@/lib/auth-actions";
import styles from "./auth.module.css";

export type AuthMode = "login" | "register" | "forgot" | "recovery" | "change-password";

const COPY: Record<AuthMode, { title: string; subtitle: string; button: string }> = {
  login: { title: "Bienvenido de nuevo", subtitle: "Inicia sesión para continuar explorando",
    button: "Iniciar sesión" },
  register: { title: "Crear cuenta", subtitle: "Guarda tu información y tus solicitudes de reserva",
    button: "Crear cuenta" },
  forgot: { title: "Recuperar contraseña",
    subtitle: "Te enviaremos un enlace a tu correo electrónico", button: "Enviar enlace" },
  recovery: { title: "Elige una nueva contraseña",
    subtitle: "Ya verificamos el enlace de tu correo. Define una contraseña nueva para tu cuenta.",
    button: "Guardar contraseña" },
  "change-password": { title: "Cambiar contraseña",
    subtitle: "Define una nueva contraseña para tu cuenta.", button: "Guardar contraseña" },
};

// Pantallas de cuenta de la app (src/components/onboarding/*-screen.tsx), sobre la foto.
export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/cuenta";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; body: string; action?: () => void } | null>(
    null);
  const copy = COPY[mode];
  const needsEmail = mode === "login" || mode === "register" || mode === "forgot";
  const needsPassword = mode !== "forgot";
  const confirmsPassword = mode === "recovery" || mode === "change-password";

  const nameError = touched && mode === "register" && name.trim().length < 2
    ? "Escribe tu nombre." : undefined;
  const emailError = touched && needsEmail && !isValidEmail(email)
    ? "Ingresa un correo electrónico válido." : undefined;
  const passwordError = touched && needsPassword && !isValidPassword(password)
    ? "La contraseña debe tener al menos 6 caracteres." : undefined;
  const confirmError = touched && confirmsPassword && confirm !== password
    ? "Las contraseñas no coinciden." : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (mode === "register" && name.trim().length < 2) return;
    if (needsEmail && !isValidEmail(email)) return;
    if (needsPassword && !isValidPassword(password)) return;
    if (confirmsPassword && confirm !== password) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (!error) return router.replace(next);
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return setNotice({
            title: "Confirma tu correo",
            body: "Todavía no confirmaste tu correo electrónico. Revisa tu bandeja de entrada o " +
              "solicita un nuevo enlace.",
            action: () => void resendSignUpConfirmation(email),
          });
        }
        return setNotice({ title: "No pudimos iniciar sesión",
          body: "Revisa tu correo y contraseña e intenta de nuevo." });
      }
      if (mode === "register") {
        const { data, error } = await signUpWithEmail(email, password, name.trim());
        if (error) return setNotice({ title: "No se pudo crear la cuenta", body: error.message });
        if (data.session) return router.replace(next);
        return setNotice({ title: "Revisa tu correo",
          body: `Te enviamos un enlace de confirmación a ${email}. Ábrelo para activar tu cuenta.` });
      }
      if (mode === "forgot") {
        const { error } = await sendPasswordResetEmail(email);
        if (error) return setNotice({ title: "No se pudo enviar el enlace", body: error.message });
        return setNotice({ title: "Revisa tu correo",
          body: `Si ${email} tiene una cuenta, te enviamos un enlace para restablecer tu contraseña.` });
      }
      const { error } = await updatePassword(password);
      if (error) return setNotice({ title: "No se pudo cambiar la contraseña", body: error.message });
      setNotice({ title: "Listo", body: "Tu contraseña se actualizó correctamente.",
        action: () => router.replace("/cuenta") });
    } catch (error) {
      setNotice({ title: "No se pudo completar", body: error instanceof Error ? error.message
        : "Intenta de nuevo más tarde." });
    } finally {
      setSubmitting(false);
    }
  }

  function social(provider: "Google" | "Apple") {
    setNotice({
      title: `Continuar con ${provider}`,
      body: `Iniciar sesión con ${provider} todavía no está configurado: el proyecto de Supabase ` +
        `no tiene credenciales de ${provider} registradas.`,
    });
  }

  return (
    <div className={styles.background}>
      <Image src="/app/themes/montana-valle.jpg" alt="" fill priority sizes="100vw"
        className={styles.photo} />
      <div className={styles.topTint} aria-hidden />
      <div className={styles.bottomTint} aria-hidden />
      <span className={styles.illustrativeTag}>Imagen ilustrativa</span>

      <form className={styles.scroll} onSubmit={handleSubmit} noValidate>
        <div className={styles.headerRow}>
          <button type="button" className={styles.iconButton} aria-label="Volver"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/cuenta"))}>
            <IoArrowBack size={22} color="#FFFFFF" aria-hidden />
          </button>
          <Image src="/app/brand/icon-negativo.png" alt="Panamá Viajero" width={34} height={35} />
        </div>

        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>

        <div className={styles.form}>
          {mode === "register" && (
            <Field icon={IoPersonOutline} placeholder="Nombre completo" value={name} onChange={setName}
              error={nameError} autoComplete="name" />
          )}
          {needsEmail && (
            <Field icon={IoMailOutline} placeholder="Correo electrónico" value={email}
              onChange={setEmail} error={emailError} type="email" autoComplete="email" />
          )}
          {needsPassword && (
            <Field icon={IoLockClosedOutline}
              placeholder={confirmsPassword ? "Nueva contraseña" : "Contraseña"}
              value={password} onChange={setPassword} error={passwordError} secure
              autoComplete={mode === "login" ? "current-password" : "new-password"} />
          )}
          {confirmsPassword && (
            <Field icon={IoLockClosedOutline} placeholder="Confirmar contraseña" value={confirm}
              onChange={setConfirm} error={confirmError} secure autoComplete="new-password" />
          )}
          {mode === "login" && (
            <Link href="/cuenta/recuperar" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          <button type="submit" className={styles.primaryButton} disabled={submitting}>
            {submitting ? <span className={styles.spinner} aria-label="Enviando" /> : copy.button}
          </button>

          {(mode === "login" || mode === "register") && (
            <>
              <div className={styles.separatorRow}>
                <span className={styles.separatorLine} />
                <span className={styles.separatorText}>o</span>
                <span className={styles.separatorLine} />
              </div>
              <button type="button" className={styles.socialButton} onClick={() => social("Google")}>
                <Image src="/app/brand/google-icon.png" alt="" width={18} height={18} />
                Continuar con Google
              </button>
              <button type="button" className={styles.socialButton} onClick={() => social("Apple")}>
                <IoLogoApple size={20} color="#1A1A1A" aria-hidden />
                Continuar con Apple
              </button>
            </>
          )}
        </div>

        {mode === "login" && (
          <Link href="/cuenta/registro" className={styles.footerLink}>
            ¿No tienes cuenta? <strong>Regístrate</strong>
          </Link>
        )}
        {mode === "register" && (
          <Link href="/cuenta/ingresar" className={styles.footerLink}>
            ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
          </Link>
        )}
        {mode === "forgot" && (
          <Link href="/cuenta/ingresar" className={styles.footerLink}>
            ¿La recordaste? <strong>Inicia sesión</strong>
          </Link>
        )}
      </form>

      {notice && (
        <div className={styles.modalBackdrop} role="alertdialog" aria-modal="true"
          aria-label={notice.title}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{notice.title}</h2>
            <p className={styles.modalBody}>{notice.body}</p>
            <div className={styles.modalActions}>
              {notice.action && notice.title === "Confirma tu correo" && (
                <button type="button" className={styles.modalSecondary}
                  onClick={() => setNotice(null)}>Cancelar</button>
              )}
              <button
                type="button"
                className={styles.modalPrimary}
                onClick={() => {
                  notice.action?.();
                  setNotice(null);
                }}
              >
                {notice.title === "Confirma tu correo" ? "Reenviar enlace"
                  : notice.action ? "Continuar" : "Entendido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, error, secure = false, type = "text",
  autoComplete }: {
  icon: IconType;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  secure?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  const [hidden, setHidden] = useState(secure);
  return (
    <div className={styles.fieldWrap}>
      <label className={`${styles.field} ${error ? styles.fieldError : ""}`}>
        <Icon size={18} color="rgb(255 255 255 / 85%)" aria-hidden />
        <input
          className={styles.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          type={secure && hidden ? "password" : secure ? "text" : type}
          autoComplete={autoComplete}
          autoCapitalize="none"
        />
        {secure && (
          <button type="button" className={styles.eye} onClick={() => setHidden((v) => !v)}
            aria-label={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}>
            {hidden ? <IoEyeOutline size={18} color="rgb(255 255 255 / 85%)" aria-hidden />
              : <IoEyeOffOutline size={18} color="rgb(255 255 255 / 85%)" aria-hidden />}
          </button>
        )}
      </label>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
