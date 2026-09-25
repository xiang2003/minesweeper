import type { Metadata } from "next";
import LevelList from "@/components/LevelList";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Level Select — Mosaic Puzzle" };

export default function LevelsPage() {
  return (
    <main className="page">
      <PageHeader title="levelSelect" settingsLink />
      <LevelList />
    </main>
  );
}
