# ToDoCalendar - 月曆任務管理應用程式

一款現代化的桌面任務管理應用程式，結合月曆視圖與待辦清單功能，幫助您有效管理時間與任務。

## 🚀 最新更新

**v1.5.0（2026-09-24）**
- ✅ **新擬態介面**：全介面改為「Inset Focus」新擬態設計，淺色／深色兩套配色。
- ✅ **完整中英雙語**：所有介面文字、使用說明與國定假日名稱皆可切換。
- ✅ **桌面版修復**：修正 Electron 打包後白畫面；網頁版可推送桌面通知。
- ✅ **可靠性**：修正新增任務沿用上一筆內容、清晨「今天」誤判為昨天等問題；部署前自動執行測試、型別檢查與 lint。
- ✅ **PWA 更新**：部署新版後重新整理一次即為最新版，離線仍可開啟。

**v1.4.0（2026-09-17）**
- ✅ **台灣國定假日顯示**：月曆自動標記 2024–2027 年全部國定假日（含補假），琥珀色標籤直觀識別。

## 📋 主要功能

- **📅 整合式月曆**：月視圖，日期格顯示當日任務預覽與假日標記。
- **📝 任務管理**：CRUD 操作、優先級（高/中/低）、分類標籤、時間設定。
- **📋 待辦清單 (Backlog)**：收納未排程的待辦事項。
- **🧩 看板視圖**：拖拉任務在「待處理 / 進行中 / 完成」欄位間流轉。
- **📊 數據洞察**：SVG 面積圖追蹤任務完成趨勢。
- **⏰ 智能提醒**：整合 Notification API，任務時間到達時自動推送 OS 通知。
- **🌐 多語言**：繁體中文 / English，即時切換（含介面、使用說明、國定假日名稱）。
- **🎨 深色 / 淺色主題**：新擬態 (Neumorphism)「Inset Focus」設計系統，凸起 / 凹陷雙向陰影，兩種主題皆符合 WCAG 4.5:1 對比。
- **💾 Offline-First**：IndexedDB 本機儲存，可選 Supabase 雲端同步。
- **⌨️ 全域快捷鍵**：`1-4` 切換視圖、`N` 新增、`/` 搜尋、`T` 跳今天、`Esc` 關閉。
- **📱 響應式設計**：375px 手機到桌面全規格支援。
- **🌐 PWA**：可安裝，具備 Service Worker 離線緩存。

## 🚀 快速開始

### 一般用戶（推薦）

直接執行打包好的應用程式，**無需安裝任何依賴**：

```
release\ToDoCalendar-Portable.exe
```

### 開發者

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **啟動開發模式（網頁）**
   ```bash
   npm run dev
   ```
   瀏覽器自動開啟 `http://localhost:5173`

3. **啟動 Electron 桌面模式**
   ```bash
   npm run electron:dev
   ```

4. **打包 Electron 執行檔**
   ```bash
   npm run pack
   ```
   打包後的 `.exe` 位於 `release/`。

   > **前置需求（Windows）**：打包會把圖示與版本資訊寫入執行檔，electron-builder 需解壓其簽章工具包（內含符號連結）。請先開啟 **Windows 開發人員模式**（設定 → 系統 → 開發人員專用），或以系統管理員身分執行；否則會出現 `Cannot create symbolic link` 錯誤。

5. **Supabase 雲端同步（選用）**
   複製 `.env.example` 為 `.env` 並填入：
   ```
   VITE_SUPABASE_URL=<your-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
   不設定 `.env` 時，應用程式以純離線模式運行。

6. **品質檢查（提交前必跑）**
   ```bash
   npm test          # Vitest 測試（8 檔 86 項）
   npm run lint      # ESLint（0 錯誤 0 警告為通過門檻）
   npx tsc --noEmit  # TypeScript 型別檢查（0 錯誤為通過門檻）
   npm run build     # 生產建置
   ```

## 🛠 技術棧

| 層級 | 技術 |
|------|------|
| Framework | React 18, TypeScript |
| Build Tool | Vite 7 |
| State | Zustand 5 |
| Local DB | Dexie.js (IndexedDB) |
| Cloud Sync | Supabase (optional) |
| Desktop | Electron 33 + Electron Builder |
| Animations | Framer Motion 12 |
| Icons | Remixicon 4 |
| i18n | 自建（zh-TW / en，各 188 keys，鍵集由測試守護一致） |
| Testing | Vitest（8 files / 86 tests） |
| Lint | ESLint 8（legacy `.eslintrc.cjs`） |

## 📁 專案結構

```
ToDoCalendar/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx / App.css           # Root component & layout
│   ├── index.css                   # Global design system (neumorphic tokens, light/dark themes)
│   ├── constants/defaults.ts       # Default settings & filter state
│   ├── store/useAppStore.ts        # Zustand store (tasks, settings, filter)
│   ├── types/index.ts              # Core type definitions
│   ├── data/
│   │   └── twHolidays.ts           # Taiwan national holidays 2024–2027
│   ├── utils/
│   │   ├── i18n.ts                 # Translation (188 keys each, zh-TW / en)
│   │   └── nlpUtils.ts             # NLP task parsing
│   ├── services/
│   │   ├── storage.ts              # Dexie CRUD + localStorage migration + Supabase sync
│   │   ├── db.ts                   # IndexedDB schema
│   │   └── supabase.ts             # Supabase client (conditional)
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts # Global shortcuts
│   ├── shared/
│   │   ├── components/Modal/       # Reusable modal with spring animations
│   │   └── utils/                  # dateUtils, contrastUtils, notificationUtils (+ unit tests)
│   └── features/
│       ├── calendar/               # Month grid + task previews + holiday markers
│       ├── tasks/                  # Task CRUD, filter, cards, list views
│       ├── dashboard/              # Analytics (SVG area chart, stats)
│       ├── kanban/                 # Kanban board (HTML5 DnD + Framer Motion)
│       ├── settings/               # Settings modal (General / Data tabs)
│       └── guide/                  # User guide & onboarding CTA
├── electron/
│   ├── main.cjs                    # Electron main process
│   └── preload.cjs                 # Electron bridge API
├── public/                         # PWA assets (manifest, service worker, icons)
├── backup/                         # JSON data backups (gitignored)
└── docs/
    └── CONSOLIDATED_DOCUMENTATION.md
```

## 📚 文檔

- [完整文檔 (Consolidated Documentation)](docs/CONSOLIDATED_DOCUMENTATION.md)
- [開發日誌 (DEV_LOG)](DEV_LOG.md)

## 📄 許可證

MIT License

## 🙏 致謝

Developed by Wesley Chang @ Mouldex, 2026.
