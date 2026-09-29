import { beforeEach, describe, expect, it } from "vitest";
import { clickCell, createGame } from "./puzzleEngine";
import { parsePuzzle } from "./puzzleParser";
import {
  STORAGE_KEY,
  createSave,
  exportSave,
  importSave,
  isCleared,
  loadAll,
  loadGame,
  resetAll,
  resetGame,
  saveGame,
  type StorageLike,
} from "./saveManager";
import type { GameSave } from "./types";

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

const puzzle = parsePuzzle({
  id: "p1",
  title: "P1",
  image: "x.svg",
  solution: ["#.", ".#"],
  clues: ["??", "??"],
  regions: ["AA", "BB"],
});

const sampleSave = (puzzleId = "p1", overrides: Partial<GameSave> = {}): GameSave => ({
  puzzleId,
  selectedCells: [0, 3],
  markedCells: [1],
  completedRegions: [0],
  completed: false,
  cleared: false,
  updatedAt: 1_700_000_000_000,
  ...overrides,
});

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
});

describe("save / load", () => {
  it("creates a save from game state", () => {
    // Filling cell 0 and marking cell 1 solves region A; cell 2 is marked in the still-unsolved region B.
    let state = clickCell(puzzle, createGame(puzzle), 0);
    state = clickCell(puzzle, state, 1, "mark");
    state = clickCell(puzzle, state, 2, "mark");
    expect(createSave(state, 42)).toEqual({
      puzzleId: "p1",
      selectedCells: [0],
      markedCells: [1, 2],
      completedRegions: [0],
      completed: false,
      cleared: false,
      updatedAt: 42,
    });
  });

  it("round-trips a save through storage", () => {
    saveGame(sampleSave(), storage);
    expect(loadGame("p1", storage)).toEqual(sampleSave());
    expect(loadGame("missing", storage)).toBeNull();
  });

  it("keeps saves for different puzzles side by side", () => {
    saveGame(sampleSave("p1"), storage);
    saveGame(sampleSave("p2"), storage);
    expect(Object.keys(loadAll(storage).saves).sort()).toEqual(["p1", "p2"]);
  });

  it("keeps cleared once a level was completed, even when later progress is incomplete", () => {
    saveGame(sampleSave("p1", { completed: true }), storage);
    saveGame(sampleSave("p1", { completed: false, selectedCells: [] }), storage);
    expect(loadGame("p1", storage)).toMatchObject({ completed: false, cleared: true });
  });

  it("treats completed saves from before `cleared` existed as cleared", () => {
    const legacy: Partial<GameSave> = sampleSave("p1", { completed: true });
    delete legacy.cleared;
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, saves: { p1: legacy } }));
    expect(isCleared("p1", storage)).toBe(true);
  });

  it("works without storage", () => {
    expect(() => saveGame(sampleSave(), null)).not.toThrow();
    expect(loadGame("p1", null)).toBeNull();
  });
});

describe("reset", () => {
  it("resets a single level", () => {
    saveGame(sampleSave("p1"), storage);
    saveGame(sampleSave("p2"), storage);
    resetGame("p1", storage);
    expect(loadGame("p1", storage)).toBeNull();
    expect(loadGame("p2", storage)).not.toBeNull();
  });

  it("keeps the cleared record when restarting a solved level", () => {
    saveGame(sampleSave("p1", { completed: true }), storage);
    resetGame("p1", storage);
    const save = loadGame("p1", storage);
    expect(save).toMatchObject({ selectedCells: [], markedCells: [], completed: false, cleared: true });
    expect(isCleared("p1", storage)).toBe(true);
  });

  it("resets all data", () => {
    saveGame(sampleSave("p1"), storage);
    resetAll(storage);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadAll(storage).saves).toEqual({});
  });
});

describe("export / import", () => {
  it("exports JSON that imports back to the same data", () => {
    saveGame(sampleSave("p1"), storage);
    saveGame(sampleSave("p2", { completed: true }), storage);
    const json = exportSave(storage);

    resetAll(storage);
    expect(loadAll(storage).saves).toEqual({});

    expect(importSave(json, storage)).toEqual({ ok: true, count: 2 });
    expect(loadGame("p1", storage)).toEqual(sampleSave("p1"));
    expect(loadGame("p2", storage)?.completed).toBe(true);
  });

  it("drops unknown extra fields", () => {
    const json = JSON.stringify({ version: 1, saves: { p1: { ...sampleSave(), evil: "<script>" } } });
    expect(importSave(json, storage).ok).toBe(true);
    expect(loadGame("p1", storage)).toEqual(sampleSave());
  });
});

describe("invalid save data", () => {
  const cases: [string, string][] = [
    ["not JSON", "{oops"],
    ["not an object", "[1,2,3]"],
    ["wrong version", JSON.stringify({ version: 2, saves: {} })],
    ["missing saves", JSON.stringify({ version: 1 })],
    ["puzzleId mismatch", JSON.stringify({ version: 1, saves: { p1: sampleSave("p2") } })],
    ["bad puzzle id key", JSON.stringify({ version: 1, saves: { "../x": sampleSave() } })],
    ["negative cell id", JSON.stringify({ version: 1, saves: { p1: sampleSave("p1", { selectedCells: [-1] }) } })],
    ["duplicate cell id", JSON.stringify({ version: 1, saves: { p1: sampleSave("p1", { selectedCells: [1, 1] }) } })],
    ["non-integer id", JSON.stringify({ version: 1, saves: { p1: sampleSave("p1", { selectedCells: [1.5] }) } })],
    ["string cells", JSON.stringify({ version: 1, saves: { p1: { ...sampleSave(), selectedCells: "0,1" } } })],
    ["bad completed", JSON.stringify({ version: 1, saves: { p1: { ...sampleSave(), completed: "yes" } } })],
    ["bad cleared", JSON.stringify({ version: 1, saves: { p1: { ...sampleSave(), cleared: 1 } } })],
    ["bad updatedAt", JSON.stringify({ version: 1, saves: { p1: { ...sampleSave(), updatedAt: "now" } } })],
  ];

  it.each(cases)("rejects %s and leaves existing data untouched", (_, text) => {
    saveGame(sampleSave(), storage);
    const before = storage.getItem(STORAGE_KEY);
    const result = importSave(text, storage);
    expect(result.ok).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe(before);
  });

  it("rejects oversized files", () => {
    expect(importSave(" ".repeat(1_000_001), storage).ok).toBe(false);
  });

  it("treats corrupted storage as empty instead of crashing", () => {
    storage.setItem(STORAGE_KEY, "{corrupted");
    expect(loadAll(storage).saves).toEqual({});
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, saves: { p1: { puzzleId: 5 } } }));
    expect(loadGame("p1", storage)).toBeNull();
  });
});
