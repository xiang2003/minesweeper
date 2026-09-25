import type { CellState, ClueStatus, GameState, Puzzle } from "./types";

/**
 * Pure game rules. Every function takes the puzzle + current state and returns
 * new data; nothing here touches React, the DOM or storage.
 *
 * Rules:
 *  - A clue N means exactly N filled cells in its neighborhood (clue cell included).
 *  - A region is complete when every cell in it matches the solution
 *    (filled where the solution is filled, not filled elsewhere; marks count as not filled).
 *  - Completed regions are locked. The puzzle is complete when all regions are.
 */

export type Tool = "fill" | "mark";

export function createGame(puzzle: Puzzle): GameState {
  return {
    puzzleId: puzzle.id,
    cells: puzzle.cells.map(() => "empty"),
    completedRegions: [],
    completed: false,
  };
}

/** Rebuilds a game from saved cell ids. Completion is recomputed, never trusted from input. */
export function restoreGame(puzzle: Puzzle, filled: number[], marked: number[] = []): GameState {
  const cells: CellState[] = puzzle.cells.map(() => "empty");
  for (const id of marked) if (isValidCellId(puzzle, id)) cells[id] = "marked";
  for (const id of filled) if (isValidCellId(puzzle, id)) cells[id] = "filled";
  return withCompletion(puzzle, { puzzleId: puzzle.id, cells, completedRegions: [], completed: false });
}

export function isValidCellId(puzzle: Puzzle, id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id < puzzle.cells.length;
}

export function isCellLocked(puzzle: Puzzle, state: GameState, cellId: number): boolean {
  return state.completedRegions.includes(puzzle.cells[cellId].regionId);
}

/** The state a cell should take when clicked with `tool`: toggles between that tool's state and empty. */
export function nextCellState(current: CellState, tool: Tool): CellState {
  const target: CellState = tool === "fill" ? "filled" : "marked";
  return current === target ? "empty" : target;
}

/** Sets one cell. Returns the same state object if nothing changed (locked cell, same value, bad id). */
export function setCell(puzzle: Puzzle, state: GameState, cellId: number, value: CellState): GameState {
  if (!isValidCellId(puzzle, cellId) || isCellLocked(puzzle, state, cellId)) return state;
  if (state.cells[cellId] === value) return state;
  const cells = state.cells.slice();
  cells[cellId] = value;
  return withCompletion(puzzle, { ...state, cells });
}

export function clickCell(puzzle: Puzzle, state: GameState, cellId: number, tool: Tool = "fill"): GameState {
  if (!isValidCellId(puzzle, cellId)) return state;
  return setCell(puzzle, state, cellId, nextCellState(state.cells[cellId], tool));
}

export function isRegionSolved(puzzle: Puzzle, cells: CellState[], regionId: number): boolean {
  return puzzle.regions[regionId].cells.every((id) => (cells[id] === "filled") === puzzle.solution[id]);
}

function withCompletion(puzzle: Puzzle, state: GameState): GameState {
  const completedRegions = puzzle.regions
    .filter((region) => state.completedRegions.includes(region.id) || isRegionSolved(puzzle, state.cells, region.id))
    .map((region) => region.id);
  return {
    ...state,
    completedRegions,
    completed: completedRegions.length === puzzle.regions.length,
  };
}

/**
 * - "error": already too many filled cells, or too few cells left that could still be filled.
 * - "satisfied": exactly the clue's count is filled.
 * - "pending": otherwise.
 */
export function getClueStatus(puzzle: Puzzle, state: GameState, cellId: number): ClueStatus | undefined {
  const cell = puzzle.cells[cellId];
  if (cell?.clue === undefined) return undefined;
  let filled = 0;
  let open = 0;
  for (const id of cell.neighbors) {
    if (state.cells[id] === "filled") filled++;
    else if (state.cells[id] === "empty" && !isCellLocked(puzzle, state, id)) open++;
  }
  if (filled > cell.clue || filled + open < cell.clue) return "error";
  return filled === cell.clue ? "satisfied" : "pending";
}

export type Progress = { completed: number; total: number; ratio: number };

export function getProgress(puzzle: Puzzle, state: GameState): Progress {
  const total = puzzle.regions.length;
  const completed = state.completedRegions.length;
  return { completed, total, ratio: total === 0 ? 0 : completed / total };
}

export function filledCellIds(state: GameState): number[] {
  return idsWithState(state, "filled");
}

export function markedCellIds(state: GameState): number[] {
  return idsWithState(state, "marked");
}

function idsWithState(state: GameState, value: CellState): number[] {
  const ids: number[] = [];
  state.cells.forEach((s, id) => {
    if (s === value) ids.push(id);
  });
  return ids;
}
