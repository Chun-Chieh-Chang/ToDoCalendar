# ToDoCalendar - SkillsBuilder Dev Log

## [2026-05-15] Global Unification & Color Master Palette Update (PDCA Cycle)
### 1. 失敗記錄與分析 (Post-Mortem)
- **問題**: 「數據管理」頁面出現視覺崩潰（平行時空感），且看板視圖在重構後出現過於生硬的藍色邊框。
- **成因**: 
  1. CSS 檔案中殘留了 Git 衝突標記 (`>>>>>>>`)，導致解析錯誤。
  2. 部分子組件（DataManagement/Kanban）未同步最新的設計變數，沿用了舊版的 Boxy 樣式。
  3. 初次切換藍色系時，未考慮亮色模式下的文字對比度（Brand Blue on White），導致可讀性下降。

### 2. 最終矯正措施 (Corrective Actions)
- **全域去紫化**: 全面替換 `8b5cf6` 與 `ec4899` 為 SkillsBuilder 官方皇家藍體系。
- **對比度加固**: 執行 WCAG 2.1 AA 審計，將亮色模式下的輔助文字調深，並為「今日」日期加入高對比徽章。
- **空間一統**: 重寫 `DataManagementView.css` 與 `KanbanBoard.css`，複刻「設定」面板的 **「深層玻璃分組」** 質感。
- **代碼淨化**: 手動移除所有組件中的 Git 殘留與冗餘樣式。

### 3. 目前狀態 (Check & Act)
- [x] 全站配色邏輯一致化 (Royal Blue / Sky Blue)。
- [x] 靜態與動態對比度符合工業級標準。
- [x] 完成數據管理頁面的時空對接。
- [x] 驗證 Supabase 專案 ID 是否有效 (解決 NXDOMAIN 錯誤)。
- [x] 雲端同步與 RLS 安全原則全線跑通。
- [ ] 待辦：看板視圖的卡片拖拽效能監控。
