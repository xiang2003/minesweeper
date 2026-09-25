"use client";

import Link from "next/link";
import { puzzles } from "@/data/puzzles";
import { loadAll } from "@/game/saveManager";
import { localize } from "@/i18n/strings";
import { useI18n } from "@/i18n/useI18n";
import { assetPath } from "@/lib/assetPath";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./LevelList.module.css";

export default function LevelList() {
  const { t, lang } = useI18n();
  const hydrated = useHydrated();
  const saves = hydrated ? loadAll().saves : {};

  return (
    <ol className={styles.list}>
      {puzzles.map((puzzle) => {
        const save = saves[puzzle.id];
        const title = localize(puzzle.title, lang);
        const solved = save ? Math.min(save.completedRegions.length, puzzle.regions.length) : 0;
        const status = save?.completed
          ? t.completed
          : save
            ? t.inProgress(solved, puzzle.regions.length)
            : t.notStarted;

        return (
          <li key={puzzle.id}>
            <Link
              href={`/play/${puzzle.id}/`}
              className={styles.item}
              aria-label={t.levelAria(puzzle.id, title, puzzle.width, puzzle.height, status)}
            >
              <span
                className={styles.thumb}
                style={save?.completed ? { backgroundImage: `url("${assetPath(puzzle.image)}")` } : undefined}
                aria-hidden="true"
              >
                {!save?.completed && "?"}
              </span>
              <span className={styles.info}>
                <span className={styles.name}>{t.levelTitle(puzzle.id, title)}</span>
                <span className="muted">{t.levelMeta(puzzle.width, puzzle.height, puzzle.regions.length)}</span>
              </span>
              <span className={styles.status} data-completed={save?.completed ?? false}>
                {status}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
