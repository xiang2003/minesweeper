import type { Metadata } from "next";
import GameScreen from "@/components/GameScreen";
import { getPuzzle, puzzles } from "@/data/puzzles";
import { localize } from "@/i18n/strings";

// Static export: one HTML file per level, unknown ids are 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return puzzles.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/play/[id]">): Promise<Metadata> {
  const { id } = await params;
  const puzzle = getPuzzle(id);
  return {
    title: puzzle ? `Level ${puzzle.id} · ${localize(puzzle.title, "en")} — Mosaic Puzzle` : "Mosaic Puzzle",
  };
}

export default async function PlayPage({ params }: PageProps<"/play/[id]">) {
  const { id } = await params;
  return <GameScreen puzzleId={id} />;
}
