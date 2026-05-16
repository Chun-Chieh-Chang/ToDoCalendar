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
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'data'>('general');
  const [dataPath, setDataPath] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && typeof (window as any).electronAPI !== 'undefined') {
      (window as any).electronAPI.getDataPath().then((path: string) => {
        setDataPath(path);
      });
    }
  }, [isOpen]);

  const handleSettingChange = (key: string, value: any) => {
    let newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const handleExport = async () => {
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
  };

  const handleImport = () => {
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
            <i className="ri-settings-line"></i> 常規
          </button>
          <button 
            className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <i className="ri-palette-line"></i> 視覺
          </button>
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <i className="ri-database-2-line"></i> 數據
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="tab-pane">
              <div className="setting-group">
                <h3>{t('generalSettings')}</h3>
                <div className="setting-item">
                  <label>{t('language')}</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>{t('theme')}</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="light">明亮模式</option>
                    <option value="dark">深色模式</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>User Profile</h3>
                <div className="setting-item profile-info">
                  <div className="profile-label">
                    <label>使用者名稱</label>
                    <span className="profile-role">系統管理員</span>
                  </div>
                  <input 
                    type="text" 
                    value={settings.userName || 'Admin'} 
                    onChange={(e) => handleSettingChange('userName', e.target.value)}
                    placeholder="輸入顯示名稱"
                  />
                </div>
                <div className="setting-item profile-id">
                  <label>裝置 ID</label>
                  <div className="id-container">
                    <code>{settings.deviceId || 'DEV-3KIDS-2026'}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="tab-pane">
              <div className="setting-group">
                <h3>視覺效果 (Visual Effects)</h3>
                <div className="setting-item slider-item">
                  <div className="slider-label">
                    <label>玻璃不透明度</label>
                    <span>{Math.round(settings.glassOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={settings.glassOpacity}
                    onChange={(e) => handleSettingChange('glassOpacity', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="setting-item slider-item">
                  <div className="slider-label">
                    <label>模糊強度</label>
                    <span>{settings.glassBlur}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    step="1"
                    value={settings.glassBlur}
                    onChange={(e) => handleSettingChange('glassBlur', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item slider-item">
                  <div className="slider-label">
                    <label>邊框不透明度</label>
                    <span>{Math.round(settings.borderOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={settings.borderOpacity}
                    onChange={(e) => handleSettingChange('borderOpacity', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="tab-pane">
              <div className="setting-group">
                <h3>數據備份與還原</h3>
                <div className="data-buttons">
                  <button className="btn-secondary" onClick={handleExport}>
                    <i className="ri-download-cloud-2-line"></i> 立即備份 (.json)
                  </button>
                  <button className="btn-secondary" onClick={handleImport}>
                    <i className="ri-upload-cloud-2-line"></i> 還原備份檔案
                  </button>
                </div>
              </div>

              {typeof (window as any).electronAPI !== 'undefined' && (
                <div className="setting-group">
                  <h3>儲存路徑</h3>
                  <div className="data-path-info">
                    <div className="path-text">{dataPath || '載入中...'}</div>
                    <button className="btn-small" onClick={async () => {
                      const dir = await (window as any).electronAPI.selectDirectory();
                      if (dir) {
                        const res = await (window as any).electronAPI.setCustomDataPath(dir);
                        if (res.success) {
                          setDataPath(res.path);
                          alert('路徑已更新！');
                        }
                      }
                    }}>變更路徑</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <p className="version-info">v1.3.0 Professional</p>
          <button className="btn-primary" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;