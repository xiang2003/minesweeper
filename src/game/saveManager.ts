import { filledCellIds, markedCellIds } from "./puzzleEngine";
import type { GameSave, GameState, SaveData } from "./types";

/**
 * localStorage persistence plus JSON export/import.
 * Every function accepts an optional storage so tests can pass an in-memory one;
 * in the browser it defaults to window.localStorage (and silently no-ops on the server
 * or when storage is unavailable, e.g. private mode with storage disabled).
 */

export const STORAGE_KEY = "mosaic-puzzle-save";
export const EXPORT_FILE_NAME = "mosaic-puzzle-save.json";
const MAX_IMPORT_BYTES = 1_000_000;
const MAX_CELLS = 10_000;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function emptySaveData(): SaveData {
  return { version: 1, saves: {} };
}

export function createSave(state: GameState, now = Date.now()): GameSave {
  return {
    puzzleId: state.puzzleId,
    selectedCells: filledCellIds(state),
    markedCells: markedCellIds(state),
    completedRegions: [...state.completedRegions],
    completed: state.completed,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Validation: nothing read from storage or an imported file is trusted.

export type ParseResult = { ok: true; data: SaveData } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isIdList = (v: unknown): v is number[] =>
  Array.isArray(v) &&
  v.length <= MAX_CELLS &&
  v.every((n) => Number.isInteger(n) && n >= 0 && n < MAX_CELLS) &&
  new Set(v).size === v.length;

const PUZZLE_ID = /^[a-z0-9-]{1,64}$/;
const isPuzzleId = (v: unknown): v is string => typeof v === "string" && PUZZLE_ID.test(v);

function parseGameSave(key: string, v: unknown): GameSave | string {
  if (!isObject(v)) return `save "${key}" is not an object`;
  if (!isPuzzleId(v.puzzleId) || v.puzzleId !== key) return `save "${key}" has an invalid puzzleId`;
  if (!isIdList(v.selectedCells)) return `save "${key}" has invalid selectedCells`;
  if (v.markedCells !== undefined && !isIdList(v.markedCells)) return `save "${key}" has invalid markedCells`;
  if (!isIdList(v.completedRegions)) return `save "${key}" has invalid completedRegions`;
  if (typeof v.completed !== "boolean") return `save "${key}" has invalid completed flag`;
  if (typeof v.updatedAt !== "number" || !Number.isFinite(v.updatedAt) || v.updatedAt < 0) {
    return `save "${key}" has invalid updatedAt`;
  }
  // Copy only known fields so unexpected extra data is dropped.
  return {
    puzzleId: v.puzzleId,
    selectedCells: [...v.selectedCells],
    markedCells: v.markedCells ? [...(v.markedCells as number[])] : [],
    completedRegions: [...v.completedRegions],
    completed: v.completed,
    updatedAt: v.updatedAt,
  };
}

export function parseSaveData(input: unknown): ParseResult {
  if (!isObject(input)) return { ok: false, error: "Save data must be a JSON object." };
  if (input.version !== 1) return { ok: false, error: "Unsupported save version." };
  if (!isObject(input.saves)) return { ok: false, error: 'Save data is missing "saves".' };

  const saves: Record<string, GameSave> = {};
  for (const [key, value] of Object.entries(input.saves)) {
    if (!PUZZLE_ID.test(key)) return { ok: false, error: `Invalid puzzle id "${key.slice(0, 64)}".` };
    const parsed = parseGameSave(key, value);
    if (typeof parsed === "string") return { ok: false, error: `Invalid save: ${parsed}.` };
    saves[key] = parsed;
  }
  return { ok: true, data: { version: 1, saves } };
}

// ---------------------------------------------------------------------------
// Storage operations

export function loadAll(storage: StorageLike | null = defaultStorage()): SaveData {
  const raw = storage?.getItem(STORAGE_KEY);
  if (!raw) return emptySaveData();
  try {
    const result = parseSaveData(JSON.parse(raw));
    return result.ok ? result.data : emptySaveData();
  } catch {
    return emptySaveData();
  }
}

function writeAll(data: SaveData, storage: StorageLike | null): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or storage disabled: the game keeps working, just without persistence.
  }
}

export function loadGame(puzzleId: string, storage: StorageLike | null = defaultStorage()): GameSave | null {
  return loadAll(storage).saves[puzzleId] ?? null;
}

export function saveGame(save: GameSave, storage: StorageLike | null = defaultStorage()): void {
  const data = loadAll(storage);
  data.saves[save.puzzleId] = save;
  writeAll(data, storage);
}

export function resetGame(puzzleId: string, storage: StorageLike | null = defaultStorage()): void {
  const data = loadAll(storage);
  delete data.saves[puzzleId];
  writeAll(data, storage);
}

export function resetAll(storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Pretty JSON of all save data, ready to download as EXPORT_FILE_NAME. */
export function exportSave(storage: StorageLike | null = defaultStorage()): string {
  return JSON.stringify(loadAll(storage), null, 2);
}

export type ImportResult = { ok: true; count: number } | { ok: false; error: string };

/** Parses and validates exported save text without writing anything. */
export function parseSaveText(text: string): ParseResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: "File is too large." };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }
  return parseSaveData(json);
}

/** Validates `text` and, only if fully valid, replaces all stored save data with it. */
export function importSave(text: string, storage: StorageLike | null = defaultStorage()): ImportResult {
  const result = parseSaveText(text);
  if (!result.ok) return result;
  writeAll(result.data, storage);
  return { ok: true, count: Object.keys(result.data.saves).length };
}
