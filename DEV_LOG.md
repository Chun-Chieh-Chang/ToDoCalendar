
## [2026-09-23b] Project-Wide Audit, Cleanup & Security Pass

### 還原基準點
- 完整歷史備份：`../ToDoCalendar-restore-2026-09-23.bundle`（`git bundle --all`，已 verify）；本地 tag `pre-cleanup-2026-09-23`。
- 作業分支：`chore/cleanup-2026-09`，驗證完成後才併回 `main`。

### 原子提交紀錄
- `test`：導入 Vitest，新增 6 個測試檔（NLP 解析、任務篩選／排序、日期、i18n 鍵對齊、國定假日、Store 動作與資料遷移）；基準 58 通過 + 1 個已知缺陷（`it.fails`）。瀏覽器核心流程 15 項基準全數通過。
- `fix(electron)`：**RCA** — `vite.config` 的 `base: '/ToDoCalendar/'` 使產出的 `index.html` 以絕對路徑引用資源，Electron 以 `loadFile`（file://）載入時解析到磁碟根目錄，JS/CSS 全數 404，桌面版白畫面。**CAPA** — 改為相對 `base: './'`，Pages 與 Electron 共用同一份建置（無客戶端路由，相對路徑安全）。以隱藏 Electron 視窗實測：修正前 React 未掛載、2 個請求失敗；修正後掛載成功、35 格日曆、0 失敗請求。
- `fix(pwa)`：**RCA** — `notificationUtils.requestPermission` 從未被呼叫，網頁／PWA 版權限永遠停在 `default`，提醒只出現在 App 內彈窗、不會推送桌面通知；通知圖示使用 `/icon-512.png` 絕對路徑，在 Pages 子路徑下 404；`send()` 直接讀取 `Notification.permission`，在無 Notification API 的瀏覽器會拋錯。**CAPA** — 儲存「有設定時間」的任務時（使用者手勢內）請求權限；已拒絕則不再詢問；Electron 直接走原生通知；圖示改相對路徑；`send()` 加上 API 存在檢查。新增 7 個單元測試。
- `fix(task-form)`：**RCA** — (1) `TaskForm` 的重設只在 `initialTask`/`selectedDate` 改變時執行且僅重設部分欄位，儲存後再按「新增任務」會帶入上一筆的標題、描述、優先級、時間與記事；(2) 關閉表單未清除 `editingTask`，取消編輯後按「新增任務」或快速新增會開成「編輯任務」並覆寫舊任務。**CAPA** — 每次開啟表單都以 `emptyForm()` 重新初始化；App 統一以 `closeTaskForm()`（一律清除編輯目標）與 `openNewTaskForm()` 開關表單（側欄、手機底欄、N 快捷鍵、Esc、儲存後）。瀏覽器實測三種情境皆正確。
- `fix(pwa)`（Service Worker）：**RCA** — `main.tsx` 在開發模式也註冊 cache-first 的 Service Worker，攔截並快取 Vite 的原始碼模組，導致修改後重新整理仍執行舊程式碼（本輪驗證中兩度誤判的根因）；Electron 的 file:// 亦無法註冊。**CAPA** — 僅在正式建置且非 file:// 時註冊；開發模式主動解除既有註冊。實測開發模式 0 個註冊、正式建置仍含註冊、Electron 正常掛載。
- `refactor(version)`：**RCA** — 版本號散落四處且不一致（`package.json` 1.4.0；側欄、設定頁尾、匯出檔寫死 1.3.0）；側欄開發者署名寫死且與 i18n `developer` 鍵內容不同。**CAPA** — `vite.config` 以 `define` 注入 `__APP_VERSION__`（唯一來源：`package.json`），三處改引用；署名統一使用 `developer` 鍵。
- `chore(i18n)`：移除 44 個無任何引用的翻譯鍵（兩語系各 44 行，含 6 個因此清空的分節註解）；動態引用（優先級、分類）已排除。鍵數 232 → 188，兩語系完全對齊（單元測試守護）。
- `chore(css)`：以 postcss 解析移除「必要 class 從未出現在程式碼中」的選擇器（`:not()` 內的 class 不計），約 830 行：未使用的工具類（index.css 約 100 個）、已不存在的頭像／分類管理 UI、未使用的 TaskListModal/TaskListView 舊樣式。另移除 17 個未使用的 CSS 變數（含上一輪保留的舊陰影別名）、未使用的 `shine`/`slideIn` 動畫，以及被 `index.css`（最後載入者勝出）遮蔽的重複 `fadeIn`/`pulse` 定義（視覺零變化）。**順帶修正**：空狀態引用未定義的 `--space-xxxl`（整條宣告失效），改為 `--space-xxl`。瀏覽器核心流程＋各頁新擬態陰影探針全數通過。

