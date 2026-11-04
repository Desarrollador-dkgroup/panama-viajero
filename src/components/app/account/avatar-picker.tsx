"use client";

import Image from "next/image";
import { useState } from "react";
import { IoCameraOutline, IoPerson } from "react-icons/io5";
import { refreshAuthSession } from "@/lib/auth-session";
import { publicMediaUrl } from "@/lib/storage";
import { uploadOwnAvatar } from "@/lib/profile";
import styles from "./avatar-picker.module.css";

// Foto de perfil: muestra la actual y permite elegir otra desde el dispositivo.
export function AvatarPicker({ avatarPath, editable = false }: {
  avatarPath: string | null;
  editable?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const url = avatarPath ? publicMediaUrl(avatarPath, "avatars") : "";

  return (
    <div className={styles.wrap}>
      <span className={styles.avatar}>
        {url ? (
          <Image src={url} alt="Tu foto de perfil" width={96} height={96} unoptimized
            className={styles.image} />
        ) : (
          <IoPerson size={40} color="var(--indigo)" aria-hidden />
        )}
      </span>
      {editable && (
      <label className={styles.change}>
        <IoCameraOutline size={16} aria-hidden />
        {busy ? "Subiendo..." : "Cambiar foto"}
        <input type="file" accept="image/jpeg,image/png,image/webp" className={styles.input}
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              await uploadOwnAvatar(file);
              await refreshAuthSession();
            } catch (failure) {
              setError(failure instanceof Error ? failure.message : "No pudimos cambiar la foto.");
            } finally {
              setBusy(false);
            }
          }} />
      </label>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
