"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Modal dialog built on native <dialog> (focus trap, Esc to close, click on backdrop closes). */
export default function Modal({ open, onClose, title, children, footer }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // The dialog element itself is only hit outside the panel, i.e. on the backdrop.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
