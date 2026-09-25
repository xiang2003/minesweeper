"use client";

import Link from "next/link";
import { puzzles } from "@/data/puzzles";
import { loadAll } from "@/game/saveManager";
import { useHydrated } from "@/lib/useHydrated";

/** "Play" jumps to the first unfinished level (level 1 before hydration or with no save). */
export default function PlayButton() {
  const hydrated = useHydrated();
  const saves = hydrated ? loadAll().saves : {};
  const target = puzzles.find((p) => !saves[p.id]?.completed) ?? puzzles[0];
  const started = Object.keys(saves).length > 0;

  return (
    <Link href={`/play/${target.id}/`} className="btn btn-primary" style={{ minWidth: 200, minHeight: 48 }}>
      {started ? `Continue · Level ${target.id}` : "Play"}
    </Link>
  );
}
