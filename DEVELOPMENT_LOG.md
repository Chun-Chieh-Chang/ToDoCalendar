## 2026-03-14: UI/UX & Data Management Optimization

- **24-Hour Time Format**:
  - **Action**: Modified `TaskCard.tsx` to use `hour12: false` for all time displays.
  - **Result**: Enforced 24-hour format across the application, removing "AM/PM" (上午、下午) indicators.
- **Data Management Relocation**:
  - **Action**: Extracted Data Management logic from `Settings.tsx` into a new `DataManagementView` component.
  - **Result**: Added a dedicated "數據管理" entry in the left sidebar for easier access to backup, restore, and storage path settings.
- **Export Path Selection**:
  - **Result**: Confirmed that the export utility already triggers a system file dialog for path selection.

## 2026-03-14: Codebase Synchronization

- **Git Synchronization**:
  - **Action**: Performed `git pull`.
  - **Result**: "Already up to date." Current codebase is confirmed to be in sync with the remote repository.
  - **Status**: Working tree clean.

## 2026-03-01: UI/UX 對比度優化與關聯邏輯強化 (Current)

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
