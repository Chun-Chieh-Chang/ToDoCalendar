# ToDoCalendar - 月曆任務管理應用程式

一款現代化的桌面任務管理應用程式，結合月曆視圖與待辦清單功能，幫助您有效管理時間與任務。

## 📝 版本資訊

- **當前版本**: v1.1.0
- **最後更新**: 2025-12-18
- **相容性**: Windows 10/11

## 🚀 最新更新 (v1.1.0)

- ✅ 新增年份和月份下拉選單功能
- ✅ 改善日曆網格在淺色主題下的可見性
- ✅ 修復 TypeScript 類型錯誤
- ✅ 優化響應式設計
- ✅ 完善的多語言支援系統
- ✅ 優化深色/淺色主題對比度
- ✅ 增加任務文字大小，提升可讀性
- ✅ 完善的數據匯出/匯入功能
- ✅ 現代化的使用者界面設計
- ✅ 完整的 TypeScript 類型安全
- ✅ 優化的性能與用戶體驗

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