# ToDoCalendar - SkillsBuilder Dev Log

## [2026-05-15] SkillsBuilder Mode Initialized
### 1. 失敗記錄與分析 (Post-Mortem)
- **問題**: 儘管更新了 CSS，但月曆標題依然垂直排列，且出現生硬黑框。
- **成因**: `Calendar.tsx` 中的標籤結構與 `Calendar.css` 的 Grid 屬性不匹配，導致瀏覽器回退到預設的塊級排列。
- **副作用風險**: 修改 Grid 佈局可能導致手機版視圖擠壓。

### 2. 最終矯正措施 (Corrective Actions)
- **結構重組**: 重新對齊 `Calendar.tsx` 的 JSX 結構，確保 Header 與 Body 共享同一個 Grid 定義。
- **視覺昇華**: 實施 **「無框設計」**，移除 `border: 1px solid black`，改用 `background: var(--surface-glass)`。
- **水平展開**: 調整 `.calendar-wrapper` 寬度權重，實現真正的儀表板寬度。

### 3. 未來擴展計畫
- 接入「看板模式」的橫向拖拽優化。
- 完善 Google 登入後的數據加密同步。