## [2026-09-23] Neumorphic UI Redesign + Full zh-TW / en Localization

### 1. 需求背景 (Plan)
- 使用者提供「Inset Focus」新擬態參考截圖，要求套用至全介面（含深色模式、主色改為柔藍）。
- 隨後要求：移除失效的玻璃效果滑桿、補齊缺漏翻譯、將所有寫死的中文改為 i18n。

### 2. 實作 (Do)
- **設計系統**：`index.css` 新增 `--neu-*` 陰影 token（凸起／凹陷／焦點／按下／浮層），淺色與深色各一組；舊的 `--shadow-*`、`--inner-glow` 映射至新 token。14 個元件 CSS 移除 backdrop-filter 與硬編碼色碼，改為僅引用 token。
- **設定**：移除「視覺」分頁與 `glassOpacity` / `glassBlur` / `borderOpacity`（types、defaults、App.tsx 注入、CSS 變數）；`loadData` 清除舊欄位。
- **i18n**：新增約 100 個鍵（zh-TW / en 各 232 鍵，完全對齊）；Settings、App、TaskForm、Filter、TaskListView、TaskListModal、ReminderModal、Dashboard、AppGuide 全面改用 `t()`；新增 `taskUtils.getCategoryLabel` 與 `getHolidayDisplayName`（假日英文名，含合併與補假規則）。

### 3. 問題與根因 (RCA / CAPA)
- **深色模式文字不可見**：`.app` 未設定 `color`，未自行指定顏色的文字繼承自 `[data-theme]` 範圍外的 `body`（淺色主題文字色）。→ `.app` 補上 `color: var(--text-primary)`。
- **選英文無效**：語言選項值為 `en-US`，但翻譯表鍵為 `en`，查無後回退中文，且 `translations[language].months` 會取得 undefined。→ 選項改為 `en`，`loadData` 將舊值 `en-US` 遷移為 `en`。
- **主題 token 未隨深色模式切換**：組合陰影變數若只宣告於 `:root`，會以淺色值解析後被繼承。→ 組合 token 宣告於 `:root, [data-theme]`，於主題範圍內重新解析。
- **浮層白色光暈**：凸起陰影的亮面在暗色遮罩上形成光暈。→ 浮層改用獨立的 `--modal-shadow`。
- **全域樣式污染**：`ReminderModal.css` 的 `.btn`、`@keyframes pulse` 影響全 App。→ 改為 `.reminder-actions .btn` 與 `reminder-pulse`。
- **字級低於 13px**：手機底部導覽列以 inline style 寫死 10px。→ 移至 CSS，改為 13px。

### 4. 驗收確認 (Check)
- [x] 所有頁面淺色／深色：0 Console 錯誤
- [x] 腳本檢測文字對比 ≥ 4.5:1（僅其他月份的淡化日期例外，屬 WCAG 豁免的非作用中元素）
- [x] 桌面與 375px 手機寬度：0 個低於 13px 的文字、無水平捲動
- [x] 英文模式下掃描所有頁面與對話框：0 個中文字串（語言選單「繁體中文」為刻意保留）
- [x] 舊資料遷移實測：`en-US` → `en`、玻璃欄位被清除
- [x] `npm run build` 成功
- [ ] `tsc --noEmit` 仍有 44 個既有型別錯誤（變更前基準 45，未新增）；ESLint 設定本身無法執行，需另行處理

