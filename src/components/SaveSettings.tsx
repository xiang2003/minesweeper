"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { EXPORT_FILE_NAME, exportSave, importSave, parseSaveText, resetAll } from "@/game/saveManager";
import ConfirmButton from "./ConfirmButton";
import styles from "./SaveSettings.module.css";

type Message = { kind: "ok" | "error"; text: string } | null;
type PendingImport = { text: string; fileName: string; count: number } | null;

export default function SaveSettings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message>(null);
  const [pending, setPending] = useState<PendingImport>(null);

  const handleExport = () => {
    const blob = new Blob([exportSave()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = EXPORT_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ kind: "ok", text: `Exported ${EXPORT_FILE_NAME}.` });
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setPending(null);
    const text = await file.text();
    const result = parseSaveText(text);
    if (!result.ok) {
      setMessage({ kind: "error", text: `Import failed: ${result.error}` });
      return;
    }
    setMessage(null);
    setPending({ text, fileName: file.name, count: Object.keys(result.data.saves).length });
  };

  const confirmImport = () => {
    if (!pending) return;
    const result = importSave(pending.text);
    setPending(null);
    setMessage(
      result.ok
        ? { kind: "ok", text: `Imported progress for ${result.count} level(s).` }
        : { kind: "error", text: `Import failed: ${result.error}` },
    );
  };

  return (
    <div className={styles.sections}>
      <section className="card" aria-labelledby="backup-title">
        <h2 id="backup-title">Backup</h2>
        <p className="muted">
          Progress is saved automatically in this browser. Export it to a file to back it up or move it to another
          device.
        </p>
        <div className={styles.row}>
          <button type="button" className="btn" onClick={handleExport}>
            Export Save
          </button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            Import Save
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFile}
          />
        </div>
        {pending && (
          <div className={styles.confirm} role="alertdialog" aria-labelledby="import-question">
            <p id="import-question">
              “{pending.fileName}” contains progress for {pending.count} level(s). Importing replaces all current
              progress.
            </p>
            <div className={styles.row}>
              <button type="button" className="btn btn-primary btn-small" autoFocus onClick={confirmImport}>
                Replace and import
              </button>
              <button type="button" className="btn btn-small" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="danger-title">
        <h2 id="danger-title">Reset</h2>
        <p className="muted">Delete all progress stored in this browser. This cannot be undone.</p>
        <ConfirmButton
          label="Reset All Data"
          question="Delete all progress?"
          confirmLabel="Delete everything"
          className="btn btn-danger"
          onConfirm={() => {
            resetAll();
            setPending(null);
            setMessage({ kind: "ok", text: "All local game data was deleted." });
          }}
        />
      </section>

      <p className={styles.message} data-kind={message?.kind} role="status" aria-live="polite">
        {message?.text}
      </p>
    </div>
  );
}
