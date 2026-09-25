"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { EXPORT_FILE_NAME, exportSave, importSave, parseSaveText, resetAll } from "@/game/saveManager";
import { useI18n } from "@/i18n/useI18n";
import { clearPreferences } from "@/lib/preferences";
import ConfirmButton from "./ConfirmButton";
import LanguagePicker from "./LanguagePicker";
import MusicVolume from "./MusicVolume";
import styles from "./SaveSettings.module.css";

type Message = { kind: "ok" | "error"; text: string } | null;
type PendingImport = { text: string; fileName: string; count: number } | null;

export default function SaveSettings() {
  const { t } = useI18n();
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
    setMessage({ kind: "ok", text: t.exported(EXPORT_FILE_NAME) });
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setPending(null);
    const text = await file.text();
    const result = parseSaveText(text);
    if (!result.ok) {
      setMessage({ kind: "error", text: t.importFailed(result.error) });
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
      result.ok ? { kind: "ok", text: t.imported(result.count) } : { kind: "error", text: t.importFailed(result.error) },
    );
  };

  return (
    <div className={styles.sections}>
      <section className="card" aria-labelledby="language-title">
        <h2 id="language-title">{t.language}</h2>
        <LanguagePicker />
      </section>

      <section className="card" aria-labelledby="music-title">
        <h2 id="music-title">{t.music}</h2>
        <p className="muted">{t.musicDesc}</p>
        <MusicVolume />
      </section>

      <section className="card" aria-labelledby="backup-title">
        <h2 id="backup-title">{t.backup}</h2>
        <p className="muted">{t.backupDesc}</p>
        <div className={styles.row}>
          <button type="button" className="btn" onClick={handleExport}>
            {t.exportSave}
          </button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            {t.importSave}
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
            <p id="import-question">{t.importConfirm(pending.fileName, pending.count)}</p>
            <div className={styles.row}>
              <button type="button" className="btn btn-primary btn-small" autoFocus onClick={confirmImport}>
                {t.replaceAndImport}
              </button>
              <button type="button" className="btn btn-small" onClick={() => setPending(null)}>
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="danger-title">
        <h2 id="danger-title">{t.reset}</h2>
        <p className="muted">{t.resetDesc}</p>
        <ConfirmButton
          label={t.resetAll}
          question={t.resetAllQuestion}
          confirmLabel={t.deleteEverything}
          cancelLabel={t.cancel}
          className="btn btn-danger"
          onConfirm={() => {
            resetAll();
            setPending(null);
            // Message first: clearing preferences may switch the UI language.
            setMessage({ kind: "ok", text: t.allDeleted });
            clearPreferences();
          }}
        />
      </section>

      <p className={styles.message} data-kind={message?.kind} role="status" aria-live="polite">
        {message?.text}
      </p>
    </div>
  );
}
