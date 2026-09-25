import type { PuzzleDefinition } from "@/game/types";

const puzzle001: PuzzleDefinition = {
  id: "001",
  title: "Sunrise",
  image: "images/puzzle-001.svg",
  clueRadius: 1,
  clueScope: "region",
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
    "35..3...",
    ".8....85",
    ".66.4...",
    "....453.",
    "1.6.5.3.",
    ".1.....0",
    "0.1.1..0",
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
