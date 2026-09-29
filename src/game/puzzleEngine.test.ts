import { describe, expect, it } from "vitest";
import {
  clickCell,
  createGame,
  getClueStatus,
  getProgress,
  isCellLocked,
  restoreGame,
  setCell,
  solveGame,
} from "./puzzleEngine";
import { parsePuzzle } from "./puzzleParser";
import type { GameState, Puzzle, PuzzleDefinition } from "./types";

// 4×2 grid, two 2×2 regions. Solution fills the left column of each region.
const def: PuzzleDefinition = {
  id: "test",
  title: "Test",
  image: "images/test.svg",
  solution: ["#.#.", "#.#."],
  clues: ["????", "????"],
  regions: ["AABB", "AABB"],
};
const puzzle: Puzzle = parsePuzzle(def);

const solutionIds = (p: Puzzle, regionId?: number) =>
  p.cells.filter((c) => p.solution[c.id] && (regionId === undefined || c.regionId === regionId)).map((c) => c.id);

const emptyIds = (p: Puzzle, regionId?: number) =>
  p.cells.filter((c) => !p.solution[c.id] && (regionId === undefined || c.regionId === regionId)).map((c) => c.id);

function fillAll(state: GameState, ids: number[]): GameState {
  return ids.reduce((s, id) => clickCell(puzzle, s, id), state);
}

function markAll(state: GameState, ids: number[]): GameState {
  return ids.reduce((s, id) => clickCell(puzzle, s, id, "mark"), state);
}

describe("parsePuzzle", () => {
  it("builds cells, regions and derived clues", () => {
    expect(puzzle.width).toBe(4);
    expect(puzzle.height).toBe(2);
    expect(puzzle.regions.map((r) => r.cells)).toEqual([
      [0, 1, 4, 5],
      [2, 3, 6, 7],
    ]);
    expect(puzzle.clueScope).toBe("region");
    expect(puzzle.cells[0].neighbors).toEqual([0, 1, 4, 5]);
  });

  it("counts only the clue's own region by default", () => {
    // Cell (0,1) is in region A; its 3×3 also reaches column 2 (region B), which is ignored.
    expect(puzzle.cells[1].neighbors).toEqual([0, 1, 4, 5]);
    expect(puzzle.cells[1].clue).toBe(2);
  });

  it('counts across region borders with clueScope "grid"', () => {
    const grid = parsePuzzle({ ...def, clueScope: "grid" });
    expect(grid.cells[1].neighbors).toEqual([0, 1, 2, 4, 5, 6]);
    expect(grid.cells[1].clue).toBe(4);
  });

  it("rejects malformed rows", () => {
    expect(() => parsePuzzle({ ...def, regions: ["AAB", "AABB"] })).toThrow();
    expect(() => parsePuzzle({ ...def, solution: ["#x#.", "#.#."] })).toThrow();
  });
});

describe("cell clicks", () => {
  it("toggles fill and mark", () => {
    let s = createGame(puzzle);
    s = clickCell(puzzle, s, 1);
    expect(s.cells[1]).toBe("filled");
    s = clickCell(puzzle, s, 1);
    expect(s.cells[1]).toBe("empty");
    s = clickCell(puzzle, s, 1, "mark");
    expect(s.cells[1]).toBe("marked");
    s = clickCell(puzzle, s, 1, "fill");
    expect(s.cells[1]).toBe("filled");
  });

  it("does not mutate the previous state", () => {
    const s0 = createGame(puzzle);
    const s1 = clickCell(puzzle, s0, 0);
    expect(s0.cells[0]).toBe("empty");
    expect(s1).not.toBe(s0);
  });

  it("ignores invalid cell ids", () => {
    const s = createGame(puzzle);
    expect(clickCell(puzzle, s, -1)).toBe(s);
    expect(clickCell(puzzle, s, 99)).toBe(s);
    expect(setCell(puzzle, s, 1.5, "filled")).toBe(s);
  });
});