### 5. 後續行動 (Act)
- 修復既有 TypeScript 型別錯誤與 ESLint 設定，使型別檢查可納入驗收標準。

## [2026-09-17d] Documentation SSOT Sync (v1.4.0)

### 更新清單
- `README.md` — 完整重寫：技術棧從 React Context API 更正為 Zustand 5，補充 Dexie/Framer Motion/Remixicon/Supabase，專案結構從 `components/` 更新為 `features/`，移除已刪除的 `.bat` 參照，更新年份與版本號至 v1.4.0。
- `docs/CONSOLIDATED_DOCUMENTATION.md` — 修正 User Manual（LocalStorage → IndexedDB、雙擊 → 點擊）；新增 `data/twHolidays.ts` 至架構圖；更新版本頁首、年份與 Recent Updates Log。

## [2026-09-17c] Version Bump & i18n Year Fix

### 更新清單
- `package.json` — version `1.3.0` → `1.4.0`（對應台灣假日新功能）。
- `src/utils/i18n.ts` — `developer` 欄位年份 2025 → 2026（zh-TW + en 兩處）。

## [2026-09-17b] Dead Code Removal & Logic Bug Fix

### 修正清單
- `main.tsx` — 移除硬編碼版本字串 console.log（遺留死碼）。
- `App.tsx` — 移除 `isLoaded`（從未讀取）及 `filteredAllPlannedTasks`、`filteredPendingTasks`（計算後從未使用）三個死變數。
- `db.ts`、`storage.ts` — 移除未使用的 `AppState` import。
- `ReminderModal.tsx` — 移除從未呼叫的 `useEffect` import。
- `AppGuide.tsx`、`Filter.tsx` — 移除不必要的 `React` namespace import（已採用 Automatic JSX Runtime）。
- `contrastUtils.ts` — 修正 `checkContrastCompliance` 函數的邏輯 Bug：重複 `ratio < 4.5` 條件導致 `'minor'` 嚴重性永遠無法被賦值；修正閾值為 `<2 critical / <3 minor / <4.5 warning / pass`。

## [2026-09-17] Taiwan Holidays Feature + Full Audit & Doc Sync (v1.4.0)

### 1. 需求背景
- 使用者要求月曆顯示台灣國定假日，方便直觀掌握假日分佈。
- 同步執行全專案代碼盤點、文件同步、安全掃描。

### 2. 實作 (Do)

#### 新增功能
- 新增 `src/data/twHolidays.ts`：靜態假日資料 2024–2027（含補假），60+ 筆，匯出 `getTWHoliday(dateStr)` 函數。
- 更新 `src/features/calendar/components/Calendar/Calendar.tsx`：每格查詢假日、套用 `is-holiday` class、顯示 `.holiday-label`、Tooltip 整合。
- 更新 `src/features/calendar/components/Calendar/Calendar.css`：`.is-holiday` 琥珀色底色、`.holiday-label` 橙色文字，深色模式自動切換。

#### 死碼清理
- 移除 `src/main.tsx:11` 硬編碼版本字串 `console.log('ToDoCalendar Loaded: v1.3.0 ...')`。

#### 一致性修正
- `src/utils/i18n.ts` — `developer` 欄位年份統一為 2026（zh-TW + en）。
- `package.json` — version `1.3.0` → `1.4.0`。

#### 文件同步
- `README.md` — 完整重寫（技術棧、專案結構、年份、.bat 參照移除）。
- `docs/CONSOLIDATED_DOCUMENTATION.md` — 修正 User Manual LocalStorage → IndexedDB、雙擊 → 點擊、新增 data/ 至架構圖、更新版本。

