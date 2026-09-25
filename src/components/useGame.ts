"use client";

import { useCallback, useRef, useState } from "react";
import { clickCell, createGame, restoreGame, setCell, solveGame, type Tool } from "@/game/puzzleEngine";
import { createSave, isCleared, loadGame, resetGame, saveGame } from "@/game/saveManager";
import type { CellState, GameState, Puzzle } from "@/game/types";

function loadInitial(puzzle: Puzzle): GameState {
  const save = loadGame(puzzle.id);
  return save ? restoreGame(puzzle, save.selectedCells, save.markedCells) : createGame(puzzle);
}

/**
 * Connects the pure engine to React state and localStorage.
 * Must only be mounted on the client (after hydration) because it reads storage on init.
 */
export function useGame(puzzle: Puzzle) {
  const [game, setGame] = useState<GameState>(() => loadInitial(puzzle));
  // Mirrors `game` so rapid pointer events in one frame build on each other's result.
  const current = useRef(game);
  const [lastCompletedRegion, setLastCompletedRegion] = useState<number | null>(null);
  // Solved at least once (persists through restarts); unlocks auto-solve.
  const [cleared, setCleared] = useState(() => isCleared(puzzle.id));

  const commit = useCallback((next: GameState) => {
    const prev = current.current;
    if (next === prev) return;
    current.current = next;
    setGame(next);
    saveGame(createSave(next));
    if (next.completed) setCleared(true);
    const newlyCompleted = next.completedRegions.find((id) => !prev.completedRegions.includes(id));
    if (newlyCompleted !== undefined) setLastCompletedRegion(newlyCompleted);
  }, []);

  const set = useCallback(
    (cellId: number, value: CellState) => commit(setCell(puzzle, current.current, cellId, value)),
    [commit, puzzle],
  );

  const click = useCallback(
    (cellId: number, tool: Tool) => commit(clickCell(puzzle, current.current, cellId, tool)),
    [commit, puzzle],
  );

  /** Only available for levels solved before. */
  const autoSolve = useCallback(() => {
    if (cleared) commit(solveGame(puzzle));
  }, [cleared, commit, puzzle]);

  const reset = useCallback(() => {
    resetGame(puzzle.id);
    const fresh = createGame(puzzle);
    current.current = fresh;
    setGame(fresh);
    setLastCompletedRegion(null);
  }, [puzzle]);

  const getState = useCallback(() => current.current, []);

  return { game, set, click, reset, autoSolve, cleared, getState, lastCompletedRegion };
}
