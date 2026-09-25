import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during static prerender and the first client render, true afterwards.
 * Components that read localStorage render their real content only once this is true,
 * which avoids hydration mismatches in the static export.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
