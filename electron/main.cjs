const { app, BrowserWindow, Notification, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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

// Data persistence
const configPath = path.join(app.getPath('userData'), 'path_config.json');

function getDataFilePath() {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (config.customPath && fs.existsSync(path.dirname(config.customPath))) {
                return config.customPath;
            }
        }
    } catch (e) {
        console.error('Error reading path config:', e);
    }
    return path.join(app.getPath('userData'), 'todo_calendar_data.json');
}

let dataFilePath = getDataFilePath();

ipcMain.handle('save-data', async (event, data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
        return { success: true };
    } catch (error) {
        console.error('Failed to save data:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', async () => {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf-8');
            return { success: true, data: JSON.parse(data) };
        }
        return { success: true, data: null }; // No data found
    } catch (error) {
        console.error('Failed to load data:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-data-path', () => {
    return dataFilePath;
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});

ipcMain.handle('set-custom-data-path', async (event, directoryPath) => {
    try {
        const newPath = path.join(directoryPath, 'todo_calendar_data.json');

        // If old file exists and new one doesn't, we might want to copy it.
        // For simplicity, we just update the config.
        fs.writeFileSync(configPath, JSON.stringify({ customPath: newPath }));
        dataFilePath = newPath;
        return { success: true, path: newPath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

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
