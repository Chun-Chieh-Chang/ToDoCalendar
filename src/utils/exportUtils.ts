import { storageService } from '../services/storage';

export const exportDataWithDialog = async () => {
    const jsonStr = storageService.exportData();
    const defaultFilename = `todo_calendar_backup.json`;

    // 1. Electron 桌面版優先處理
    if (typeof (window as any).electronAPI !== 'undefined') {
        const res = await (window as any).electronAPI.saveExportFile({
            content: jsonStr,
            defaultFilename
        });
        if (res.success) {
            return { success: true, filePath: res.filePath };
        } else if (res.error) {
            throw new Error(res.error);
        }
        return { success: false, canceled: true };
    }

    // 2. 網頁版：嘗試使用現代 File System Access API (支援 Chrome/Edge)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: defaultFilename,
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(jsonStr);
            await writable.close();
            return { success: true };
        } catch (err: any) {
            if (err.name === 'AbortError') return { success: false, canceled: true };
            console.error('File System Access API failed:', err);
            // 失敗則繼續執行下方的傳統下載模式
        }
    }

    // 3. 傳統下載模式 (Fallback for Safari/Firefox/Mobile)
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    return { success: true, method: 'download' };
};
