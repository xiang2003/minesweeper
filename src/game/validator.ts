import { parsePuzzle } from "./puzzleParser";
import type { Puzzle, PuzzleDefinition } from "./types";

/**
 * Level-data validation. Used by tests (and handy while authoring new levels)
 * to guarantee every shipped puzzle is consistent and has exactly one solution.
 */

export type ValidationResult = { ok: boolean; errors: string[] };

export function validatePuzzleDefinition(def: PuzzleDefinition): ValidationResult {
  let puzzle: Puzzle;
  try {
    puzzle = parsePuzzle(def);
  } catch (e) {
    return { ok: false, errors: [(e as Error).message] };
  }

  const errors: string[] = [];
  if (!/^[a-z0-9-]+$/.test(def.id)) errors.push(`id "${def.id}" must be lowercase letters, digits or "-"`);

  for (const cell of puzzle.cells) {
    if (cell.clue === undefined) continue;
    const actual = cell.neighbors.filter((id) => puzzle.solution[id]).length;
    if (actual !== cell.clue) {
      errors.push(`clue at ${cell.row},${cell.col} is ${cell.clue} but the solution has ${actual}`);
    }
  }

  const solutions = countSolutions(puzzle, 2);
  if (solutions === 0) errors.push("puzzle has no solution");
  if (solutions > 1) errors.push("puzzle has more than one solution");

  return { ok: errors.length === 0, errors };
}

/** Counts solutions consistent with the visible clues, stopping at `limit`. */
export function countSolutions(puzzle: Puzzle, limit = 2): number {
  const clueCells = puzzle.cells.filter((c) => c.clue !== undefined);
  const covered = new Set(clueCells.flatMap((c) => c.neighbors));
  // A cell no clue can see could be either value.
  if (covered.size < puzzle.cells.length) return limit;

  // -1 unknown, 0 empty, 1 filled
  const initial = new Int8Array(puzzle.cells.length).fill(-1);
  let count = 0;

  const propagate = (values: Int8Array): boolean => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const cell of clueCells) {
        let filled = 0;
        let unknown = 0;
        for (const id of cell.neighbors) {
          if (values[id] === 1) filled++;
          else if (values[id] === -1) unknown++;
        }
        const clue = cell.clue!;
        if (filled > clue || filled + unknown < clue) return false;
        if (unknown > 0 && (filled === clue || filled + unknown === clue)) {
          const v = filled === clue ? 0 : 1;
          for (const id of cell.neighbors) if (values[id] === -1) values[id] = v;
          changed = true;
        }
      }
    }
    return true;
  };

  const search = (values: Int8Array): void => {
    if (count >= limit || !propagate(values)) return;
    const next = values.indexOf(-1);
    if (next === -1) {
      count++;
      return;
    }
    for (const v of [1, 0]) {
      const copy = values.slice();
      copy[next] = v;
      search(copy);
    }
  };

  search(initial);
  return count;
}