describe("clue status", () => {
  it("is satisfied when the count matches", () => {
    // Cell 0 clue: neighbors 0,1,4,5 → solution has 0 and 4 filled → clue 2.
    const s = fillAll(createGame(puzzle), [0, 4]);
    expect(getClueStatus(puzzle, s, 0)).toBe("satisfied");
  });

  it("is an error when too many cells are filled", () => {
    const s = fillAll(createGame(puzzle), [0, 1, 4]);
    expect(getClueStatus(puzzle, s, 0)).toBe("error");
  });

  it("is an error when too few open cells remain", () => {
    let s = createGame(puzzle);
    for (const id of [0, 1, 4]) s = clickCell(puzzle, s, id, "mark");
    expect(getClueStatus(puzzle, s, 0)).toBe("error");
  });

  it("is pending while undecided", () => {
    expect(getClueStatus(puzzle, createGame(puzzle), 0)).toBe("pending");
  });
});

describe("region and puzzle completion", () => {
  it("completes a region only once every cell is filled or marked to match the solution", () => {
    let s = fillAll(createGame(puzzle), solutionIds(puzzle, 0));
    // Cells 1 and 5 must be empty but are still just blank, not marked.
    expect(s.completedRegions).toEqual([]);

    s = markAll(s, emptyIds(puzzle, 0));
    expect(s.completedRegions).toEqual([0]);
    expect(s.completed).toBe(false);
    expect(getProgress(puzzle, s)).toEqual({
      ratio: 0.5, // 2 of the 4 solution cells filled
      filled: 2,
      target: 4,
      completedRegions: 1,
      totalRegions: 2,
    });

    // A wrong extra cell in region 1 keeps it incomplete, even once the rest is marked.
    s = fillAll(s, [3, ...solutionIds(puzzle, 1)]);
    s = markAll(s, [7]);
    expect(s.completedRegions).toEqual([0]);
  });

  it("requires marking, not just leaving a cell blank", () => {
    let s = fillAll(createGame(puzzle), solutionIds(puzzle, 0));
    expect(s.completedRegions).not.toContain(0);

    s = markAll(s, emptyIds(puzzle, 0));
    expect(s.completedRegions).toContain(0);
  });

  it("locks completed regions", () => {
    let s = fillAll(createGame(puzzle), solutionIds(puzzle, 0));
    s = markAll(s, emptyIds(puzzle, 0));
    expect(isCellLocked(puzzle, s, 0)).toBe(true);
    expect(clickCell(puzzle, s, 0)).toBe(s);
    expect(isCellLocked(puzzle, s, 2)).toBe(false);
  });

  it("completes the puzzle when all regions are solved", () => {
    let s = fillAll(createGame(puzzle), solutionIds(puzzle));
    s = markAll(s, emptyIds(puzzle));
    expect(s.completed).toBe(true);
    expect(getProgress(puzzle, s).ratio).toBe(1);
  });

  it("solveGame produces the finished board", () => {
    const s = solveGame(puzzle);
    expect(s.completed).toBe(true);
    expect(s.completedRegions).toEqual([0, 1]);
    expect(s.cells.filter((c) => c === "filled")).toHaveLength(4);
    expect(s.cells.filter((c) => c === "marked")).toHaveLength(4);
  });

  it("counts wrong fills in progress (no correctness leak) and caps at 100%", () => {
    const wrong = fillAll(createGame(puzzle), [1, 3]);
    expect(getProgress(puzzle, wrong).ratio).toBe(0.5);
    const tooMany = fillAll(createGame(puzzle), [1, 3, 5, 7, 0]);
    expect(getProgress(puzzle, tooMany).ratio).toBe(1);
    expect(tooMany.completed).toBe(false);
  });

  it("restores completion from saved cells, ignoring bad ids", () => {
    const s = restoreGame(puzzle, [...solutionIds(puzzle, 1), 999, -3], [...emptyIds(puzzle, 1), -3]);
    expect(s.completedRegions).toEqual([1]);
    expect(s.cells[3]).toBe("marked");
    expect(s.completed).toBe(false);
  });
});
