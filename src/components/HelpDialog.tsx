"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/useI18n";
import HelpContent from "./HelpContent";
import styles from "./HelpDialog.module.css";

/** Modal "How to play" dialog built on native <dialog> (focus trap, Esc to close). */
export default function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="help-title"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="help-title">{t.howToPlay}</h2>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        </header>
        <div className={styles.body}>
          <HelpContent headingLevel={3} />
        </div>
        <footer className={styles.footer}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t.help.start}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
