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
                    <p>{t('dataManagementDesc')}</p>
                </div>
            </header>

            <div className="page-content">
                <div className="data-card-grid">
                    {/* 儲存路徑管理 - 僅限 Electron */}
                    {typeof (window as any).electronAPI !== 'undefined' ? (
                        <section className="data-section">
                            <h3><i className="ri-folder-settings-line"></i> {t('dataPathManagement')}</h3>
                            <p className="section-desc">{t('dataPathDesc')}</p>
                            <div className="data-path-control">
                                <div className="path-display" title={dataPath || t('pathLoading')}>
                                    {dataPath || t('pathLoading')}
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
                                                alert(t('dataPathUpdated'));
                                            } else {
                                                alert(`${t('dataPathUpdateFailed')}: ${res.error}`);
                                            }
                                        }
                                    }}
                                >
                                    {t('changePath')}
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="data-section info-card">
                            <h3><i className="ri-information-line"></i> {t('webStorageHintTitle')}</h3>
                            <p>{t('webStorageHintDesc')}</p>
                        </section>
                    )}

                    <div className="data-actions-grid">
                        <section className="data-section action-card">
                            <div className="card-icon export-icon">
                                <i className="ri-download-cloud-2-line"></i>
                            </div>
                            <h3>{t('exportData')}</h3>
                            <p>{t('dataManagementDesc')}</p>
                            <button className="btn-secondary full-width" onClick={async () => {
                                try {
                                    const result = await exportDataWithDialog();
                                    if (result.success) {
                                        if (result.filePath) {
                                            alert(`${t('exportSuccess')}: ${result.filePath}`);
                                        } else if (result.method !== 'download') {
                                            alert(t('exportData'));
                                        }
                                    }
                                } catch (err: any) {
                                    alert(`${t('exportData')} ${t('importFailed')}: ${err.message}`);
                                }
                            }}>
                                {t('backupNow')}
                            </button>
                        </section>

                        <section className="data-section action-card">
                            <div className="card-icon import-icon">
                                <i className="ri-upload-cloud-2-line"></i>
                            </div>
                            <h3>{t('importData')}</h3>
                            <p>{t('importConfirm').replace('?', '')}</p>
                            <button className="btn-secondary full-width" onClick={() => {
                                if (!confirm(t('importConfirm'))) return;
                                
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
                                                alert(t('importSuccess'));
                                                window.location.reload();
                                            } else {
                                                alert(t('importFailed'));
                                            }
                                        }
                                    };
                                    reader.readAsText(file);
                                };
                                input.click();
                            }}>
                                {t('restoreNow')}
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagementView;
