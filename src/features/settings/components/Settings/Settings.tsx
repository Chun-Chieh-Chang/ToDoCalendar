import { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
import { SettingsState } from '../../../../types';
import { storageService } from '../../../../services/storage';
import { exportDataWithDialog } from '../../utils/exportUtils';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

const Settings = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: SettingsProps) => {
  const language = useAppStore(state => state.settings.language);
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const [dataPath, setDataPath] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && typeof (window as any).electronAPI !== 'undefined') {
      (window as any).electronAPI.getDataPath().then((path: string) => {
        setDataPath(path);
      });
    }
  }, [isOpen]);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const handleExport = async () => {
    try {
      const result = await exportDataWithDialog();
      if (result.success) {
        if (result.filePath) {
          alert(`${t('exportSuccess')}: ${result.filePath}`);
        } else if (result.method !== 'download') {
          alert(t('exportDone'));
        }
      }
    } catch (err: any) {
      alert(`${t('exportFailed')}: ${err.message}`);
    }
  };

  const handleImport = () => {
    if (!confirm(t('importConfirm'))) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const result = await storageService.importData(event.target.result as string);
          if (result) {
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
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="settings-container">
        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="ri-settings-line"></i> {t('tabGeneral')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <i className="ri-database-2-line"></i> {t('tabData')}
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="tab-pane">
              <div className="setting-group">
                <h3>{t('interfaceSettings')}</h3>
                <div className="setting-item">
                  <label>{t('languageLabel')}</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>{t('themeLabel')}</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="light">{t('lightTheme')}</option>
                    <option value="dark">{t('darkTheme')}</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>{t('userProfile')}</h3>
                <div className="setting-item profile-info">
                  <div className="profile-label">
                    <label>{t('userNameLabel')}</label>
                    <span className="profile-role">{t('systemAdmin')}</span>
                  </div>
                  <input
                    type="text"
                    value={settings.userName || 'Admin'}
                    onChange={(e) => handleSettingChange('userName', e.target.value)}
                    placeholder={t('enterDisplayName')}
                  />
                </div>
                <div className="setting-item profile-id">
                  <label>{t('deviceIdLabel')}</label>
                  <div className="id-container">
                    <code>{settings.deviceId || 'DEV-3KIDS-2026'}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="tab-pane">
              <div className="setting-group">
                <h3>{t('backupRestore')}</h3>
                <div className="data-buttons">
                  <button className="btn-secondary" onClick={handleExport}>
                    <i className="ri-download-cloud-2-line"></i> {t('backupNow')}
                  </button>
                  <button className="btn-secondary" onClick={handleImport}>
                    <i className="ri-upload-cloud-2-line"></i> {t('restoreNow')}
                  </button>
                </div>
              </div>

              {typeof (window as any).electronAPI !== 'undefined' && (
                <div className="setting-group">
                  <h3>{t('dataPathManagement')}</h3>
                  <div className="data-path-info">
                    <div className="path-text">{dataPath || t('pathLoading')}</div>
                    <button className="btn-small" onClick={async () => {
                      const dir = await (window as any).electronAPI.selectDirectory();
                      if (dir) {
                        const res = await (window as any).electronAPI.setCustomDataPath(dir);
                        if (res.success) {
                          setDataPath(res.path);
                          alert(t('dataPathUpdated'));
                        }
                      }
                    }}>{t('changePath')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <p className="version-info">v{__APP_VERSION__} Professional</p>
          <button className="btn-primary" onClick={onClose}>
            {t('finish')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;
