"use client";

import { useSyncExternalStore } from "react";
import {
  detectLang,
  getPreferences,
  getServerPreferences,
  subscribePreferences,
  updatePreferences,
  type Lang,
} from "@/lib/preferences";
import { STRINGS } from "./strings";

const noopSubscribe = () => () => {};

/**
 * Current UI language and its strings. The static HTML is rendered in English;
 * after hydration the stored (or browser-detected) language takes over.
 */
export function useI18n() {
  const prefs = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const detected = useSyncExternalStore<Lang>(noopSubscribe, detectLang, () => "en");
  const lang = prefs.lang ?? detected;
  return {
    lang,
    t: STRINGS[lang],
    /** True once the player has explicitly picked a language. */
    chosen: prefs.lang !== undefined,
    setLang: (next: Lang) => updatePreferences({ lang: next }),
  };
}
