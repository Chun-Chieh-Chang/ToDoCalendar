const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');

// 禁用硬體加速以避免某些系統上的問題
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        autoHideMenuBar: true,
        show: false
    });

    // 載入打包後的 index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    // 準備好後顯示視窗，避免白屏閃爍
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

// Handle notification requests from renderer process
ipcMain.on('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title,
            body,
            timeoutType: 'never'
        });
        
        notification.show();
        
        // When notification is clicked, focus the app window
        notification.on('click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    }
});

// Handle requests to restore the window
ipcMain.on('restore-window', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
        // Bring window to front (higher z-order)
        mainWindow.moveTop();
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
