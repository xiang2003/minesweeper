"use client";

import Link from "next/link";
import { useState } from "react";
import { puzzles } from "@/data/puzzles";
import { loadAll } from "@/game/saveManager";
import type { Puzzle } from "@/game/types";
import { localize } from "@/i18n/strings";
import { useI18n } from "@/i18n/useI18n";
import { assetPath } from "@/lib/assetPath";
import { useHydrated } from "@/lib/useHydrated";
import Modal from "./Modal";
import styles from "./LevelList.module.css";

export default function LevelList() {
  const { t, lang } = useI18n();
  const hydrated = useHydrated();
  const saves = hydrated ? loadAll().saves : {};
  const [viewing, setViewing] = useState<Puzzle | null>(null);

  return (
    <>
      <ol className={styles.list}>
        {puzzles.map((puzzle) => {
          const save = saves[puzzle.id];
          const title = localize(puzzle.title, lang);
          const cleared = save?.cleared === true;
          const solved = save ? Math.min(save.completedRegions.length, puzzle.regions.length) : 0;
          const status = save?.completed
            ? t.completed
            : cleared
              ? t.completedReplaying
              : save
                ? t.inProgress(solved, puzzle.regions.length)
                : t.notStarted;

          return (
            <li key={puzzle.id} className={styles.item}>
              {cleared ? (
                <button
                  type="button"
                  className={`${styles.thumb} ${styles.thumbCleared}`}
                  style={{ backgroundImage: `url("${assetPath(puzzle.image)}")` }}
                  aria-label={`${t.viewPicture}: ${title}`}
                  title={t.viewPicture}
                  onClick={() => setViewing(puzzle)}
                >
                  <span className={styles.zoom} aria-hidden="true">
                    ⤢
                  </span>
                </button>
              ) : (
                <span className={styles.thumb} aria-hidden="true">
                  ?
                </span>
              )}
              <Link
                href={`/play/${puzzle.id}/`}
                className={styles.main}
                aria-label={t.levelAria(puzzle.id, title, puzzle.width, puzzle.height, status)}
              >
                <span className={styles.info}>
                  <span className={styles.name}>{t.levelTitle(puzzle.id, title)}</span>
                  <span className="muted">{t.levelMeta(puzzle.width, puzzle.height, puzzle.regions.length)}</span>
                </span>
                <span className={styles.status} data-completed={cleared}>
                  {status}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? t.levelTitle(viewing.id, localize(viewing.title, lang)) : ""}
      >
        {viewing && (
          <div
            className={styles.picture}
            role="img"
            aria-label={localize(viewing.title, lang)}
            style={{
              backgroundImage: `url("${assetPath(viewing.image)}")`,
              aspectRatio: `${viewing.width} / ${viewing.height}`,
            }}
          />
        )}
      </Modal>
    </>
  );
}
