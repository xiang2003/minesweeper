"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useI18n } from "@/i18n/useI18n";
import { getMusicReady, getServerMusicReady, subscribeMusicReady } from "@/lib/musicReady";
import { getPreferences, getServerPreferences, subscribePreferences } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./LoadingScreen.module.css";

// Give the track a moment to buffer, but never block the app for long if it can't.
const MAX_WAIT_MS = 2500;
// Keep in sync with the opacity/visibility transition in LoadingScreen.module.css.
const FADE_MS = 450;

/**
 * Full-screen splash shown while the app hydrates and the background track buffers,
 * so playback doesn't stutter the moment the player interacts. Lives in the root layout,
 * so it only ever appears once per page load, not on client-side navigation.
 */
export default function LoadingScreen() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const musicReady = useSyncExternalStore(subscribeMusicReady, getMusicReady, getServerMusicReady);
  const prefs = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const [timedOut, setTimedOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  // Muted players don't need to wait for the track at all.
  const skipMusic = hydrated && prefs.musicVolume === 0;
  const done = hydrated && (musicReady || skipMusic || timedOut);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setRemoved(true), FADE_MS);
    return () => clearTimeout(id);
  }, [done]);

  if (removed) return null;

  return (
    <div className={styles.overlay} data-done={done}>
      <div className={styles.tiles} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {done ? "" : t.loadingApp}
      </p>
    </div>
  );
}
