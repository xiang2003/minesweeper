"use client";

import Link from "next/link";
import { useState } from "react";
import { getNextPuzzle, getPuzzle } from "@/data/puzzles";
import { getProgress, type Tool } from "@/game/puzzleEngine";
import type { Puzzle } from "@/game/types";
import { useHydrated } from "@/lib/useHydrated";
import ConfirmButton from "./ConfirmButton";
import ProgressBar from "./ProgressBar";
import PuzzleBoard from "./PuzzleBoard";
import styles from "./GameScreen.module.css";
import { useGame } from "./useGame";

export default function GameScreen({ puzzleId }: { puzzleId: string }) {
  const puzzle = getPuzzle(puzzleId);
  const hydrated = useHydrated();

  if (!puzzle) {
    return (
      <main className="page">
        <p>Level not found.</p>
        <Link href="/levels/" className="btn">
          Back to levels
        </Link>
      </main>
    );
  }

  return (
    <main className={`page ${styles.screen}`}>
      <header className="topbar">
        <Link href="/levels/" className="btn btn-ghost btn-small" aria-label="Back to level select">
          ← Back
        </Link>
        <h1>
          Level {puzzle.id}
          <span className={styles.subtitle}> · {puzzle.title}</span>
        </h1>
        {/* Placeholder keeps the title centered. */}
        <span className={styles.spacer} aria-hidden="true" />
      </header>
      {hydrated ? <Game key={puzzle.id} puzzle={puzzle} /> :<BoardPlaceholder puzzle={puzzle} />}
    </main>
  );
}

function BoardPlaceholder({ puzzle }: { puzzle: Puzzle }) {
  return (
    <div
      className={styles.placeholder}
      style={{ aspectRatio: `${puzzle.width} / ${puzzle.height}` }}
      aria-busy="true"
      aria-label="Loading puzzle"
    />
  );
}

function Game({ puzzle }: { puzzle: Puzzle }) {
  const { game, set, click, reset, getState, lastCompletedRegion } = useGame(puzzle);
  const [tool, setTool] = useState<Tool>("fill");
  const progress = getProgress(puzzle, game);
  const next = getNextPuzzle(puzzle.id);
  const clueSize = puzzle.clueRadius * 2 + 1;

  const announcement = game.completed
    ? "Puzzle complete! The whole picture is revealed."
    : lastCompletedRegion !== null
      ? `Region ${puzzle.regions[lastCompletedRegion].key} solved. ${progress.completed} of ${progress.total} regions complete.`
      : "";

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.tools} role="group" aria-label="Tool">
          <button
            type="button"
            className={`btn btn-small ${tool === "fill" ? styles.toolActive : ""}`}
            aria-pressed={tool === "fill"}
            onClick={() => setTool("fill")}
          >
            <span className={styles.swatchFill} aria-hidden="true" /> Fill
          </button>
          <button
            type="button"
            className={`btn btn-small ${tool === "mark" ? styles.toolActive : ""}`}
            aria-pressed={tool === "mark"}
            onClick={() => setTool("mark")}
          >
            <span aria-hidden="true">✕</span> Mark
          </button>
        </div>
        <ConfirmButton
          label="Restart"
          question="Clear this level?"
          confirmLabel="Restart"
          className="btn btn-small btn-danger"
          onConfirm={reset}
        />
      </div>

      <PuzzleBoard puzzle={puzzle} game={game} tool={tool} getState={getState} onSet={set} onClick={click} />

      <p id="board-help" className={styles.help}>
        Each number = filled cells in its {clueSize}×{clueSize} area
        {puzzle.clueScope === "region" ? ", counting only its own region (bold borders)" : ""}. Right-click or Mark
        mode marks a cell as empty.
      </p>

      <ProgressBar completed={progress.completed} total={progress.total} />

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      {game.completed && (
        <section className={`card ${styles.complete}`} aria-labelledby="complete-title">
          <h2 id="complete-title">Puzzle complete!</h2>
          <p className="muted">You revealed “{puzzle.title}”.</p>
          <div className={styles.completeActions}>
            {next ? (
              <Link href={`/play/${next.id}/`} className="btn btn-primary">
                Next level →
              </Link>
            ) : (
              <span className="muted">You finished every level.</span>
            )}
            <Link href="/levels/" className="btn">
              Level select
            </Link>
            <button type="button" className="btn" onClick={reset}>
              Play again
            </button>
          </div>
        </section>
      )}
    </>
  );
}
