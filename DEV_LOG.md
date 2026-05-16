# ToDoCalendar - SkillsBuilder Dev Log (PDCA)

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