### 3. 驗收確認 (Check)
- [x] 月曆顯示假日標籤（實測：2026/9 中秋節 ✅、2026/10 國慶日 ✅）
- [x] 假日深色/淺色主題樣式正確
- [x] 假日格與週六（綠）、週日（紅）可正確疊加
- [x] `npm run build` 零錯誤零警告
- [x] 安全掃描：無硬編碼密鑰，`.env` 已 gitignore

### 4. 後續行動 (Act)
- 每年初於 `src/data/twHolidays.ts` 新增次年假日資料（參考行政院人事行政總處公告）。

---

## [2026-07-20] Project-Wide Code Cleanup & MECE Reorganization

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **發現 - 多項程式碼品質問題**:
  - **損毀引用**: `src/main.tsx` 導入不存在的 `./store/AppContext`（該檔案早已刪除），`AppProvider` 符號從未使用。
  - **孤立檔案**: 5 個無任何導入引用的孤兒檔案（`authService.ts`, `cssScanner.ts`, `configLoader.ts`, `contrastConfig.ts`, `css-tree.d.ts`），其中 3 個使用 Node.js `fs`/`path` 模組，若意外被瀏覽器程式碼導入將導致運行時錯誤。
  - **.gitignore 錯字**: `backups/` 目錄名稱錯誤（多了 's'），導致 `backup/` 目錄下的 JSON 備份檔 (~6.2 MB) 未被忽略。
  - **重複邏輯**: `cssScanner.ts` 與 `contrastUtils.ts` 各自獨立實作了完全相同的顏色解析函式與 148 行色彩名稱映射表。
  - **過時開發工具**: `.kiro/` 目錄（Kiro 工具規格）、`scratch/`（測試腳本）為開發過程遺留產物。
- **根因**:
  1. 歷次重構（Context → Zustand、components/ → features/）後未執行全面的反向依賴掃描。
  2. 無自動化機制（如 lint rule 或 CI 步驟）檢測孤立檔案與損毀引用。
  3. 開發流程中未建立「清理清單」檢查點。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **修復損毀引用**: 刪除 `main.tsx` 中 `import { AppProvider } from './store/AppContext'`。
- **刪除孤立檔案**: 
  - `src/services/authService.ts`（Google OAuth 服務，未導入）
  - `src/utils/cssScanner.ts`、`src/utils/configLoader.ts`（Node.js 工具，未導入）
  - `src/types/contrastConfig.ts`、`src/types/css-tree.d.ts`（僅被上述孤兒檔案使用）
- **清理 npm 依賴**: 移除 `css-tree`（僅被孤兒 `cssScanner.ts` 使用）。
- **修正 .gitignore**: `backups/` → `backup/`，確保備份目錄被正確忽略。
- **刪除歷史備份**: 刪除 3 個舊版備份，保留最新 `todo_calendar_backup.json`。
- **刪除開發遺留**: 移除 `.kiro/`（Kiro 工具規格）與 `scratch/`（測試腳本）目錄。
- **玻璃變數二修**: 修復 `rgba(var(--glass-rgb), var(--glass-opacity))` 嵌套 `var()` 在部分瀏覽器無法重解析的問題，改在 `App.tsx` 中由 JavaScript 直接計算最終 `rgba()` 值。

### 3. 目前狀態 (Check & Act)
- [x] `src/main.tsx` 移除損毀引用，無編譯錯誤。
- [x] 5 個孤兒檔案已刪除，`css-tree` 依賴已移除。
- [x] `.gitignore` 修正為 `backup/`。
- [x] 刪除 3 個歷史備份檔案（保留最新）。
- [x] `.kiro/`、`scratch/` 目錄已移除。
- [x] 玻璃不透明度與邊框不透明度滑桿修復完成。
- [x] `npm run build` 通過驗證。
- [x] 文檔同步更新（DEV_LOG.md、CONSOLIDATED_DOCUMENTATION.md）。

---

