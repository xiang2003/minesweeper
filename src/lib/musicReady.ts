/**
 * Tiny external store flipped once the background track has buffered enough to play.
 * Lets LoadingScreen know when it can fade out without importing the <audio> element itself.
 */

let ready = false;
const listeners = new Set<() => void>();

export function setMusicReady(): void {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export function getMusicReady(): boolean {
  return ready;
}

export const getServerMusicReady = (): boolean => false;

export function subscribeMusicReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
