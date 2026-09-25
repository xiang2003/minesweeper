import type { PuzzleDefinition } from "@/game/types";

const puzzle002: PuzzleDefinition = {
  id: "002",
  title: { en: "Lighthouse", "zh-Hant": "燈塔" },
  image: "images/puzzle-002.svg",
  clueRadius: 1,
  clueScope: "region",
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
    ".0....3..0",
    "..3.6.....",
    "1.5...653.",
    ".6..66....",
    "....6...5.",
    ".........2",
    "334.2.043.",
    ".3..22..3.",
    ".4654.5.43",
    "...3...5.2",
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
