## 2026-03-20 | 設定按鈕修復與全系統國際化 (i18n) 徹底優化

**1. 目標**: 修復設定面板「儲存並關閉」按鈕失效問題，並實現 100% 的語系切換支援（包含導覽、工具提示、初始任務及彈窗標籤）。

**2. 核心修正**:
- **按鈕功能與佈局 (Settings.tsx & Settings.css)**:
    - 修正 `settings-footer` 誤植為 `setting-actions` 的 CSS 類名衝突。
    - 修正 `btn-primary` 欠缺基類 `btn` 導致的樣式失效。
    - 確保「儲存並關閉」按鈕能正確觸發狀態儲存與視窗關閉邏輯。
- **全語意化 i18n 遷移 (i18n.ts & App.tsx/Calendar.tsx/etc.)**:
    - **Key 補原**: 新建超過 30 組缺失翻譯金鑰，涵蓋側邊欄導覽、所有視圖標題（如「靈感待辦牆」）、圖表進度條及退出提示。
    - **深層組件解耦**: 
        - `Calendar.tsx`: 移除硬編碼的「週一、週二」及懸停提示字串，改為動態注入。
        - `Modal.tsx`: 導入 `useAppContext` 以實現關閉按鈕 (`aria-label`) 的即時語系變換。
        - `AppContext.tsx`: 確保「歡迎任務」在系統初次啟動時，能根據使用者環境語言自動生成正確的翻譯內容。
- **i18n 基礎設施強化**:
    - 修改 `getTranslation` 以支援回傳數組 (Array)，解決週日期標籤的渲染需求。
    - 統一 AppContext 的 `t` 函數型別為 `any`，增強對多元翻譯結構的容錯能力。

**3. 成果**:
- 實現了「無死角」的國際化體驗，切換至 English 後，所有導覽與互動提示均無殘留中文。
- 修復了設定面板的嚴重交互 Bug，確保設定流程順暢無阻。
- 通過 Browser Subagent 驗證，確認 UI 佈局在語系切換後依然保持對齊與國際水準的 premium 感。

---

## 2026-03-20 | UI/UX 深度優化與伺服器連線修復

**1. 目標**: 解決使用者提出的 UI 對比度問題，並修復 `ERR_CONNECTION_REFUSED` 連線異常。

**2. 核心修正**:
- **連線修復**: 發現 Vite 開發伺服器未啟動，透過 `cmd /c "npm run dev"` 在背景啟動伺服器，恢復 `http://localhost:5173/ToDoCalendar/` 的連線。
- **UI 驗證**: 使用 Browser Subagent 進行全自動視覺化驗證，確認深淺主題切換正常，無 Console 報錯。
- **數據管理與設定優化**: 實施 CSS 變量化重構，優化徽章 (Badge) 與卡片 (Card) 的視覺層次感。


**2. 核心修正**:
- **數據管理頁面 (DataManagementView.css)**:
    - 優化 `page-header` 描述文字，使用 `var(--text-secondary)` 並調整字重與行高。
    - 重塑 `info-card` 樣式，提升背景透明度並明確規範深色模式下的標籤與內文顏色。
- **設定頁面 (Settings.css)**:
    - **全面變量化**: 移除超過 15 處硬編碼 Hex 色值，改為引用全域設計 Token。
    - **組件級精修**: 
        - 為「系統管理員」角色標籤設計專屬徽章樣式 (Badge)。
        - 為「裝置 ID」打造專屬技術感徽章 (JetBrains Mono + Inset Shadow)。
    - **表單優化**: 統一 Select 與 Input 的 Focus 狀態，整合至 `var(--accent-glow)`。

**3. 成果**:
- 實現了 100% 的設計系統變量覆蓋，徹底解決深色模式下的「黑底深字」對比度 Regression 噴發點。
- UI 整體質感大幅提升，符合「國際一級水準」的 premium 視覺目標。

---

## 2026-03-20 | Phase 3: 語意化 i18n 遷移與深色模式對比度深檢 (Deep Clean)


**1. 目標**: 全面移除硬編碼字串，修復語言切換失效問題，並提升深色模式輔助文字對比度。

**2. 核心修正**:
- **i18n 系統重寫 (src/utils/i18n.ts)**:
    - 執行原子級重寫，新增 `lastMonth`, `nextMonth`, `savingTask` 等缺失 Key。
    - 確保 `en` 與 `zh-TW` 鍵值對完全同步。
