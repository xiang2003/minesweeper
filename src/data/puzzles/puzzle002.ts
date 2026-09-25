import type { PuzzleDefinition } from "@/game/types";

const puzzle002: PuzzleDefinition = {
  id: "002",
  title: "Lighthouse",
  image: "images/puzzle-002.svg",
  clueRadius: 1,
  solution: [
    "....##....",
    "...####...",
    "..######..",
    ".########.",
    "##########",
    ".#......#.",
    ".#.##...#.",
    ".#.##.#.#.",
    ".#....#.#.",
    ".########.",
  ],
  clues: [
    "...3.53..0",
    "0...8.....",
    "..6...863.",
    ".68..9..6.",
    "....6.6.6.",
    "4.........",
    ".35.4..43.",
    ".3..4.2...",
    ".4655.5.4.",
    ".......5..",
  ],
  regions: [
    "AAAABBBBBB",
    "AAAABBBBBB",
    "AAAABBBBBB",
    "AAACCCCBBB",
    "AAACCCCBBB",
    "DDDCCCCEEE",
    "DDDCCCCEEE",
    "DDDDDEEEEE",
    "DDDDDEEEEE",
    "DDDDDEEEEE",
  ],
};

export default puzzle002;
