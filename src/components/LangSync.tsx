"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/useI18n";

/** Keeps <html lang> in sync with the chosen UI language (for screen readers and fonts). */
export default function LangSync() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
