import type { Metadata } from "next";
import Link from "next/link";
import SaveSettings from "@/components/SaveSettings";

export const metadata: Metadata = { title: "Settings — Mosaic Puzzle" };

export default function SettingsPage() {
  return (
    <main className="page">
      <header className="topbar">
        <Link href="/" className="btn btn-ghost btn-small" aria-label="Back to home">
          ← Home
        </Link>
        <h1>Settings &amp; Save Data</h1>
        <span style={{ width: 76 }} aria-hidden="true" />
      </header>
      <SaveSettings />
    </main>
  );
}
