import type { Lang } from "@/lib/preferences";
import type { LocalizedText } from "@/game/types";

/** All UI text. `zhHant` must provide every key of `en` (enforced by its type). */
const en = {
  langName: "English",
  appName: "Mosaic Puzzle",
  tagline: "Fill the grid by logic. Reveal the picture, one region at a time.",
  chooseLanguage: "Choose your language",
  back: "← Back",
  home: "← Home",
  backToHome: "Back to home",
  backToLevels: "Back to level select",
  settings: "Settings",
  cancel: "Cancel",

  // Home
  play: "Play",
  continueLevel: (id: string) => `Continue · Level ${id}`,
  levelSelect: "Level Select",
  settingsAndSave: "Settings & Save Data",
  mainMenu: "Main menu",

  // Levels
  levelTitle: (id: string, title: string) => `Level ${id} · ${title}`,
  levelMeta: (w: number, h: number, regions: number) => `${w}×${h} · ${regions} regions`,
  notStarted: "Not started",
  inProgress: (done: number, total: number) => `In progress · ${done}/${total} regions`,
  completed: "✓ Completed",
  levelAria: (id: string, title: string, w: number, h: number, status: string) =>
    `Level ${id}, ${title}, ${w} by ${h}, ${status}`,

  // Game
  level: (id: string) => `Level ${id}`,
  levelNotFound: "Level not found.",
  loadingPuzzle: "Loading puzzle",
  tool: "Tool",
  fill: "Fill",
  mark: "Mark",
  restart: "Restart",
  restartQuestion: "Clear this level?",
  howToPlay: "How to play",
  close: "Close",
  boardHelp: (size: number, regionOnly: boolean) =>
    `Each number = filled cells in its ${size}×${size} area${
      regionOnly ? ", counting only its own region (bold borders)" : ""
    }. Right-click or Mark mode marks a cell as empty.`,
  gridLabel: (w: number, h: number) => `Puzzle grid, ${w} columns by ${h} rows`,
  cellPosition: (row: number, col: number) => `Row ${row}, column ${col}`,
  cellClue: (clue: number) => `clue ${clue}`,
  clueSatisfied: "satisfied",
  clueError: "error",
  cellEmpty: "empty",
  cellFilled: "filled",
  cellMarked: "marked empty",
  regionSolved: "region solved",
  progress: "Progress",
  progressValue: (percent: number, filled: number, target: number) =>
    `${percent}%, ${filled} of ${target} cells filled`,
  regionsSolved: "Regions solved",
  announceRegion: (key: string, done: number, total: number) =>
    `Region ${key} solved. ${done} of ${total} regions complete.`,
  announceComplete: "Puzzle complete! The whole picture is revealed.",
  puzzleComplete: "Puzzle complete!",
  youRevealed: (title: string) => `You revealed “${title}”.`,
  nextLevel: "Next level →",
  allLevelsDone: "You finished every level.",
  playAgain: "Play again",

  // Settings
  settingsTitle: "Settings & Save Data",
  language: "Language",
  backup: "Backup",
  backupDesc:
    "Progress is saved automatically in this browser. Export it to a file to back it up or move it to another device.",
  exportSave: "Export Save",
  importSave: "Import Save",
  exported: (file: string) => `Exported ${file}.`,
  importFailed: (error: string) => `Import failed: ${error}`,
  importConfirm: (file: string, count: number) =>
    `“${file}” contains progress for ${count} level(s). Importing replaces all current progress.`,
  replaceAndImport: "Replace and import",
  imported: (count: number) => `Imported progress for ${count} level(s).`,
  reset: "Reset",
  resetDesc: "Delete all progress and settings stored in this browser. This cannot be undone.",
  resetAll: "Reset All Data",
  resetAllQuestion: "Delete all progress?",
  deleteEverything: "Delete everything",
  allDeleted: "All local game data was deleted.",

  // Help
  help: {
    goalTitle: "Goal",
    goal: "Fill the right cells to solve every region. Each solved region reveals its part of a hidden picture.",
    numbersTitle: "Numbers",
    numbers:
      "A number tells how many cells are filled in the 3×3 square around it, including its own cell.",
    regionRule:
      "Numbers only count cells in their own region. Cells across a bold border are ignored, even if they are filled.",
    diagramCaption: "The 2 counts only the highlighted cells. The filled cells on the right are in another region.",
    controlsTitle: "Controls",
    controls: [
      "Click / tap a cell to fill it. Click again to clear it.",
      "Right-click, or switch to Mark mode, to mark a cell you know is empty (✕).",
      "Press and drag to fill or mark several cells at once.",
      "Keyboard: arrow keys move, Space/Enter fills, X marks, Delete clears.",
    ],
    statesTitle: "Reading the board",
    stateFilled: "Filled",
    stateMarked: "Marked empty",
    stateSatisfied: "Number done (faded)",
    stateError: "Mistake (red, wavy line)",
    statesNote: "A red number means too many cells are filled, or not enough open cells are left.",
    regionsTitle: "Regions & progress",
    regions:
      "When every cell of a region is correct, the region locks and shows its piece of the picture. Solve all regions to see the whole image.",
    progressNote:
      "The progress bar shows filled cells ÷ cells to fill. Wrong fills count too, so 100% does not always mean solved.",
    savedNote: "Progress is saved automatically.",
    start: "Got it",
  },
};

export type Strings = typeof en;

