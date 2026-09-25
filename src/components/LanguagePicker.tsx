"use client";

import { STRINGS } from "@/i18n/strings";
import { useI18n } from "@/i18n/useI18n";
import { LANGS } from "@/lib/preferences";

/** One button per language; the active one is marked with aria-pressed and a check. */
export default function LanguagePicker({ large = false }: { large?: boolean }) {
  const { lang, chosen, setLang } = useI18n();

  return (
    <div role="group" aria-label="Language / 語言" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {LANGS.map((l) => {
        const active = chosen && l === lang;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            className={`btn ${active ? "btn-primary" : ""}`}
            style={large ? { minWidth: 130, minHeight: 48 } : undefined}
            aria-pressed={active}
            onClick={() => setLang(l)}
          >
            {active && <span aria-hidden="true">✓</span>}
            {STRINGS[l].langName}
          </button>
        );
      })}
    </div>
  );
}
