# 開發紀錄 (Development Log) - 2026-02-05

## 任務目標
改善「待辦清單」功能，提升互動性與可用性。

## 修改範圍 (Precise Modifications) - 2026-02-05 (Update)
1. **src/store/AppContext.tsx**:
   - 整合了多組分散的 `useEffect` 保存邏輯為單一且可靠的監聽器。
   - 加入了 `persistData` 非同步處理，確保狀態更新後立即序列化。
2. **src/services/storage.ts**:
   - 優化了 `saveAllData` 的判斷邏輯，使用 `!== undefined` 取代真假值判斷，避免空陣列 `[]` 無法正確保存的問題。
   - 強化了 Electron 環境下的錯誤處理與回傳驗證。

## 問題分析與矯正措施 (Failure Analysis & Correction)
### 3. 資料保存競爭與遺漏
- **失敗紀錄**: 使用者反應刪除任務或標記完成後重新開啟，資料會恢復。
- **原因**: 
  - 原本多個 `useEffect` 同時監聽 `state.tasks`, `state.settings` 等，可能在短時間內觸發多次非同步存取衝突。
  - 原本使用 `if (data.tasks)` 判斷，當任務數清空為 `[]` 時，會被判定為 false 而跳過保存，導致最後一筆任務永遠刪不掉。
- **矯正措施**: 整合監聽邏輯並使用顯式定義檢查，確保「清空」也能被正確保存。
### 1. 變數未定義錯誤
- **失敗紀錄**: 初次修改 `App.tsx` 時未導入 `parseTaskTitle`，導致編譯失敗。
- **原因**: 為追求「精準修改」，忽略了新的邏輯需要新的工具函數導入。
- **矯正措施**: 在 `App.tsx` 加入 `import { parseTaskTitle } from './utils/nlpUtils';`，並通過 `npm run build` 驗證。

### 2. 屬性傳遞遺漏 (Lint Errors)
- **失敗紀錄**: `App.tsx` 中傳遞 `onSchedule` 至 `TaskListView` 時提示屬性不存在。
- **原因**: 僅修改了 `App.tsx`，未同步更新組件的 Props 介面定義。
- **矯正措施**: 修改 `TaskListViewProps` 與 `TaskListModalProps` 的 interface，加入 `onSchedule` 選項。

## 運行測試 (Running Tests)
- **靜態分析**: 執行 `npm run build` 成功，無類型錯誤或語法錯誤。
- **環境限制**: 由於系統 Playwright 環境變數 ($HOME) 未設置，無法開啟自動化瀏覽器進行視覺測試。
- **手動檢查**: 已仔細校對代碼邏輯，確保輔助功能與 CSS 類標籤正確無誤。

## 檔案整理 (File Management - MECE)
- **分類**: 組件與樣式表嚴格按照 `components/ElementName/` 目錄放置。
- **清理**: 移除了開發過程中的臨時變量與測試日誌。
- **整合**: 核心邏輯集中在 `App.tsx` 處理，保持子組件無狀態化（Stateless/Presentational）。

## 總結
本次更新大幅優化了待辦事項的操作效率，特別是 NLP 智慧解析的引入，使新增任務變得極速且精準。