const zhHant: Strings = {
  langName: "繁體中文",
  appName: "Mosaic Puzzle",
  tagline: "用邏輯填滿格子，一塊一塊揭開隱藏的圖片。",
  chooseLanguage: "選擇語言",
  back: "← 返回",
  home: "← 首頁",
  backToHome: "回到首頁",
  backToLevels: "回到關卡選擇",
  settings: "設定",
  cancel: "取消",

  play: "開始遊戲",
  continueLevel: (id) => `繼續 · 第 ${id} 關`,
  levelSelect: "選擇關卡",
  settingsAndSave: "設定與存檔",
  mainMenu: "主選單",

  levelTitle: (id, title) => `第 ${id} 關 · ${title}`,
  levelMeta: (w, h, regions) => `${w}×${h} · ${regions} 個區塊`,
  notStarted: "尚未開始",
  inProgress: (done, total) => `進行中 · ${done}/${total} 區塊`,
  completed: "✓ 已完成",
  levelAria: (id, title, w, h, status) => `第 ${id} 關，${title}，${w} 乘 ${h}，${status}`,

  level: (id) => `第 ${id} 關`,
  levelNotFound: "找不到這個關卡。",
  loadingPuzzle: "載入中",
  tool: "工具",
  fill: "點亮",
  mark: "標記",
  restart: "重新開始",
  restartQuestion: "清除本關進度？",
  howToPlay: "遊戲說明",
  close: "關閉",
  boardHelp: (size, regionOnly) =>
    `數字 = 周圍 ${size}×${size} 範圍內應點亮的格數${regionOnly ? "（只計算同一區塊，粗線為邊界）" : ""}。右鍵或「標記」模式可標記空格。`,
  gridLabel: (w, h) => `謎題格子，${w} 欄 ${h} 列`,
  cellPosition: (row, col) => `第 ${row} 列，第 ${col} 欄`,
  cellClue: (clue) => `數字 ${clue}`,
  clueSatisfied: "已滿足",
  clueError: "錯誤",
  cellEmpty: "空白",
  cellFilled: "已點亮",
  cellMarked: "已標記為空",
  regionSolved: "區塊已完成",
  progress: "進度",
  progressValue: (percent, filled, target) => `${percent}%，已點亮 ${filled} / ${target} 格`,
  regionsSolved: "已完成區塊",
  announceRegion: (key, done, total) => `區塊 ${key} 完成。已完成 ${done} / ${total} 個區塊。`,
  announceComplete: "謎題完成！整張圖片已揭露。",
  puzzleComplete: "謎題完成！",
  youRevealed: (title) => `你揭開了「${title}」。`,
  nextLevel: "下一關 →",
  allLevelsDone: "你已完成所有關卡。",
  playAgain: "再玩一次",

  settingsTitle: "設定與存檔",
  language: "語言",
  backup: "備份",
  backupDesc: "進度會自動儲存在這個瀏覽器。可以匯出成檔案備份，或搬到其他裝置。",
  exportSave: "匯出存檔",
  importSave: "匯入存檔",
  exported: (file) => `已匯出 ${file}。`,
  importFailed: (error) => `匯入失敗：${error}`,
  importConfirm: (file, count) => `「${file}」包含 ${count} 個關卡的進度。匯入後會取代目前所有進度。`,
  replaceAndImport: "取代並匯入",
  imported: (count) => `已匯入 ${count} 個關卡的進度。`,
  reset: "重設",
  resetDesc: "刪除這個瀏覽器中所有的進度與設定，無法復原。",
  resetAll: "清除所有資料",
  resetAllQuestion: "確定刪除所有進度？",
  deleteEverything: "全部刪除",
  allDeleted: "已刪除所有本機遊戲資料。",

  help: {
    goalTitle: "目標",
    goal: "點亮正確的格子，解開每一個區塊。每解開一個區塊，就會揭露隱藏圖片的一部分。",
    numbersTitle: "數字",
    numbers: "數字代表：以它為中心的 3×3 範圍內（包含自己那一格），應該點亮幾格。",
    regionRule: "數字只計算同一個區塊內的格子。粗線另一側的格子不算，就算已經點亮也一樣。",
    diagramCaption: "數字 2 只計算標示的格子；右邊點亮的格子屬於另一個區塊，不列入計算。",
    controlsTitle: "操作",
    controls: [
      "點一下格子即可點亮，再點一次取消。",
      "按右鍵，或切換到「標記」模式，可標記確定為空的格子（✕）。",
      "按住拖曳可一次點亮或標記多格。",
      "鍵盤：方向鍵移動、Space/Enter 點亮、X 標記、Delete 清除。",
    ],
    statesTitle: "看懂盤面",
    stateFilled: "已點亮",
    stateMarked: "標記為空",
    stateSatisfied: "數字已滿足（變淡）",
    stateError: "有錯誤（紅色波浪線）",
    statesNote: "數字變紅表示周圍點亮太多，或剩下的空格已經不夠。",
    regionsTitle: "區塊與進度",
    regions: "一個區塊的格子全部正確時，該區塊會鎖定並顯示對應的圖片。解開所有區塊即可看到完整圖片。",
    progressNote: "進度條 = 已點亮格數 ÷ 需點亮格數。點錯的格子也會計入，所以 100% 不一定代表完成。",
    savedNote: "進度會自動儲存。",
    start: "開始玩",
  },
};

export const STRINGS: Record<Lang, Strings> = { en, "zh-Hant": zhHant };

export function localize(text: LocalizedText, lang: Lang): string {
  return typeof text === "string" ? text : (text[lang] ?? text.en);
}