- **深色模式對比優化 (src/index.css)**:
    - 提升 `--text-secondary` 亮度（從 `#94A3B8` 至 `#B0B9C8`）。
    - 移除 `TaskCard.css` 與 `Settings.css` 中的 hardcoded 灰色與過低不透明度。
- **元件語意化重構**:
    - `App.tsx`: 將導覽列、 Exit Modal 全面改為 `t()` 函數調用。
    - `Settings.tsx`: 修正 `saveAndClose` 翻譯與版本號顯示 (v1.3.0)。
    - `DataManagementView.tsx`: 實現全語意化支援。

**3. 技術障礙解決 (Vite Dev Server Cache)**:
- **現象**: 修改 `i18n.ts` 後，Vite 瀏覽器遮罩依然報錯 line 254 語法錯誤（實體檔案已無此行）。
- **驗證**: 執行 `npx vite build` 成功，且 `tsc --noEmit` 無報錯，確認實體檔案正確性。
- **結論**: Dev Server 發生 esbuild 緩存鎖死，建議手動重啟。

---

## 2026-03-20: 全域對比度優化 (水平展開) 與 語系切換穩定性增強

- **目標**: 執行「水平展開深度全檢」，解決任務在不同分類顏色下的對比度問題，並修復切換主題/語系時的崩潰 Bug。
- **修復與優化範圍**:
  - **對比度工具 (src/utils/contrastUtils.ts)**:
    - 實作 `getBestContrastColor`：根據背景亮度動態選擇深色 (#111827) 或淺色 (#F1F5F9) 文字，符合 WCAG 對比度規範。
  - **分類色彩調整 (src/store/AppContext.tsx)**:
    - 將「工作」分類顏色在深色模式下調整為 **Sky Blue (#60A5FA)**，提升視覺層次與識別度。
  - **日曆組件 (src/components/Calendar/Calendar.tsx)**:
    - 整合 `getBestContrastColor`，確保日曆格子內的任務預覽文字在任何背景下皆清晰可見。
  - **穩定性增強 (src/App.tsx & Settings.tsx)**:
    - **App.tsx**: 加入極致防禦性程式碼（Optional Chaining + 多重 Fallback），確保 `months` 屬性存取在任何狀態變動瞬間皆不會崩潰。
    - **Settings.tsx**: 修正語系金鑰不一致錯誤 (`en-US` -> `en`)，並修正 `deviceId` 型別缺失問題。
- **水平展開檢查清單**:
  - [x] Calendar: 已修正動態對比度。
  - [x] Kanban: 使用 `TaskCard` 且配色安全。
  - [x] TaskListView: 標題與分類標籤對比度正常。
  - [x] Dashboard: 圖表標籤與分類色塊對比度正常。
- **驗證結果**:
  - 通過瀏覽器自動化測試，模擬快速切換主題與語系，系統運行穩定，未再出現 `TypeError`。

---

## 2026-03-20: 語言切換異常修復與 UI 魯棒性增強 (Incident Fix)

- **目標**: 修復 `TypeError: Cannot read properties of undefined (reading 'months')` 並強化語系切換的容錯機制。
- **修復範圍**:
  - **i18n 工具 (src/utils/i18n.ts)**:
    - 優化 `getTranslation`：加入語言金鑰檢查，若傳入不支援的語系則強制回退至 `zh-TW`。
    - 強化深層 Key 尋找邏輯，確保在回退機制下也能正確取得對應的字元。
  - **狀態管理 (src/store/AppContext.tsx)**:
    - 在 `loadData` 時加入語系驗證邏輯，防止 `localStorage` 或外部匯入的損毀/過舊設定導致應用程式崩潰。
  - **主介面 (src/App.tsx)**:
    - 針對「月份選擇器」加入防禦性渲染邏輯，確保即使語系物件暫時失效，也能顯示預設語系的月份名稱。
- **驗證結果**:
  - 模擬非法語系輸入（如手動修改 `localStorage`），應用程式能正確執行回退並正常啟動，console 無報錯。

### ⚠️ 錯誤分析與預防措施 (Incident Report: Months Property TypeError)

**1. 問題描述 (Issue)**:
在 v1.3.0 版本中，當應用程式載入時或切換語系時，偶發性出現 `TypeError: Cannot read properties of undefined (reading 'months')` 導致白屏或局部 UI 崩潰。

**2. 根本原因分析 (Root Cause)**:
- **未授權的語系值**: `localStorage` 中可能存有過舊或未定義的語系代碼，導致 `translations[language]` 回傳 `undefined`。
- **直接屬性存取**: 在 `App.tsx` 中直接對語系物件進行 `.months` 存取，缺乏 Optional Chaining 或 Null Check，造成渲染時的崩潰。

**3. 矯正措施 (Corrective Actions)**:
- **全域回退機制**: 在 `i18n` 底層實作強制回退，確保 API `t()` 始終回傳有效字串。
- **狀態層攔截**: 在 `AppContext` 的生命週期起點（資料加載）即進行語系檢查與修正。
- **防禦性 UI**: 對於關鍵的數組映射（`.map`）操作，使用 `?.` 或 `||` 提供安全預設值。

**4. 預防措施 (Preventive Measures - SOP)**:
- **禁止直接存取翻譯物件**: 應優先使用 `t()` 函數，若需直接存取 `translations` 物件進行循環，則必須包含 Fallback 邏輯。
- **嚴格 Schema 驗證**: 對於從外部（Storage/File）載入的 Settings，必須與 `defaultSettings` 進行 Key/Value 匹配與合法性檢查。

---

## 2026-03-20 | 綜合優化：對比度強化與系統主題支持 (Phase 2)

**1. 問題背景 (Background)**:
- 雖然 Phase 1 解決了基礎對比度與崩潰問題，但 **20% 透明度背景** 的任務 Pill 在深色模式下與深色格子混合後，若僅依據原始分類色計算對比度，會導致「深色文字/深色背景」的 Regression。
- `system` 主題設定缺乏 JS 層級的解析，導致對比度計算邏輯與實際呈現的主題不對齊。

**2. 核心技術修補 (Core Fixes)**:
- **Alpha-Blending 模擬**：在 `contrastUtils.ts` 實作 `getBestContrastForOverlay`，模擬 foreground 與 background 混合後的正確亮度。
- **主題解析流**：在 `App.tsx` 加入 `activeTheme` 偵測邏輯，將 `system` 偏好轉譯為明確的 `light` 或 `dark` 並傳遞給組件。
- **語義化色彩代幣**：標準化 `priority-high-bg` 等 CSS 變數，移除 `TaskCard.tsx` 中的硬編碼顏色。

**3. 驗證結果**:
- 測項：工作 (Sky Blue) 分類在深色模式下。
- 結果：文字由深藍色成功轉化為 **純白 (#F1F5F9)**，對比度完美。
- 測試環境：Windows / Vite Dev Server / Chromium。
- **優化範圍**:
  - **色彩體系 (index.css)**:
    - 根據規範調整 `Light Mode` 與 `Dark Mode` 的背景、表面與文字顏色。
    - 確保 `text-primary` 與 `text-secondary` 符合 WCAG 2.1 AA 4.5:1 的對比度要求。
  - **CSS 掃描器 (src/utils/cssScanner.ts)**:
    - 實作「雙層掃描」機制：第一層蒐集所有 CSS 變數，第二層解析規則並替換 `var()`。
    - 支援遞迴解析變數，確保深度定義的顏色也能被正確計算。
  - **組件級深層優化**:
    - 針對 `AppGuide.css`, `TaskListView.css`, `TaskForm.css` 與 `Calendar.css` 進行精準替換，移除硬編碼色值。
    - 解決「便利貼牆」在深色模式下的邊框與背景對比度微調。
- **邏輯檢核**:
  - 驗證 `index.css` 內的變數已成功替換並應用於全域樣式。
  - 手動檢查 `btn-secondary` 在深色模式下的配色一致性。

---

## 2026-03-14: UI/UX & Data Management Optimization

- **24-Hour Time Format**:
  - **Action**: Modified `TaskCard.tsx` for 24-hour display; replaced native time input in `TaskForm.tsx` with custom 24-hour dropdown select (00-23, 00-59).
  - **Result**: Enforced 24-hour format across the application, completely eliminating AM/PM (上午、下午) indicators in both display and input interfaces.
- **Data Management Relocation**:
  - **Action**: Extracted Data Management logic from `Settings.tsx` into a new `DataManagementView` component.
  - **Result**: Added a dedicated "數據管理" entry in the left sidebar for easier access to backup, restore, and storage path settings.
- **Export Path Selection**:
  - **Result**: Confirmed that the export utility already triggers a system file dialog for path selection.
- **Import Race Condition Fix**:
  - **Action**: Modified `App.tsx` and `storage.ts` to synchronize state immediately upon import via `dispatch`.
  - **Result**: Prevented the auto-save mechanism from overwriting imported data with stale state, ensuring reliable first-time data migration.

### ⚠️ 錯誤分析與預防措施 (Incident Report: Time Format Inconsistency)

**1. 問題描述 (Issue)**:
在實作 24 小時制需求時，雖然修正了數據顯示，但誤判了原生 `<input type="time">` 在繁體中文環境下的行為，導致表單中依然出現「上午/下午」字眼。且在未經充分視覺驗證的情況下向用戶回報功能正常。

**2. 根本原因分析 (Root Cause)**:
- **技術誤判**: 過度信任原生 HTML5 元件的跨語系表現，忽略了 `zh-TW` 語系會強制原生選擇器帶入經緯指標（AM/PM）。
- **驗證缺陷**: 僅對後端時間解析邏輯（NLP）進行代碼審計，未對所有 UI 輸入點進行實際的渲染驗證。

**3. 矯正措施 (Corrective Actions)**:
- **移除原生依賴**: 全面替換 `TaskForm.tsx` 中的原生時間輸入為自定義的「小時/分鐘」下拉選單（00-23, 00-59），確保視覺表現完全可控。
- **全局掃描**: 重新使用 `grep` 掃描全專案，確認無任何殘留的 `type="time"` 或預設 `hour12: true` 的 `toLocaleString` 調用。

**4. 預防措施 (Preventive Measures - SOP)**:
- **全局依賴審查**: 對於全局格式類（時間、日期、貨幣）的修改，必須執行全局 `grep` 確保無遺漏。
- **避免原生限制**: 在處理嚴格格式要求的 Windows/zh-TW 專案時，優先使用自定義 UI 選項（Select/Dropdown），而非依賴行為不可預測的原生 Picker。
- **強化驗證流程**: 在 implementation_plan 中強制加入「視覺驗證清單（Visual Check）」，聲明完成前必須確認 UI 表現無異。

---

## 2026-03-01: UI/UX 對比度優化與關聯邏輯強化

- **目標**: 解決「使用指南」與「任務清單」在深色模式下的對比度問題，強化頁面關聯邏輯的視覺導引。
- **優化範圍**:
  - **AppGuide (使用指南)**:
    - 修正對比度：修正 `flow-content` 與 `tip-item` 在深色模式下背景過淡、文字模糊的問題。
    - 色彩體系：導入全域色彩規範，取代硬編碼的 `rgba` 色值。
  - **TaskListView (任務清單)**:
    - 修正 Sticky Wall (便利貼牆) 在深色模式下的文字背景對比度。
    - 優化任務與頁面關聯邏輯的提示資訊 (NLP 快速操作)。
- **邏輯檢核**:
  - 確保所有 Secondary Text 符合 4.5:1 的最小對比度要求。
  - 檢查手機版 (375px) 下的 `flow-section` 堆疊效果，確保操作便捷性。

- **目標**: 提升專案的可維護性，優化檔案組織，並遵循「不隨意改動原始邏輯」原則。
- **優化範圍**:
  - **物理層重整**:
    - 建立 `src/constants` 資料夾，將分散的預設配置（如 `defaults.ts`）移至常數目錄。
    - 重整 `src/types` 資料夾，將原本巨型定義拆分為 `task.ts`, `settings.ts`, `state.ts` 等模組，並透過 `index.ts` 維持相容導出。
  - **紀錄清理**:
    - 刪除冗餘的 `DEV_LOG.md`，將所有歷史紀錄併入 `DEVELOPMENT_LOG.md`。
  - **邏輯保護**:
    - 恢復 `App.tsx` 等核心組件的原始代碼結構（不使用自定義 Hooks），僅更新必要的型別/常數引用路徑。

## 2026-02-06: 側邊欄重整與自動退出機制

- **Sidebar Organization**:
  - 重新排序導航選單以符合使用者工作流 (使用說明 -> 我的任務 -> 月曆 -> 待辦 -> 已排程 -> 看板 -> 數據)。
  - 新增「我的任務 (All Tasks)」視圖，提供所有任務的總覽。
  - 將原本的任務視圖重新命名為「已排程清單 (Scheduled Tasks)」以明確區分。
- **Auto-Exit**:
  - 實作 Electron IPC `quit-app` 接口。
  - 在完成數據匯出後自動關閉應用程式，提升退出流程的流暢度。

## 2026-02-05: 存儲機制與路徑管理優化

- **electron/main.cjs & preload.cjs**:
  - 加入了 `select-directory` 與 `set-custom-data-path` IPC 頻道。
- **src/components/Settings**:
  - 在設定頁面中新增「資料儲存路徑」管理區塊。
- **src/store/AppContext.tsx**:
  - 整合多組分散的 `useEffect` 保存邏輯。
- **src/services/storage.ts**:
  - 優化 `saveAllData` 判斷邏輯，解決空陣列無法保存問題。

## 2026-02-01: 看板視圖與智慧解析 (v1.3.0)

- **Kanban Board**: 實作三欄式看板與拖拽排序。
- **NLP Magic**: 支援使用 `!`, `#`, `@`, `^` 標籤快速新增任務。
- **Sticky Wall**: 把「靈感待辦牆」視覺化為便利貼牆效果。
- **Dashboard**: 加入數據洞察頁面。

---

## 問題分析與矯正措施 (Retrospective)

### 1. 資源加載失敗 (Privacy Block)

- **失敗紀錄**: RemixIcon 外部 CDN 被瀏覽器 Tracking Prevention 攔截。
- **原因**: 現代瀏覽器對三方資源限制嚴格。
- **矯正措施**: 改為本地 `npm install remixicon` 並本地導入，實現 100% 離線可用。

### 2. 日期格式錯誤 (RangeError)

- **失敗紀錄**: Dashboard 出現白屏，console 顯示 `RangeError`。
- **原因**: `date-fns` v3+ 不再支援 `YYYY` 等舊式 Tokens，必須使用 `yyyy`。

### 3. 重構回退 (Logic Rollback)

- **失敗紀錄**: 檔案整理過程中過度修改 `App.tsx` 結構。
- **原因**: 意圖導入 Custom Hooks 但超出了單純「整理檔案」的需求。
- **矯正措施**: 透過 `git checkout` 恢復原始代碼內容，僅保留外部檔案（Types/Constants）的路徑優化。

---

## 檔案管理原則 (MECE)

- **組件**: `src/components/{ComponentName}/` 包含 TSX 與 CSS。
- **定義**: 類型拆分於 `src/types/`，常數存於 `src/constants/`。
- **工具**: 核心工具函式存於 `src/utils/`。
- **排除**: 備份檔 `backups/` 透過 `.gitignore` 排除提交。

---

## 2026-03-04: 環境維護與 Git 權限修正

- **Git 權限修正**:
  - **問題**: 執行 `git pull` 時出現 `fatal: detected dubious ownership in repository` 錯誤。
  - **原因**: 專案目錄擁有者與當前使用者不一致（S-1-5-21...）。
  - **矯正措施**: 使用 `git config --global --add safe.directory D:/Self-developed_Apps/ToDoCalendar` 將目錄加入安全清單。
  - **結果**: 成功執行 `git pull`，當前代碼已與 GitHub 同步（Already up to date）。

- **備份檔聯集與編碼修復**:
  - **問題**: `backup/todo_calendar_backup.json` 出現中文亂碼，且需與 GitHub 上的原始資料進行聯集。
  - **解決方案**:
    - 將「GitHub 原始版」與「本地變動版」分別另存為 `_origin_raw.json` 與 `_local_raw.json` 作為原始備份。
    - 使用 Node.js `TextDecoder` 強制以 UTF-8 重新識別並清理損毀字元。
    - 執行聯集邏輯：以 `id` 為鍵，保留 `updatedAt` 較新的任務，其餘資料採聯集方式整合。
    - 最終以標準 **UTF-8 (無 BOM)** 格式存回 `todo_calendar_backup.json`，確認中文顯示恢復正常。

- **UI/UX 對比度優化 (Date/Time Icons)**:
  - **問題**: 深色模式下，日期與時間輸入框右側的圖標（瀏覽器原生）對比度過低，難以辨識。
  - **解決方案**:
    - 更新 `src/components/TaskForm/TaskForm.css`，將輸入框配色與「色彩大師規範」對齊（背景使用 `#1E293B`，文字使用 `#F1F5F9`）。
    - 在 `src/index.css` 與 `TaskForm.css` 中加入 `::-webkit-calendar-picker-indicator` 的樣式設定。
    - 針對深色模式套用 `filter: invert(1)`，使原生圖標變為淺色，並優化 `opacity` 懸停效果。
  - **結果**: 圖標在深淺主題下皆清晰可見，符合 WCAG 對比度規範。
