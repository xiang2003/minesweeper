import type { Metadata } from "next";
import Link from "next/link";
import LevelList from "@/components/LevelList";

export const metadata: Metadata = { title: "Level Select — Mosaic Puzzle" };

export default function LevelsPage() {
  return (
    <main className="page">
      <header className="topbar">
        <Link href="/" className="btn btn-ghost btn-small" aria-label="Back to home">
          ← Home
        </Link>
        <h1>Level Select</h1>
        <Link href="/settings/" className="btn btn-ghost btn-small">
          Settings
        </Link>
      </header>
      <LevelList />
    </main>
  );
}
