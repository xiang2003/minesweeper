import { parsePuzzle } from "@/game/puzzleParser";
import type { Puzzle, PuzzleDefinition } from "@/game/types";
import puzzle001 from "./puzzle001";
import puzzle002 from "./puzzle002";
import puzzle003 from "./puzzle003";
import puzzle004 from "./puzzle004";

/** Level order. To add a level: create puzzleNNN.ts, add an image under public/images, append it here. */
export const puzzleDefinitions: PuzzleDefinition[] = [puzzle001, puzzle002, puzzle003, puzzle004];

export const puzzles: Puzzle[] = puzzleDefinitions.map(parsePuzzle);

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}

export function getNextPuzzle(id: string): Puzzle | undefined {
  const index = puzzles.findIndex((p) => p.id === id);
  return index >= 0 ? puzzles[index + 1] : undefined;
}
