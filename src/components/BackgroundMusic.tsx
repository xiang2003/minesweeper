"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { assetPath } from "@/lib/assetPath";
import {
  DEFAULT_MUSIC_VOLUME,
  getPreferences,
  getServerPreferences,
  subscribePreferences,
} from "@/lib/preferences";

const TRACK = "music/music1.mp3";

/**
 * Looping background music. Lives in the root layout, so it keeps playing across
 * client-side page changes. Browsers block audio until the player interacts with the
 * page, so if autoplay is refused, playback starts on the first click / tap / key press.
 */
export default function BackgroundMusic() {
  const prefs = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const volume = prefs.musicVolume ?? DEFAULT_MUSIC_VOLUME;
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(volume);

  // Apply volume changes; 0% pauses instead of playing silently.
  useEffect(() => {
    volumeRef.current = volume;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (volume === 0) audio.pause();
    else if (audio.paused) audio.play().catch(() => {}); // may be refused until the first interaction
  }, [volume]);

  // Retry on the first user interaction in case autoplay was blocked.
  useEffect(() => {
    const start = () => {
      const audio = audioRef.current;
      if (audio && audio.paused && volumeRef.current > 0) audio.play().catch(() => {});
    };
    const events = ["pointerdown", "keydown"] as const;
    events.forEach((type) => window.addEventListener(type, start));
    return () => events.forEach((type) => window.removeEventListener(type, start));
  }, []);

  return <audio ref={audioRef} src={assetPath(TRACK)} loop preload="none" aria-hidden="true" />;
}
