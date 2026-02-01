import { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { storageService } from '../../services/storage';
import { useAppContext } from '../../store/AppContext';
import { SettingsState } from '../../types';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSettingsChange: (settings: Partial<SettingsState>) => void;
}

const Settings = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: SettingsProps) => {
  const { t } = useAppContext();
  const [dataPath, setDataPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof (window as any).electronAPI !== 'undefined') {
      (window as any).electronAPI.getDataPath().then((path: string) => {
        setDataPath(path);
      });
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const themeOptions = [
    { value: 'light', label: t('lightTheme') },
    { value: 'dark', label: t('darkTheme') }
  ];

  const languageOptions = [
    { value: 'zh-TW', label: t('traditionalChinese') },
    { value: 'en', label: t('english') }
  ];

  const dateOptions = [
    { value: 'yyyy-MM-dd', label: '2024-01-01' },
    { value: 'dd/MM/yyyy', label: '01/01/2024' },
    { value: 'MM/dd/yyyy', label: '01/01/2024' }
  ];

  const priorityOptions = [
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settingsTitle')}>
      <div className="settings-content">
        <div className="setting-group">
          <h3>{t('interfaceSettings')}</h3>

          <div className="setting-item">
            <label>{t('theme')}</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label>{t('language')}</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label>{t('dateFormat')}</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="setting-group">
          <h3>{t('taskSettings')}</h3>

          <div className="setting-item">
            <label>{t('defaultPriority')}</label>
            <select
              value={settings.defaultPriority}
              onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label>{t('itemsPerPage')}</label>
            <select
              value={settings.itemsPerPage}
              onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
            >
              {[5, 10, 15, 20, 25, 50].map(num => (
                <option key={num} value={num}>
                  {num} {t('items')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="setting-group">
          <h3>{t('dataManagement')}</h3>

          {/* Show Data Path if in Electron */}
          {dataPath && (
            <div className="setting-item data-path-item">
              <label>資料儲存路徑</label>
              <div className="path-display" title={dataPath}>
                {dataPath}
              </div>
            </div>
          )}

          <div className="setting-item">
            <button className="btn-secondary" onClick={() => {
              const jsonStr = storageService.exportData();
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const href = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = href;
              // Remove date string from filename
              link.download = `todo_calendar_backup.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(href);
            }}>
              {t('exportData')}
            </button>
          </div>

          <div className="setting-item">
            <button className="btn-secondary" onClick={() => {
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
              {t('importData')}
            </button>
          </div>
        </div>

        <div className="setting-group">
          <h3>User Profile</h3>

          <div className="setting-item">
            <label>User Name</label>
            <input
              type="text"
              value={settings.userName || ''}
              onChange={(e) => handleSettingChange('userName', e.target.value)}
              placeholder="Enter your name"
              className="settings-input"
            />
          </div>

          <div className="setting-item profile-avatar-section">
            <label>使用者頭像</label>
            <div className="avatar-preview-container">
              <div className="avatar-preview-wrapper">
                <div className="avatar-preview">
                  {settings.userAvatar ? (
                    <img src={settings.userAvatar} alt="Avatar Preview" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="avatar-tooltip">
                  建議使用 1:1 比例的正方形圖片以獲得最佳顯示效果
                </div>
              </div>
              <div className="avatar-controls">
                <input
                  type="text"
                  value={settings.userAvatar || ''}
                  onChange={(e) => handleSettingChange('userAvatar', e.target.value)}
                  placeholder="輸入圖片網址"
                  className="settings-input avatar-url-input"
                />
                <div className="avatar-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            handleSettingChange('userAvatar', event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="avatar-file-input"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="btn-secondary avatar-upload-btn">
                    選擇圖片
                  </label>
                </div>
              </div>
            </div>
            <div className="setting-item-note">上傳圖片檔案或輸入圖片網址</div>
          </div>
        </div>
        <div className="setting-group">
          <h3>分類與標籤設定</h3>
          <div className="category-manager">
            {settings.categories.map((cat, index) => (
              <div key={cat.id} className="category-config-item">
                <input
                  type="color"
                  value={cat.color}
                  onChange={(e) => {
                    const newCats = [...settings.categories];
                    newCats[index] = { ...cat, color: e.target.value };
                    handleSettingChange('categories', newCats);
                  }}
                  className="cat-color-picker"
                />
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => {
                    const newCats = [...settings.categories];
                    newCats[index] = { ...cat, name: e.target.value };
                    handleSettingChange('categories', newCats);
                  }}
                  className="cat-name-input"
                />
                <button
                  className="btn-icon-delete"
                  onClick={() => {
                    const newCats = settings.categories.filter(c => c.id !== cat.id);
                    handleSettingChange('categories', newCats);
                  }}
                  title="刪除分類"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
            <button
              className="btn-secondary btn-add-cat"
              onClick={() => {
                const newCat = {
                  id: `cat_${Date.now()}`,
                  name: '新分類',
                  color: '#94A3B8'
                };
                handleSettingChange('categories', [...settings.categories, newCat]);
              }}
            >
              <i className="ri-add-line"></i> 新增分類
            </button>
          </div>
        </div>

        <div className="setting-actions">
          <button onClick={onClose} className="btn-cancel">
            {t('close')}
          </button>
        </div>

        <div className="setting-group privacy-shield">
          <div className="privacy-shield-header">
            <i className="ri-shield-check-line"></i>
            <h3>隱私與安全防護</h3>
          </div>
          <p className="privacy-note">
            此應用程式採用 <strong>「本地優先 (Local-First)」</strong> 架構：
          </p>
          <ul className="privacy-features">
            <li><i className="ri-checkbox-circle-line"></i> 數據僅儲存於您的目前設備，不傳送至雲端。</li>
            <li><i className="ri-checkbox-circle-line"></i> 不同使用者即使開啟相同網址，也無法存取彼此的紀錄。</li>
            <li><i className="ri-checkbox-circle-line"></i> 您的隱私受瀏覽器沙盒技術嚴格隔離。</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;