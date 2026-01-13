@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ToDo 日曆 - 打包為獨立執行檔
echo ========================================
echo.

echo [1/3] 檢查 Node.js 環境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未找到 Node.js
    echo 請先安裝 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js 已安裝

echo.
echo [2/3] 安裝/更新依賴...
call npm install
if %errorlevel% neq 0 (
    echo ✗ 依賴安裝失敗
    pause
    exit /b 1
)
echo ✓ 依賴安裝完成

echo.
echo [3/3] 打包應用程式...
call npm run pack
if %errorlevel% neq 0 (
    echo ✗ 打包失敗
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ 打包完成！
echo.
echo 執行檔位置：
echo release\ToDoCalendar-Portable.exe
echo ========================================
echo.
pause
