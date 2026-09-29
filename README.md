# Mosaic Puzzle

融合「數獨／踩地雷／圖片拼圖」概念的純前端益智遊戲。依照數字提示點亮格子，每解開一個 Region 就揭露該區域的圖片，全部解開後顯示完整圖片。

- Next.js 16（App Router、static export）+ React 19 + TypeScript
- 純 CSS Modules，無 UI library、無 backend
- 進度自動存在 `localStorage`，支援 JSON 匯出／匯入
- 可部署到 GitHub Pages

## 遊戲規則

- 數字 `N` 代表：以該格為中心的 `(2r+1)×(2r+1)` 範圍內（含自己）**剛好**有 `N` 格被點亮。`r` 由關卡資料決定，預設 1（3×3）。
- 數字**只計算自己所在 Region 內的格子**，跨過粗線的格子不算。每個 Region 因此是獨立的小謎題。（關卡可設定 `clueScope: "grid"` 改回跨區計算。）
- 左鍵／點擊：點亮或取消。右鍵或切換到 **Mark** 模式：標記「確定為空」（✕）。
- 按住拖曳可一次點亮或標記多格。
- 一個 Region 內每一格都要「確定」且正確：該點亮的點亮、該空白的標記為 ✕，只是留白不算。全部確定後該 Region 才會完成、鎖定，並顯示對應的圖片區塊。
- 提示數字狀態：已滿足（變淡）、錯誤（紅色＋波浪底線，點亮過多或剩餘空格不足）。
- 鍵盤：方向鍵移動、Space/Enter 點亮、X 標記、Delete 清除。

## 語言與遊戲說明

- 支援 **English / 繁體中文**。第一次進入首頁會先選擇語言，之後可在「設定」頁更改；尚未選擇時依瀏覽器語言自動判斷。
- 遊戲畫面右上角的 **?** 按鈕可隨時開啟遊戲說明（含圖例）；第一次進入遊戲時會自動顯示一次。首頁也有同樣的說明。
- 所有介面文字集中在 `src/i18n/strings.ts`。新增語言：在 `src/lib/preferences.ts` 的 `LANGS` 加上語言代碼，並在 `strings.ts` 補上一份對應的字串表（TypeScript 會檢查是否缺字）。
- 語言與「是否看過說明」存在 localStorage 的 `mosaic-puzzle-prefs`，與遊戲存檔分開；「清除所有資料」會一併清除。

## 背景音樂

- 音樂檔放在 `public/music/`，目前使用 `music1.mp3`（在 `src/components/BackgroundMusic.tsx` 的 `TRACK` 設定），會循環播放，換頁時不中斷。
- 預設音量 50%，可在「設定 → 音樂」調整；調到 0% 即停止播放。音量存在 `mosaic-puzzle-prefs`。
- 瀏覽器會阻擋未經互動的自動播放，因此音樂會在玩家第一次點擊或按鍵後開始。

## 安裝與開發

需要 Node.js 20.9 以上（建議 22）。

```bash
npm install        # 安裝
npm run dev        # 開發伺服器 http://localhost:3000
npm run lint       # ESLint
npm test           # Vitest 單元測試
npm run build      # production build + static export → out/
```

### Build / Export

`next.config.ts` 設定了 `output: "export"`，所以 `npm run build` 就會同時完成 export，產出純靜態檔案到 `out/`（Next.js 14 起已沒有獨立的 `next export` 指令）。

本機預覽 build 結果：

```bash
npm run build
npx serve out      # 以根路徑預覽（未設定 BASE_PATH 時）
```

## 部署到 GitHub Pages

專案已附 `.github/workflows/deploy.yml`：

1. 將 repo push 到 GitHub。
2. 在 repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
3. push 到 `main`（或在 Actions 頁面手動執行 *Deploy to GitHub Pages*）。
4. Workflow 會執行 lint、test、build，然後把 `out/` 發佈到 `https://<user>.github.io/<repo>/`。

### basePath 說明

GitHub Pages 的專案網站位於子路徑 `/<repo>`，因此 build 時需要設定 `BASE_PATH`：

```bash
BASE_PATH=/<repo> npm run build            # macOS / Linux
$env:BASE_PATH="/<repo>"; npm run build    # Windows PowerShell
```

> 在 Windows 的 Git Bash 中，`/<repo>` 會被自動轉成 Windows 路徑而造成 build 失敗，請改用 PowerShell，或在指令前加上 `MSYS_NO_PATHCONV=1`。

