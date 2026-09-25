import type { NextConfig } from "next";

// GitHub Pages serves project sites from /<repo-name>. Set BASE_PATH="/<repo-name>" at build time
// (the deploy workflow does this automatically). Leave it empty for local dev or a root domain.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Emit /levels/index.html instead of /levels.html so static hosts resolve /levels/ directly.
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // Exposed to client code for plain asset URLs (e.g. CSS background images) that Next doesn't rewrite.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
