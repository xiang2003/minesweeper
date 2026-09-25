"use client";

import Link from "next/link";
import { puzzles } from "@/data/puzzles";
import { loadAll } from "@/game/saveManager";
import { assetPath } from "@/lib/assetPath";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./LevelList.module.css";

export default function LevelList() {
  const hydrated = useHydrated();
  const saves = hydrated ? loadAll().saves : {};

  return (
    <ol className={styles.list}>
      {puzzles.map((puzzle) => {
        const save = saves[puzzle.id];
        const solved = save ? Math.min(save.completedRegions.length, puzzle.regions.length) : 0;
        const status = save?.completed
          ? "Completed"
          : save
            ? `In progress · ${solved}/${puzzle.regions.length} regions`
            : "Not started";

        return (
          <li key={puzzle.id}>
            <Link
              href={`/play/${puzzle.id}/`}
              className={styles.item}
              aria-label={`Level ${puzzle.id}, ${puzzle.title}, ${puzzle.width} by ${puzzle.height}, ${status}`}
            >
              <span
                className={styles.thumb}
                data-completed={save?.completed ?? false}
                style={save?.completed ? { backgroundImage: `url("${assetPath(puzzle.image)}")` } : undefined}
                aria-hidden="true"
              >
                {!save?.completed && "?"}
              </span>
              <span className={styles.info}>
                <span className={styles.name}>
                  Level {puzzle.id} · {puzzle.title}
                </span>
                <span className="muted">
                  {puzzle.width}×{puzzle.height} · {puzzle.regions.length} regions
                </span>
              </span>
              <span className={styles.status} data-completed={save?.completed ?? false}>
                {save?.completed ? "✓ Completed" : status}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