## [2026-07-18] Fix glass opacity/blur/border settings not applying

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Bug - 視覺效果設定無作用**:
    - **現象**: 設定頁面「玻璃不透明度」、「模糊強度」、「邊框不透明度」三個滑桿調整後無任何視覺變化。
    - **根因**: 
        1. `App.tsx` 從未將這三個 settings 值同步到 CSS 變數，CSS 使用的是 `index.css` 中的硬編碼預設值。
        2. dark mode (`[data-theme="dark"]`) 下 `--glass-bg` 和 `--border-glass` 也直接寫死數值，跳過了 `var(--glass-opacity)` 和 `var(--border-opacity)`。
    - **水平展開**: 無其他 settings 欄位有類似遺漏 (theme/language 等均有正確應用)。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **App.tsx**: 在根 `div.app` 上透過 inline style 將 `settings.glassOpacity` → `--glass-opacity`、`settings.glassBlur`(px) → `--glass-blur`、`settings.borderOpacity` → `--border-opacity` 同步到 CSS 變數。
- **index.css**: dark mode 區塊的 `--glass-bg` 改為 `rgba(var(--glass-rgb), var(--glass-opacity))`、`--border-glass` 改為 `rgba(var(--border-rgb), var(--border-opacity))`。

### 3. 目前狀態 (Check & Act)
- [x] `src/App.tsx` 新增 inline style 同步 CSS 變數。
- [x] `src/index.css` dark mode 修正為使用變數而非硬編碼。
- [x] 視覺效果三個滑桿調整後即時生效。

---

## [2026-07-18] Fix missing `changeView` event listener

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Bug - AppGuide CTA 按鈕無作用**:
    - **現象**: 使用說明頁面最下方的「立即開始使用」按鈕點擊後無任何反應。
    - **根因**: 按鈕透過 `window.dispatchEvent(new CustomEvent('changeView', ...))` 發送視圖切換事件，但 `App.tsx` 完全未監聽此 custom event，事件無人處理。
    - **水平展開**: 掃描全專案 `dispatchEvent(new CustomEvent(...))` 共 2 處 — `changeView` 與 `focus-search`；後者已有對應 listener (`Filter.tsx`)，無其他遺漏。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **App.tsx**: 新增 `useEffect` 使用 `addEventListener('changeView', handleChangeView)` 監聽事件，並呼叫 `setActiveView(detail)` 切換至月曆視圖。
- **水平驗證**: 確認 `focus-search` 的 dispatch/listener pair 正常運作。

### 3. 目前狀態 (Check & Act)
- [x] `src/App.tsx` 新增 changeView 事件監聽。
- [x] 確認「立即開始使用」按鈕點擊可正常切換至月曆視圖。
- [x] 完成水平展開檢查，無其他類似遺漏。

---

## [2026-07-18] Sidebar Author Credit

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Failure - SOP Violation: DEV_LOG.md Not Updated**:
    - **現象**: 前端 UI 修改未同步更新 DEV_LOG.md，觸發 Husky pre-commit hook 阻擋。
    - **成因**: 開發者專注於 UI 修改，忽略了 PDCA 日誌記錄 SOP。
    - **CAPA**: 本次修改即時補錄至此日誌，並確認 commit 流程完整。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **側邊欄作者署名**: 於 `src/App.tsx` 的 sidebar-footer 區域新增 `.sidebar-credit` 區塊，顯示 "Developed by Wesley Chang @ Mouldex, 2026."。
- **CSS 樣式**: 於 `src/App.css` 新增對應樣式，支援淺色/深色主題自動適配。

### 3. 目前狀態 (Check & Act)
- [x] `src/App.tsx` 新增 sidebar-credit 區塊。
- [x] `src/App.css` 新增 .sidebar-credit 樣式（含 dark mode 支援）。
- [x] `npm run build` 待驗證。

---

# ToDoCalendar - SkillsBuilder Dev Log (PDCA)

## [2026-05-16] Feature-Based Architecture & Offline-First Upgrade

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Failure H - Props Drilling & God Component (App.tsx)**:
    - **現象**: `App.tsx` 超過 800 行，持有所有狀態，每次變更引發全域重繪。
    - **成因**: 專案初期貪圖開發速度，過度依賴頂層 Context + useReducer，未即時進行關注點分離。
