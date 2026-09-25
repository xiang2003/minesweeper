import type { Cell, Puzzle, PuzzleDefinition, Region } from "./types";

/** Ids of cells within `radius` (Chebyshev distance) of (row, col), including the cell itself. */
export function neighborhood(
  row: number,
  col: number,
  width: number,
  height: number,
  radius: number,
): number[] {
  const ids: number[] = [];
  for (let r = Math.max(0, row - radius); r <= Math.min(height - 1, row + radius); r++) {
    for (let c = Math.max(0, col - radius); c <= Math.min(width - 1, col + radius); c++) {
      ids.push(r * width + c);
    }
  }
  return ids;
}

/**
 * Converts a compact `PuzzleDefinition` into the normalized `Puzzle` model.
 * Throws on structural problems (wrong row lengths, bad characters).
 * Semantic checks (clues match the solution, unique solution) live in validator.ts.
 */
export function parsePuzzle(def: PuzzleDefinition): Puzzle {
  const height = def.solution.length;
  const width = def.solution[0]?.length ?? 0;
  const clueRadius = def.clueRadius ?? 1;

  if (width === 0 || height === 0) throw new Error(`Puzzle ${def.id}: empty grid`);
  if (!Number.isInteger(clueRadius) || clueRadius < 0) {
    throw new Error(`Puzzle ${def.id}: clueRadius must be a non-negative integer`);
  }
  for (const [name, rows] of [
    ["solution", def.solution],
    ["clues", def.clues],
    ["regions", def.regions],
  ] as const) {
    if (rows.length !== height || rows.some((row) => row.length !== width)) {
      throw new Error(`Puzzle ${def.id}: "${name}" must be ${height} rows of ${width} characters`);
    }
  }

  const regionIds = new Map<string, number>();
  const regions: Region[] = [];
  const cells: Cell[] = [];
  const solution: boolean[] = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const id = row * width + col;

      const sol = def.solution[row][col];
      if (sol !== "#" && sol !== ".") {
        throw new Error(`Puzzle ${def.id}: invalid solution char "${sol}" at ${row},${col}`);
      }
      solution.push(sol === "#");

      const key = def.regions[row][col];
      let regionId = regionIds.get(key);
      if (regionId === undefined) {
        regionId = regions.length;
        regionIds.set(key, regionId);
        regions.push({ id: regionId, key, cells: [] });
      }
      regions[regionId].cells.push(id);

      const clueChar = def.clues[row][col];
      if (clueChar !== "." && clueChar !== "?" && !/^[0-9]$/.test(clueChar)) {
        throw new Error(`Puzzle ${def.id}: invalid clue char "${clueChar}" at ${row},${col}`);
      }
      const hasClue = clueChar !== ".";
      cells.push({
        id,
        row,
        col,
        regionId,
        // "?" is filled in below from the solution; digits are kept as written (validator checks them).
        clue: hasClue && clueChar !== "?" ? Number(clueChar) : undefined,
        neighbors: hasClue ? neighborhood(row, col, width, height, clueRadius) : [],
      });
    }
  }

  for (const cell of cells) {
    if (cell.neighbors.length > 0 && cell.clue === undefined) {
      cell.clue = cell.neighbors.filter((n) => solution[n]).length;
    }
  }

  return {
    id: def.id,
    title: def.title,
    image: def.image,
    width,
    height,
    clueRadius,
    cells,
    regions,
    solution,
  };
}