- Workflow 會自動設定 `BASE_PATH=/${{ github.event.repository.name }}`。
- 若 repo 是 `<user>.github.io` 或使用自訂網域，請把 workflow 中的 `BASE_PATH` 改成空字串。
- `next/link` 的路由與 `_next/` 資源會自動加上 basePath；CSS 背景圖這類 Next 不會改寫的路徑，一律透過 `src/lib/assetPath.ts` 加上前綴。
- `trailingSlash: true` 讓每個頁面輸出成 `xxx/index.html`，GitHub Pages 可直接對應 `/levels/`、`/play/001/` 等路徑，重新整理不會 404。
- 關卡頁 `/play/[id]` 透過 `generateStaticParams` 在 build 時為每個關卡產生 HTML，不需要 server。
- `public/.nojekyll` 讓 GitHub Pages 不以 Jekyll 處理（保留 `_next/` 目錄）。

> **Windows 注意事項**：Next.js 16 在 Windows 上 export 時，會把 prefetch 用的 segment 檔案（`__next.*.txt`）錯誤地寫成巢狀資料夾，導致瀏覽器請求 404。`npm run build` 後會自動執行 `scripts/fix-windows-export.mjs` 修正；在 Linux/macOS（包含 GitHub Actions）上這支 script 不做任何事。

## 專案結構

```text
src/
├── app/                      # 路由（全部可靜態輸出）
│   ├── page.tsx              # Home
│   ├── levels/page.tsx       # Level Select
│   ├── play/[id]/page.tsx    # 遊戲畫面
│   └── settings/page.tsx     # 匯出／匯入／清除資料
├── components/               # UI：GameScreen、PuzzleBoard、ProgressBar、SaveSettings…
│   └── useGame.ts            # 把 engine 接到 React state 與存檔
├── game/                     # 遊戲核心（不依賴 React，可單獨測試）
│   ├── types.ts              # 資料模型
│   ├── puzzleParser.ts       # 關卡定義 → 正規化 Puzzle
│   ├── puzzleEngine.ts       # 點擊、提示狀態、Region／Puzzle 完成、進度
│   ├── validator.ts          # 關卡資料驗證＋求解器（確認唯一解）
│   └── saveManager.ts        # localStorage 存取、匯出、匯入驗證
├── data/puzzles/             # 關卡資料
└── lib/                      # assetPath、useHydrated
public/images/                # 關卡圖片
```

**分工**：可變的遊戲內容（尺寸、Region、提示、提示範圍、圖片）都放在關卡資料；不變的規則放在 `puzzleEngine.ts`。Engine 內沒有寫死任何尺寸或 Region 數量。

## 新增關卡

1. 在 `public/images/` 放一張圖片（建議與 grid 同比例）。
2. 新增 `src/data/puzzles/puzzle003.ts`：

   ```ts
   import type { PuzzleDefinition } from "@/game/types";

   const puzzle003: PuzzleDefinition = {
     id: "003",
     title: { en: "My Level", "zh-Hant": "我的關卡" },  // 也可以只寫字串
     image: "images/puzzle-003.png",
     clueRadius: 1,          // 可省略，預設 1（3×3）
     clueScope: "region",    // 可省略，預設 "region"（只算同 Region）；"grid" = 跨 Region 計算
     solution: [ "#..#", ... ],  // "#" 點亮、"." 空白
     clues:    [ "?..2", ... ],  // "." 無提示；"?" 由解答自動計算；數字 = 明確指定（會被驗證）
     regions:  [ "AABB", ... ],  // 相同字元 = 同一個 Region，形狀不限
   };
   export default puzzle003;
   ```

3. 加到 `src/data/puzzles/index.ts` 的 `puzzleDefinitions`。
4. 執行 `npm test`：`validator.test.ts` 會檢查每個關卡的格式、提示是否與解答一致，以及**是否有唯一解**。

## 存檔格式

localStorage key：`mosaic-puzzle-save`，匯出檔名：`mosaic-puzzle-save.json`。

```json
{
  "version": 1,
  "saves": {
    "001": {
      "puzzleId": "001",
      "selectedCells": [9, 10, 13],
      "markedCells": [0, 1],
      "completedRegions": [0],
      "completed": false,
      "cleared": true,
      "updatedAt": 1790000000000
    }
  }
}
```

`cleared` 表示這關「曾經破解過」：重新開始只會清空盤面，不會清掉它，因此關卡選擇仍會顯示圖片，遊戲中也會出現「一鍵破解」按鈕；只有「清除所有資料」會移除。舊存檔沒有這個欄位時，`completed: true` 會視為已破解。

匯入時會完整驗證格式（版本、puzzle id、cell id 為不重複的非負整數、型別、檔案大小），任何一處不合法就整份拒絕，不會動到現有資料；未知欄位會被丟棄。載入進度時 Region／Puzzle 的完成狀態一律由 engine 重新計算，不直接信任存檔內容。

## 測試

`npm test` 執行 Vitest（Node 環境、無 DOM 依賴）：

- `puzzleEngine.test.ts`：點擊、提示狀態（正確／錯誤）、Region 完成與鎖定、Puzzle 完成、從存檔還原
- `saveManager.test.ts`：save／load／reset／reset all／export→import 往返／各種不合法存檔
- `validator.test.ts`：所有內建關卡格式正確且有唯一解
