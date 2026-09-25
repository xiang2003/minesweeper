"use client";

import { useState } from "react";

type Props = {
  label: string;
  /** Question shown in the confirmation step. */
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  className?: string;
};

/** Two-step button: the first click asks for confirmation inline, the second performs the action. */
export default function ConfirmButton({
  label,
  question,
  confirmLabel,
  cancelLabel,
  onConfirm,
  className = "btn",
}: Props) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }

  return (
    <span role="alertdialog" aria-label={question} style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span>{question}</span>
      <button
        type="button"
        className="btn btn-small btn-danger-solid"
        autoFocus
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-small" onClick={() => setAsking(false)}>
        {cancelLabel}
      </button>
    </span>
  );
}
