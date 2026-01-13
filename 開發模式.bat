@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ToDoCalendar - 開發模式
echo ========================================
echo.

echo [1/2] 檢查 Node.js 環境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未找到 Node.js
    echo 請先安裝 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js 已安裝

echo.
echo [2/2] 安裝依賴並啟動開發伺服器...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 依賴安裝失敗
    pause
    exit /b 1
)

echo.
echo ✓ 啟動開發伺服器...
echo 瀏覽器將自動開啟 http://localhost:3000
echo.
call npm run dev
