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

### 下一步建議 (Next Steps)
- **多裝置同步**：研究基於 Supabase 或 WebRTC 的數據同步方案。
- **效能監控**：針對長列表任務進行虛擬滾動 (Virtual List) 優化。

---

## [2026-05-16] UI/UX Optimization & Restoration

- **目標**: 恢復透明玻璃美學，解決「邊界感缺失」問題。
- **執行**:
    - 強化 `--inner-glow` 與 `--border-glass`，使用光影而非不透明度定義邊界。
    - 恢復 `TaskForm` 的橫向佈局邏輯。
    - 解決 `vite.svg` 404 與硬編碼模糊度的回歸問題。

---

## [2026-05-15] Global Unification & Color Master Palette Update

- **全域去紫化**: 全面替換為皇家藍/天藍體系。
- **對比度加固**: 執行 WCAG 2.1 AA 審計，優化可讀性。
- **空間一統**: 重寫 `DataManagementView.css` 質感，同步設定面板風格。
- **Supabase**: 完成雲端同步與 RLS 安全原則全線跑通。