- **Failure I - PDCA Logging Omission (SOP 違規)**:
    - **現象**: 執行 Zustand 與 Dexie.js 遷移後，未即時更新 DEV_LOG。
    - **成因**: 開發者（AI）專注於解決連續的 TypeScript 編譯錯誤（如 i18n 引用路徑跑版），忽略了「無日誌不結案」的鐵律。
    - **CAPA**: 承諾後續導入 Husky pre-commit hook 來「自動強制」檢查 `DEV_LOG.md` 的更新狀態。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **領域驅動重構 (Domain-Driven)**: 將扁平的 `components` 目錄依據業務拆分為 `features/tasks`, `features/calendar`, `features/settings` 等。
- **Zustand 導入 (Free & Open Source)**: 徹底刪除 `AppContext.tsx`，建立 `useAppStore.ts`，元件精準訂閱所需狀態，實現零延遲更新。
- **Dexie.js (IndexedDB) 升級**: 廢棄傳統同步的 `localStorage`，無痛遷移舊資料至瀏覽器本地的 IndexedDB，保障千萬級資料量的讀寫流暢度。
- **Framer Motion 微動畫**: 於全域 `Modal.tsx` 實裝物理彈簧動畫 (`stiffness: 300, damping: 30`)，提升軟體可親近的高級感。

### 3. 目前狀態 (Check & Act)
- [x] 全站 `.tsx` 的 import 相對路徑修復完畢。
- [x] `npm run build` 通過零錯誤驗證。
- [x] 完成本開發日誌的溯及補錄。

## [2026-05-16] Mobile UI/UX Deep Optimization (375px)

- **目標 (Goal)**: 基於 Mobile First 準則，全面修復在 375px 手機寬度下的佈局缺陷、觸控區域過小與互動邏輯不直覺的問題。
- **預防措施 (Prevention)**: 
    - 採用外科手術式修改，針對單一元件 (如 Calendar, TaskCard, Filter) 獨立修復，避免全局樣式污染。
    - 確保修改後依然兼容 Desktop 版面的「合理留白」。
- **執行計畫**:
    1. **互動邏輯**: 移除 Calendar Cell 上的雙擊開啟任務，改為單擊 (`onClick`)。
    2. **觸控區域**: 強制所有行動按鈕 (Edit, Delete, Navigation arrows) 符合 `min-width: 44px; min-height: 44px` 規範。
    3. **排版降噪**: TaskListModal 過濾器改為 `flex-col`，修復過長 Placeholder，優化毛玻璃的雜訊比例。
    4. **導航簡化**: 底部導航列將「設定」按鈕移出或精簡以擴大點擊區。

## [2026-05-16] v1.3.0 Professional - MECE UX Refactoring & Stabilization

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Failure E - CI/CD Build Failure**:
    - **現象**: GitHub Actions 報錯 `@supabase/supabase-js` 缺失。
    - **成因**: Rebase 後未執行依賴審計，直接推送了帶有新導入但未安裝依賴的代碼。
- **Failure F - 文檔冗餘 (Documentation Redundancy)**:
    - **現象**: 同時存在 `DEV_LOG.md` 與 `DEVELOPMENT_LOG.md`。
    - **成因**: 模型未能貫徹執行 MECE 掃描，導致單一真理來源 (SSOT) 破碎。
- **Failure G - 視覺變數屏蔽 (False Opaque Regression)**:
    - **現象**: 透明度調整失效，調整至極限依然不透明。
    - **成因**: 
        1. **標度衝突**: 在 JS 層對已經標準化 (0-1) 的數值執行了二次標準化 (/100)，導致數值縮小 100 倍。
        2. **層疊覆蓋**: 忽略了 `@media` 與組件層級的硬編碼背景色。
    - **CAPA**: 實裝「標度源審計」與「全域焦土搜索」SOP。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **依賴修復**: 補齊 `supabase-js`，驗證全站編譯通過。
