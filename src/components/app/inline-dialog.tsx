"use client";

import { useState } from "react";
import styles from "./inline-dialog.module.css";

// Diálogo dentro de la página. Con `requireText` el botón solo se activa al escribir ese texto.
export function InlineDialog({ title, message, confirmLabel, cancelLabel, danger = false,
  requireText, onConfirm, onCancel, busy = false }: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const blocked = Boolean(requireText) && typed.trim().toLowerCase() !== requireText?.toLowerCase();

  return (
    <div className={styles.backdrop} role="presentation" onClick={onCancel}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={title}
        onClick={(event) => event.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {requireText && (
          <label className={styles.field}>
            <span>Escribe <b>{requireText}</b> para confirmar</span>
            <input className={styles.input} value={typed} autoComplete="off"
              onChange={(event) => setTyped(event.target.value)} />
          </label>
        )}
        <div className={styles.actions}>
          {cancelLabel && (
            <button type="button" className={styles.cancel} onClick={onCancel}>{cancelLabel}</button>
          )}
          <button type="button" className={danger ? styles.danger : styles.confirm}
            disabled={busy || blocked} onClick={onConfirm}>
            {busy ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
