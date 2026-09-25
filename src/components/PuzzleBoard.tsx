"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { getClueStatus, isCellLocked, nextCellState, type Tool } from "@/game/puzzleEngine";
import type { CellState, GameState, Puzzle } from "@/game/types";
import { useI18n } from "@/i18n/useI18n";
import { assetPath } from "@/lib/assetPath";
import styles from "./PuzzleBoard.module.css";

type Props = {
  puzzle: Puzzle;
  game: GameState;
  tool: Tool;
  getState: () => GameState;
  onSet: (cellId: number, value: CellState) => void;
  onClick: (cellId: number, tool: Tool) => void;
};

type Drag = { pointerId: number; from: CellState; value: CellState; lastId: number };

export default function PuzzleBoard({ puzzle, game, tool, getState, onSet, onClick }: Props) {
  const { t } = useI18n();
  const stateLabel: Record<CellState, string> = { empty: t.cellEmpty, filled: t.cellFilled, marked: t.cellMarked };
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [focusId, setFocusId] = useState(0);
  const imageUrl = `url("${assetPath(puzzle.image)}")`;

  // Static per-cell layout: region edges (thick lines) and reveal animation delay.
  const layout = useMemo(() => {
    const { width, height, cells } = puzzle;
    return cells.map((cell) => {
      const right = cell.col < width - 1 && cells[cell.id + 1].regionId !== cell.regionId;
      const bottom = cell.row < height - 1 && cells[cell.id + width].regionId !== cell.regionId;
      const region = puzzle.regions[cell.regionId].cells;
      const first = cells[region[0]];
      const delay = (cell.row - first.row + Math.abs(cell.col - first.col)) * 35;
      return {
        className: [
          cell.col === width - 1 ? styles.lastCol : "",
          cell.row === height - 1 ? styles.lastRow : "",
          right ? styles.edgeRight : "",
          bottom ? styles.edgeBottom : "",
        ].join(" "),
        style: {
          "--delay": `${delay}ms`,
          backgroundPosition: `${width > 1 ? (cell.col / (width - 1)) * 100 : 0}% ${
            height > 1 ? (cell.row / (height - 1)) * 100 : 0
          }%`,
        } as CSSProperties,
      };
    });
  }, [puzzle]);

  // End a drag even if the pointer is released outside the board.
  useEffect(() => {
    const end = () => {
      drag.current = null;
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  const cellIdAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cell]");
    if (!el || !boardRef.current?.contains(el)) return null;
    return Number(el.dataset.cell);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
    const id = cellIdAt(e.clientX, e.clientY);
    if (id === null) return;
    const from = getState().cells[id];
    const value = nextCellState(from, e.button === 2 ? "mark" : tool);
    drag.current = { pointerId: e.pointerId, from, value, lastId: id };
    // Touch pointers are implicitly captured by the pressed element; release so moves can hit other cells.
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setFocusId(id);
    onSet(id, value);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const id = cellIdAt(e.clientX, e.clientY);
    if (id === null || id === d.lastId) return;
    d.lastId = id;
    // Only paint cells that were in the same state as the starting cell (don't overwrite other marks).
    if (getState().cells[id] === d.from) onSet(id, d.value);
  };

  const moveFocus = (id: number) => {
    setFocusId(id);
    boardRef.current?.querySelector<HTMLElement>(`[data-cell="${id}"]`)?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: number) => {
    const { width, height } = puzzle;
    const row = Math.floor(id / width);
    const col = id % width;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dr, dc] = moves[e.key];
      const r = Math.min(height - 1, Math.max(0, row + dr));
      const c = Math.min(width - 1, Math.max(0, col + dc));
      moveFocus(r * width + c);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      moveFocus(row * width + (e.key === "Home" ? 0 : width - 1));
    } else if (e.key === "x" || e.key === "X") {
      e.preventDefault();
      onClick(id, "mark");
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      onSet(id, "empty");
    }
    // Enter / Space fall through to the button's native click (see onClick below).
  };

  return (
    <div
      ref={boardRef}
      className={`${styles.board} ${game.completed ? styles.complete : ""}`}
      style={{ "--cols": puzzle.width, "--rows": puzzle.height } as CSSProperties}
      role="group"
      aria-label={t.gridLabel(puzzle.width, puzzle.height)}
      aria-describedby="board-help"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      {puzzle.cells.map((cell) => {
        const state = game.cells[cell.id];
        const locked = isCellLocked(puzzle, game, cell.id);
        const status = getClueStatus(puzzle, game, cell.id);
        const { className, style } = layout[cell.id];
        const label = [
          t.cellPosition(cell.row + 1, cell.col + 1),
          cell.clue !== undefined ? t.cellClue(cell.clue) : null,
          status === "satisfied" ? t.clueSatisfied : status === "error" ? t.clueError : null,
          stateLabel[state],
          locked ? t.regionSolved : null,
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <button
            key={cell.id}
            type="button"
            data-cell={cell.id}
            data-state={state}
            data-clue={status}
            className={`${styles.cell} ${className} ${locked ? styles.revealed : ""}`}
            style={locked ? { ...style, backgroundImage: imageUrl } : style}
            tabIndex={cell.id === focusId ? 0 : -1}
            aria-label={label}
            aria-pressed={state === "filled"}
            aria-disabled={locked || undefined}
            onFocus={() => setFocusId(cell.id)}
            onKeyDown={(e) => handleKeyDown(e, cell.id)}
            onClick={(e) => {
              // Mouse/touch are handled on pointerdown; detail === 0 means keyboard or assistive tech.
              if (e.detail === 0) onClick(cell.id, tool);
            }}
          >
            {cell.clue !== undefined && <span className={styles.clue}>{cell.clue}</span>}
          </button>
        );
      })}
      <div
        className={styles.fullImage}
        style={{ backgroundImage: imageUrl }}
        aria-hidden="true"
        data-visible={game.completed}
      />
    </div>
  );
}
