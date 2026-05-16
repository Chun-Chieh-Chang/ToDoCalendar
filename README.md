# ToDoCalendar - 月曆任務管理應用程式

一款現代化的桌面任務管理應用程式，結合月曆視圖與待辦清單功能，幫助您有效管理時間與任務。

## 🚀 最新更新 (v1.3.0 Professional - 2026-05-16)

### 💎 玻璃秩序設計系統 (The Glass Order)
- ✅ **三層邊緣法則**：實裝「內發光 + 精準邊框 + 無重力陰影」，打造極致通透的毛玻璃質感。
- ✅ **自適應 RGB 渲染**：背景與邊框根據主題色動態計算，確保在深淺色模式下皆具備專業級對比度。

### 🧩 MECE UX 重構 (UX Refactoring)
- ✅ **整合式設定中心**：將「數據管理」併入設定標籤頁，實現系統操作的「相互獨立、完全窮盡」。
- ✅ **全能任務管理中心**：統一列表視圖，內建「全部 / 已排程 / 靈感待辦」子分頁切換。
- ✅ **全局新增入口 (Global Action Hub)**：側邊欄常駐「新增任務」按鈕，建立最高優先級的交互路徑。

### 🗓 智慧月曆增強
- ✅ **週末視覺引導**：星期六 (翡翠綠) 與 星期日 (珊瑚紅) 專屬莫蘭迪色系標註，強化時間感知。
- ✅ **精準備份命名**：導出檔案自動加入 `yyyyMMdd_HHmmss` 時間戳記，方便版本管理。

## 📚 文檔索引

- **[📖 完整文檔 (Consolidated Documentation)](docs/CONSOLIDATED_DOCUMENTATION.md)** - 包含用戶手冊、開發日誌和優化報告的所有文檔

## 🌟 主要功能

- **📅 整合式月曆**：直觀的日期選擇，支持雙擊查看詳情。
- **📝 任務管理**：新增、編輯、刪除、分類（工作/學習/生活），支持優先級設定。
- **📋 待辦清單 (Backlog)**：專門收納未排程的待辦事項。
- **⏰ 智能提醒**：設定時間後，系統會自動彈出提醒通知。
- **🌐 多語言支援**：支援中文（繁體）與 English，可即時切換。
- **🎨 現代化界面**：支援深色/淺色主題，優化文字對比度與可讀性。
- **💾 數據管理**：支援匯出/匯入功能，數據安全儲存在本機。

## 🚀 快速開始

### 一般用戶 (推薦)

直接執行打包好的應用程式，**無需安裝任何依賴**：

```
release\ToDoCalendar-Portable.exe
```

### 開發者 (Developer)

如果您希望參與開發或除錯：

1. **安裝依賴**
   ```bash
   npm install
   ```
   *如果遇到權限錯誤，請嘗試以系統管理員身分執行，或檢查 npm 執行策略。*

2. **啟動開發模式**

   **選項 A：網頁版模式 (推薦用於快速開發)**
   支援熱更新 (Hot Reload)，適合調整 UI 與邏輯。
   ```bash
   npm run dev
   # 或直接執行 "開發模式.bat"
   ```
   瀏覽器將自動開啟至 `http://localhost:5173`。

   **選項 B：桌面應用程式模式 (Electron)**
   模擬真實的桌面應用程式環境。
   ```bash
   npm run electron:dev
   ```
   
   ⚠️ **PowerShell 疑難排解**：
   如果您在 PowerShell 中遇到 `npm : 因為這個系統上已停用指令碼執行...` 錯誤，請改用以下指令（透過 cmd 執行）：
   ```powershell
   cmd /c "npm run electron:dev" (在 cmd 中執行這整段命令，包含cmd /c)
   ```

3. **打包應用**
   將專案打包為可執行的 `.exe` 檔案：
   ```bash
   npm run pack
   # 或直接執行 "打包應用.bat"
   ```
   打包後的檔案將位於 `release/` 目錄中。

## ⚙️ GitHub Pages 部署設定 (Important)

本專案使用自動化腳本將網頁部署至 `gh-pages` 分支。為確保網站能正確更新，請務必檢查 GitHub 設定：

1.  進入 **Settings** > **Pages**。
2.  在 **Build and deployment** 區塊：
    *   **Source**: 必須選擇 **`Deploy from a branch`**。
        *   ⚠️ **請勿選擇** "GitHub Actions"，否則會讀取不到更新。
    *   **Branch**: 選擇 **`gh-pages`** 分支，路徑 `/ (root)`。
3.  設定完成後，每次 Push 到 Main 分支約 2 分鐘後即可看到更新。

## 🛠 技術棧

- **Core**: React 18, TypeScript, Vite
- **Desktop**: Electron, Electron Builder
- **State**: React Context API
- **Styling**: CSS Modules, Vanilla CSS
- **Utils**: date-fns
- **i18n**: 自建國際化系統，支援中英文切換

## 📁 項目結構

```
src/
├── components/           # UI 組件 (Calendar, TaskList, Modal...)
├── store/                # 狀態管理 (AppContext)
├── utils/                # 工具函數 (dateUtils, i18n, defaults)
├── types/                # TypeScript 類型定義
├── services/             # 外部服務 (Storage)
├── App.tsx               # 主應用入口
└── main.tsx              # React 掛載點
```

## 📄 許可證

MIT License

## 🙏 致謝

Developed by Wesley Chang @ Mouldex, 2025.