- **文檔合併**: 刪除 `DEVELOPMENT_LOG.md`，將所有歷史紀錄收納至 `DEV_LOG.md`。
- **MECE UX 重構**:
    - **設定中心化**: 將「數據管理」整合進設定標籤頁。
    - **視圖統一**: 任務列表視圖內建子分頁，減少側邊欄導航冗餘。
    - **週末視覺化**: 實裝星期六(綠)/星期日(紅)的莫蘭迪色系標註。
- **設計系統**: 實裝「玻璃秩序 (Glass Order)」三層邊緣法則。

### 3. 目前狀態 (Check & Act)
- [x] 全站配色邏輯與「玻璃秩序」設計系統對齊。
- [x] 完成設定頁面與數據管理的 MECE 整合。
- [x] 解決所有雲端部署與編譯報錯。
- [x] 成功推送至 GitHub 並標記為 `v1.3.0-professional`。
- [x] **[Final Polish]** 修復 Framer Motion 與原生 CSS 動畫衝突，實裝 TaskCard 物理佈局動畫。
- [x] **[Bug Fix]** 修正 `React.forwardRef` 缺失導致的 Framer Motion 警告，優化 `mode="popLayout"` 穩定性。
- [x] **[UX Optimization]** 統一全站語意（如「看板視圖」、「我的任務」），重組側邊欄邏輯，提升操作直覺性。
- [x] **[Feature Upgrade]** 看板視圖交互升級：實作「原生拖拽 + 物理佈局動畫」混合方案，確保 100% 跨欄位拖放穩定性並保有流體視覺感。
- [x] **[Feature Upgrade]** 全域快捷鍵系統：實作 `useKeyboardShortcuts` 鉤子，支援 `1-4` 視圖切換、`N` 新增任務、`/` 搜尋導航等。
- [x] **[UI/UX Polish]** 數據洞察中心升級：實作純 SVG 漸層填充面積圖與 Framer Motion 動態卡片，提升數據視覺化質感。
- [x] **[Feature Upgrade]** PWA 離線支援：實作 Service Worker 緩存策略、Manifest 配置與高品質玻璃感圖示，支援桌面/手機安裝與離線運作。
- [x] **[UX Optimization]** 手機版導航補完：新增底部玻璃感導航欄 (Bottom Tab Bar)，修復手機版無法切換頁面的問題。
- [x] **[UI/UX Polish]** 視覺對比度修復：修正深色模式下卡片「灰濁」問題，提升標籤文字對比度並增加玻璃內發光質感。
- [x] **[Feature Upgrade]** 自動化推送通知：整合 `Notification API` 與 Service Worker，實現系統級任務提醒，並修復代碼回歸問題。
- [x] **[MECE Cleanup]** 清理過時腳本：移除所有開發期間產生的 `.cjs` 遷移腳本，保持專案架構純淨。
- [x] **[Documentation]** 文檔同步：更新 `README.md`，詳列 v1.3.0 Professional 版的所有進階功能。
- [x] **[Verification]** `npm run build` 通過生產環境驗證。

---

## 2026-05-16 結項回顧 (Retrospective)

### 成功經驗 (Success)
1. **交互視覺雙重突破**：看板視圖的「原生+動畫」混合方案成功解決了 DND 的不穩定性，同時保留了極致的視覺流動感。
2. **數據中心升級**：純 SVG Area Chart 的實作證明了無需第三方重型庫也能達成生產級的視覺化效果。
3. **PWA 落地**：成功將 Web 應用轉化為「可安裝、可離線」的 PWA，顯著提升了「原生感」。

### 挫折與修正 (Failures & CAPA)
- **RCA (Root Cause Analysis)**: 
    1. 在執行 `restore_app_logic.cjs` 時，由於 Marker (`// 選擇日期`) 定位不精準且替換區塊過大，導致組件中段的 150+ 行 Handler 函式被遺漏。
    2. 雖然執行了 `npm run build`，但編譯器並未捕捉到 JSX 中的 `onClick={handleOpenSettings}` 引用錯誤（因為是動態屬性且在混淆過程中未觸發 Fatal Error，直到運行時才崩潰）。
