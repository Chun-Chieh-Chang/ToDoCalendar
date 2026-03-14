import Modal from '../Modal/Modal';
import { useAppContext } from '../../store/AppContext';
import { SettingsState } from '../../types';
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
  const { t } = useAppContext();

  const handleSettingChange = (key: string, value: any) => {
    let newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="settings-container">
        {/* 常規設定 */}
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

        <div className="settings-footer">
          <p className="version-info">版本: 1.2.0 | ToDoCalendar Desktop</p>
          <button className="btn-primary" onClick={onClose}>
            {t('saveAndClose') || '關閉'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;