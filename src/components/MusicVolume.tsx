"use client";

import { useId, useSyncExternalStore, type CSSProperties } from "react";
import { useI18n } from "@/i18n/useI18n";
import {
  DEFAULT_MUSIC_VOLUME,
  getPreferences,
  getServerPreferences,
  subscribePreferences,
  updatePreferences,
} from "@/lib/preferences";
import styles from "./MusicVolume.module.css";

/** Volume slider (0–100%) for the background music; changes apply immediately. */
export default function MusicVolume() {
  const { t } = useI18n();
  const id = useId();
  const prefs = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const percent = Math.round((prefs.musicVolume ?? DEFAULT_MUSIC_VOLUME) * 100);

  return (
    <div className={styles.row}>
      <label htmlFor={id} className={styles.label}>
        <span aria-hidden="true">{percent === 0 ? "🔇" : "🔊"}</span> {t.musicVolume}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={percent}
        className={styles.slider}
        style={{ "--fill": `${percent}%` } as CSSProperties}
        aria-valuetext={`${percent}%`}
        onChange={(e) => updatePreferences({ musicVolume: Number(e.target.value) / 100 })}
      />
      <output htmlFor={id} className={styles.value}>
        {percent}%
      </output>
    </div>
  );
}
