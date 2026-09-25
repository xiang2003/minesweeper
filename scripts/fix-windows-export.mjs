// Works around a Next.js static-export bug on Windows: segment prefetch files that should be
// named `__next.a.b.__PAGE__.txt` are written as nested folders `__next.a\b\__PAGE__.txt`
// (path.relative returns backslashes, and Next only replaces "/" with "."). The browser
// requests the dotted name, so those prefetches 404. Linux/macOS builds are unaffected.
import fs from "node:fs";
import path from "node:path";

if (process.platform !== "win32") process.exit(0);

const outDir = path.resolve("out");
if (!fs.existsSync(outDir)) process.exit(0);

let fixed = 0;

function flatten(dir, prefix, parentDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) flatten(full, name, parentDir);
    else {
      fs.renameSync(full, path.join(parentDir, name));
      fixed++;
    }
  }
  fs.rmdirSync(dir);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flatten(full, entry.name, dir);
    else walk(full);
  }
}

walk(outDir);
if (fixed > 0) console.log(`fix-windows-export: renamed ${fixed} segment file(s)`);
