# 開發紀錄 (Development Log)

## 2026-02-05: 專案檔案結構優化與 MECE 整理 (Current)
- **目標**: 提升專案的可維護性，優化檔案組織，並遵循「不隨意改動原始邏輯」原則。
- **優化範圍**:
  - **物理層重整**: 
    - 建立 `src/constants` 資料夾，將分散的預設配置（如 `defaults.ts`）移至常數目錄。
    - 重整 `src/types` 資料夾，將原本巨型定義拆分為 `task.ts`, `settings.ts`, `state.ts` 等模組，並透過 `index.ts` 維持相容導出。
  - **紀錄清理**: 
    - 刪除冗餘的 `DEV_LOG.md`，將所有歷史紀錄併入 `DEVELOPMENT_LOG.md`。
  - **邏輯保護**: 
    - 恢復 `App.tsx` 等核心組件的原始代碼結構（不使用自定義 Hooks），僅更新必要的型別/常數引用路徑。

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
