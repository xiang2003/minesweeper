import type { PuzzleDefinition } from "@/game/types";

const puzzle001: PuzzleDefinition = {
  id: "001",
  title: "Sunrise",
  image: "images/puzzle-001.svg",
  clueRadius: 1,
  solution: [
    "........",
    ".##..##.",
    "########",
    "########",
    ".######.",
    "..####..",
    "...##...",
    "........",
  ],
  clues: [
    "..21.22.",
    ".5..4.5.",
    ".8....8.",
    ".8..9...",
    "....986.",
    "1.6.8.31",
    ".13....0",
    "0.1.2..0",
  ],
  regions: [
    "AAAABBBB",
    "AAAABBBB",
    "AAAABBBB",
    "AAAABBBB",
    "CCCCDDDD",
    "CCCCDDDD",
    "CCCCDDDD",
    "CCCCDDDD",
  ],
};

export default puzzle001;