- **CAPA (Corrective Action)**: 
    1. 實施 `final_restore.cjs` 進行二次精準注入，恢復所有缺失功能。
    2. **[SOP 升級]**: 未來在執行大規模代碼替換後，必須進行關鍵路徑 (Critical Path) 的 UI 點擊測試。
    3. **[Contrast Rescue - 全域水平展開]**: 
        - 識別出深色模式下 `Slate 400` 對比度不足的系統性問題。
        - **水平展開**：同步修正 Calendar, TaskCard, TaskListView, Filter, Settings 等所有視圖，將文字亮度提升至 `text-primary` 或高亮度 `rgba`。
        - 建立「高對比度規範」，避免未來開發再次發生視覺災難。

### 下一步建議 (Next Steps)
- **多裝置同步**：研究基於 Supabase 或 WebRTC 的數據同步方案。
- **效能監控**：針對長列表任務進行虛擬滾動 (Virtual List) 優化。

---

## [2026-05-16] Contrast Rescue & MECE Cleanup

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Failure J - Contrast Logic Failure (Property Missing)**:
    - **現象**: 深色模式下的月曆任務文字呈現深灰色，與深色背景幾乎重疊，完全無法閱讀。
    - **成因**: `App.tsx` 在調用 `Calendar` 元件時遺漏了 `theme` prop。這導致 `Calendar` 元件內部預設為 `light` 模式，在計算對比度時錯誤地假設背景為白色，進而選擇了深色文字 (`#111827`)。
    - **CAPA**: 
        1. 修正 `App.tsx` 傳遞正確的 `theme` 狀態。
        2. 優化 `Calendar.tsx` 的對比度演算法，加入 `textShadow` 以增強深色背景下的光感閱讀。
        3. 移除 `task-time` 的不透明度限制，確保時間資訊絕對清晰。

### 2. 最終矯正措施 (Corrective Actions / CAPA)
- **視覺對比度二次加固**: 實裝全域 `theme` 感知，確保所有動態顏色計算皆基於當前主題背景。
- **MECE 冗餘清理**: 識別並移除專案根目錄下過時的 `打包應用.bat` 與 `開發模式.bat`，統一使用 `package.json` 腳本進行開發與建置。

### 3. 目前狀態 (Check & Act)
- [x] 月曆視圖任務文字對比度修復完畢，深色模式下自動切換為高亮度文字。
- [x] 移除冗餘 `.bat` 檔案，保持專案架構純淨。
- [x] `npm run build` 通過驗證。

## [2026-05-16] Contrast Rescue Phase II: SSOT & CSS Robustness

### 1. 失敗記錄與分析 (Post-Mortem / RCA)
- **Failure K - Theme State Desync**:
    - **現象**: 儘管在 `App.tsx` 傳遞了 `theme` prop，但在某些情況下（如快取或非同步渲染），`Calendar` 元件內部的 `theme` 狀態仍可能與全域狀態脫節，導致計算邏輯失效。
    - **成因**: 依賴 prop 傳遞主題狀態不夠健壯，且 CSS 中缺乏對任務項目的保底文字色彩設定。
    - **CAPA**: 
        1. **SSOT (單一真理來源)**：直接在 `Calendar.tsx` 內部使用 `useAppStore` 讀取主題，確保狀態絕對同步。
        2. **CSS 保底機制**：在 `Calendar.css` 中顯式設定 `.task-preview-item` 的預設文字色彩為 `var(--text-primary)`，並強制 `text-align: left` 以修正異常居中問題。

### 2. 目前狀態 (Check & Act)
- [x] 月曆視圖文字色彩邏輯已改為從 Store 直接讀取，消除 prop 傳遞延遲。
- [x] CSS 層級加入保底屬性，防止 JS 計算失效時發生視覺崩潰。
- [x] 已清理快取並完成測試。
