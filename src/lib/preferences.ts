/**
 * UI preferences (language, whether the help was shown), kept apart from game saves.
 * Exposes a tiny subscribe/getSnapshot store for useSyncExternalStore.
 */

export const LANGS = ["en", "zh-Hant"] as const;
export type Lang = (typeof LANGS)[number];

export type Preferences = { lang?: Lang; seenHelp?: boolean };

export const PREFS_KEY = "mosaic-puzzle-prefs";
const EMPTY: Preferences = {};

const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Preferences } = { raw: null, value: EMPTY };

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return EMPTY;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return EMPTY;
    const { lang, seenHelp } = v as Record<string, unknown>;
    return {
      ...(LANGS.includes(lang as Lang) ? { lang: lang as Lang } : {}),
      ...(typeof seenHelp === "boolean" ? { seenHelp } : {}),
    };
  } catch {
    return EMPTY;
  }
}

/** Stable snapshot: the same object is returned until the stored value changes. */
export function getPreferences(): Preferences {
  let raw: string | null = null;
  try {
    raw = storage()?.getItem(PREFS_KEY) ?? null;
  } catch {
    // ignore
  }
  if (raw !== cache.raw) cache = { raw, value: parsePreferences(raw) };
  return cache.value;
}

export const getServerPreferences = (): Preferences => EMPTY;

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(value: Preferences | null): void {
  try {
    if (value) storage()?.setItem(PREFS_KEY, JSON.stringify(value));
    else storage()?.removeItem(PREFS_KEY);
  } catch {
    // storage unavailable: preferences just won't persist
  }
  listeners.forEach((l) => l());
}

export function updatePreferences(patch: Preferences): void {
  write({ ...getPreferences(), ...patch });
}

export function clearPreferences(): void {
  write(null);
}

/** Best guess from the browser when the player hasn't chosen yet. */
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.languages?.some((l) => l.toLowerCase().startsWith("zh")) ? "zh-Hant" : "en";
}
