import { describe, expect, it } from "vitest";
import { puzzleDefinitions } from "@/data/puzzles";
import type { PuzzleDefinition } from "./types";
import { validatePuzzleDefinition } from "./validator";

describe("shipped puzzles", () => {
  it("have unique ids", () => {
    const ids = puzzleDefinitions.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(puzzleDefinitions.map((d) => [d.id, d] as const))("puzzle %s is valid and uniquely solvable", (_, def) => {
    expect(validatePuzzleDefinition(def)).toEqual({ ok: true, errors: [] });
  });
});

describe("validatePuzzleDefinition", () => {
  const base: PuzzleDefinition = {
    id: "v",
    title: "V",
    image: "x.svg",
    solution: ["#.", ".#"],
    clues: ["??", "??"],
    regions: ["AB", "AB"],
  };

  it("flags a clue that disagrees with the solution", () => {
    const result = validatePuzzleDefinition({ ...base, clues: ["3?", "??"] });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toMatch(/clue at 0,0/);
  });

  it("flags puzzles with more than one solution", () => {
    // One clue "2" over a 2×2 grid: many ways to fill two cells.
    const result = validatePuzzleDefinition({ ...base, clues: ["?.", ".."] });
    expect(result.errors).toContain("puzzle has more than one solution");
  });

  it("reports structural errors instead of throwing", () => {
    const result = validatePuzzleDefinition({ ...base, regions: ["A", "AB"] });
    expect(result.ok).toBe(false);
  });
});
