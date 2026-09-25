"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { getNextPuzzle, getPuzzle } from "@/data/puzzles";
import { getProgress, type Tool } from "@/game/puzzleEngine";
import type { Puzzle } from "@/game/types";
import { localize } from "@/i18n/strings";
import { useI18n } from "@/i18n/useI18n";
import { getPreferences, getServerPreferences, subscribePreferences, updatePreferences } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import ConfirmButton from "./ConfirmButton";
import HelpDialog from "./HelpDialog";
import ProgressBar from "./ProgressBar";
import PuzzleBoard from "./PuzzleBoard";
import styles from "./GameScreen.module.css";
import { useGame } from "./useGame";

export default function GameScreen({ puzzleId }: { puzzleId: string }) {
  const puzzle = getPuzzle(puzzleId);
  const { t, lang } = useI18n();
  const hydrated = useHydrated();
  const prefs = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const [helpRequested, setHelpRequested] = useState(false);
  // Opened by the "?" button, or automatically the first time a player enters a game.
  const helpOpen = helpRequested || (hydrated && prefs.seenHelp !== true);

  const closeHelp = () => {
    setHelpRequested(false);
    if (!prefs.seenHelp) updatePreferences({ seenHelp: true });
  };

  if (!puzzle) {
    return (
      <main className="page">
        <p>{t.levelNotFound}</p>
        <Link href="/levels/" className="btn">
          {t.backToLevels}
        </Link>
      </main>
    );
  }

  return (
    <main className={`page ${styles.screen}`}>
      <header className="topbar">
        <Link href="/levels/" className="btn btn-ghost btn-small" aria-label={t.backToLevels}>
          {t.back}
        </Link>
        <h1>
          {t.level(puzzle.id)}
          <span className={styles.subtitle}> · {localize(puzzle.title, lang)}</span>
        </h1>
        <span className={styles.headerRight}>
          <button
            type="button"
            className={`btn btn-small ${styles.helpButton}`}
            aria-label={t.howToPlay}
            aria-haspopup="dialog"
            title={t.howToPlay}
            onClick={() => setHelpRequested(true)}
          >
            ?
          </button>
        </span>
      </header>
      {hydrated ? <Game key={puzzle.id} puzzle={puzzle} /> : <BoardPlaceholder puzzle={puzzle} />}
      <HelpDialog open={helpOpen} onClose={closeHelp} />
    </main>
  );
}

function BoardPlaceholder({ puzzle }: { puzzle: Puzzle }) {
  const { t } = useI18n();
  return (
    <div
      className={styles.placeholder}
      style={{ aspectRatio: `${puzzle.width} / ${puzzle.height}` }}
      aria-busy="true"
      aria-label={t.loadingPuzzle}
    />
  );
}

function Game({ puzzle }: { puzzle: Puzzle }) {
  const { t, lang } = useI18n();
  const { game, set, click, reset, getState, lastCompletedRegion } = useGame(puzzle);
  const [tool, setTool] = useState<Tool>("fill");
  const progress = getProgress(puzzle, game);
  const next = getNextPuzzle(puzzle.id);
  const clueSize = puzzle.clueRadius * 2 + 1;

  const announcement = game.completed
    ? t.announceComplete
    : lastCompletedRegion !== null
      ? t.announceRegion(puzzle.regions[lastCompletedRegion].key, progress.completedRegions, progress.totalRegions)
      : "";

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.tools} role="group" aria-label={t.tool}>
          <button
            type="button"
            className={`btn btn-small ${tool === "fill" ? styles.toolActive : ""}`}
            aria-pressed={tool === "fill"}
            onClick={() => setTool("fill")}
          >
            <span className={styles.swatchFill} aria-hidden="true" /> {t.fill}
          </button>
          <button
            type="button"
            className={`btn btn-small ${tool === "mark" ? styles.toolActive : ""}`}
            aria-pressed={tool === "mark"}
            onClick={() => setTool("mark")}
          >
            <span aria-hidden="true">✕</span> {t.mark}
          </button>
        </div>
        <ConfirmButton
          label={t.restart}
          question={t.restartQuestion}
          confirmLabel={t.restart}
          cancelLabel={t.cancel}
          className="btn btn-small btn-danger"
          onConfirm={reset}
        />
      </div>

      <PuzzleBoard puzzle={puzzle} game={game} tool={tool} getState={getState} onSet={set} onClick={click} />

      <p id="board-help" className={styles.help}>
        {t.boardHelp(clueSize, puzzle.clueScope === "region")}
      </p>

      <ProgressBar progress={progress} />

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      {game.completed && (
        <section className={`card ${styles.complete}`} aria-labelledby="complete-title">
          <h2 id="complete-title">{t.puzzleComplete}</h2>
          <p className="muted">{t.youRevealed(localize(puzzle.title, lang))}</p>
          <div className={styles.completeActions}>
            {next ? (
              <Link href={`/play/${next.id}/`} className="btn btn-primary">
                {t.nextLevel}
              </Link>
            ) : (
              <span className="muted">{t.allLevelsDone}</span>
            )}
            <Link href="/levels/" className="btn">
              {t.levelSelect}
            </Link>
            <button type="button" className="btn" onClick={reset}>
              {t.playAgain}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
