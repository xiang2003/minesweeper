/** Prefixes a /public asset path with the deploy base path (e.g. "/repo-name" on GitHub Pages). */
export function assetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/${path.replace(/^\/+/, "")}`;
}
