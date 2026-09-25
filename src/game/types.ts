/**
 * Core data model.
 *
 * Level authors write a compact `PuzzleDefinition` (see src/data/puzzles).
 * `parsePuzzle` turns it into a normalized `Puzzle` that the engine consumes.
 * The engine never assumes a grid size, region count or clue radius.
 */

/** Compact, human-editable level format. Every string row must be `width` long. */
export type PuzzleDefinition = {
  id: string;
  title: string;
  /** Image revealed region by region, relative to /public (e.g. "images/demo-001.svg"). */
  image: string;
  /** Clue counts the (2r+1)×(2r+1) square around the clue cell, the cell itself included. Default 1. */
  clueRadius?: number;
  /** Solution: "#" = filled, "." = empty. */
  solution: string[];
  /**
   * Visible clues: "." = no clue, "?" = clue computed from the solution,
   * a digit = explicit clue (validator checks it against the solution).
   */
  clues: string[];
  /** Region map: one character per cell; cells with the same character form a region. */
  regions: string[];
};

export type Cell = {
  id: number;
  row: number;
  col: number;
  regionId: number;
  clue?: number;
  /** Ids of cells counted by this cell's clue (only meaningful when `clue` is set). */
  neighbors: number[];
};

export type Region = {
  id: number;
  /** Character used in the definition's region map. */
  key: string;
  cells: number[];
};

export type Puzzle = {
  id: string;
  title: string;
  image: string;
  width: number;
  height: number;
  clueRadius: number;
  cells: Cell[];
  regions: Region[];
  /** solution[cellId] === true when the cell must be filled. */
  solution: boolean[];
};

/** Per-cell player state. "marked" is a player note meaning "this cell is empty". */
export type CellState = "empty" | "filled" | "marked";

export type GameState = {
  puzzleId: string;
  cells: CellState[];
  completedRegions: number[];
  completed: boolean;
};

export type ClueStatus = "pending" | "satisfied" | "error";

/** What gets written to localStorage for one puzzle. */
export type GameSave = {
  puzzleId: string;
  selectedCells: number[];
  markedCells: number[];
  completedRegions: number[];
  completed: boolean;
  updatedAt: number;
};

/** Whole save file (localStorage value and export format). */
export type SaveData = {
  version: 1;
  saves: Record<string, GameSave>;
};
