import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SaveSettings from "@/components/SaveSettings";

export const metadata: Metadata = { title: "Settings — Mosaic Puzzle" };

export default function SettingsPage() {
  return (
    <main className="page">
      <PageHeader title="settingsTitle" />
      <SaveSettings />
    </main>
  );
}
