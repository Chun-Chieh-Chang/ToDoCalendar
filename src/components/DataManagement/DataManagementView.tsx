import { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { useAppContext } from '../../store/AppContext';
import { exportDataWithDialog } from '../../utils/exportUtils';
import './DataManagementView.css';

const DataManagementView = () => {
    const { t } = useAppContext();
    const [dataPath, setDataPath] = useState<string | null>(null);

    useEffect(() => {
        if (typeof (window as any).electronAPI !== 'undefined') {
            (window as any).electronAPI.getDataPath().then((path: string) => {
                setDataPath(path);
            });
        }
    }, []);

    return (
        <div className="data-management-view">
            <header className="page-header">
                <div className="header-info">
                    <h1><i className="ri-database-2-line"></i> {t('dataManagement')}</h1>
                    <p>管理您的任務數據、備份與儲存路徑</p>
                </div>
            </header>

            <div className="page-content">
                <div className="data-card-grid">
                    {/* 儲存路徑管理 - 僅限 Electron */}
                    {typeof (window as any).electronAPI !== 'undefined' ? (
                        <section className="data-section">
                            <h3><i className="ri-folder-settings-line"></i> 儲存路徑管理</h3>
                            <p className="section-desc">自定義您的數據檔案儲存位置，方便雲端同步或手動備份。</p>
                            <div className="data-path-control">
                                <div className="path-display" title={dataPath || '正在讀取...'}>
                                    {dataPath || '載入中...'}
                                </div>
                                <button
                                    className="btn-primary"
                                    disabled={!dataPath}
                                    onClick={async () => {
                                        const dir = await (window as any).electronAPI.selectDirectory();
                                        if (dir) {
                                            const res = await (window as any).electronAPI.setCustomDataPath(dir);
                                            if (res.success) {
                                                setDataPath(res.path);
                                                alert('儲存路徑已更新！新路徑將於下次存檔時生效。');
                                            } else {
                                                alert(`更換失敗: ${res.error}`);
                                            }
                                        }
                                    }}
                                >
                                    更換存儲目錄
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="data-section info-card">
                            <h3><i className="ri-information-line"></i> 網頁版儲存說明</h3>
                            <p>您目前使用的是網頁版，資料安全地儲存在瀏覽器的 LocalStorage 中。若需跨設備同步，建議定期執行「匯出數據」。</p>
                        </section>
                    )}

                    <div className="data-actions-grid">
                        <section className="data-section action-card">
                            <div className="card-icon export-icon">
                                <i className="ri-download-cloud-2-line"></i>
                            </div>
                            <h3>{t('exportData')}</h3>
                            <p>將所有任務與設定匯出為 JSON 檔案，用於備份或遷移至其他裝置。</p>
                            <button className="btn-secondary full-width" onClick={async () => {
                                try {
                                    const result = await exportDataWithDialog();
                                    if (result.success) {
                                        if (result.filePath) {
                                            alert(`數據已成功匯出至: ${result.filePath}`);
                                        } else if (result.method !== 'download') {
                                            alert('數據匯出成功！');
                                        }
                                    }
                                } catch (err: any) {
                                    alert(`匯出失敗: ${err.message}`);
                                }
                            }}>
                                立即備份數據
                            </button>
                        </section>

                        <section className="data-section action-card">
                            <div className="card-icon import-icon">
                                <i className="ri-upload-cloud-2-line"></i>
                            </div>
                            <h3>{t('importData')}</h3>
                            <p>從先前備份的 JSON 檔案中還原您的任務與設定。注意：這將覆蓋現有數據。</p>
                            <button className="btn-secondary full-width" onClick={() => {
                                if (!confirm('匯入數據將會覆蓋目前的任務與設定，確定要繼續嗎？')) return;
                                
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'application/json';
                                input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        if (event.target?.result) {
                                            const success = storageService.importData(event.target.result as string);
                                            if (success) {
                                                alert('匯入成功！頁面將重新載入以應用變更。');
                                                window.location.reload();
                                            } else {
                                                alert('匯入失敗，請檢查檔案格式。');
                                            }
                                        }
                                    };
                                    reader.readAsText(file);
                                };
                                input.click();
                            }}>
                                還原備份檔案
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagementView;
