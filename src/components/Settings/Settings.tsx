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
    // 如果是語言變更，立即套用以刷新介面
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settingsTitle')}>
      <div className="settings-container">
        {/* 常規設定 */}
        <div className="setting-group">
          <h3>{t('interfaceSettings')}</h3>
          <div className="setting-item">
            <label>{t('languageLabel')}</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="zh-TW">{t('traditionalChinese')}</option>
              <option value="en">{t('english')}</option>
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
              <option value="system">{t('systemTheme')}</option>
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
            <label>{t('deviceIdLabel') || '裝置 ID'}</label>
            <div className="id-container">
              <code>{settings.deviceId || 'DEV-3KIDS-2026'}</code>
            </div>
          </div>
        </div>

        <div className="setting-actions">
          <p className="version-info">
            {t('versionInfo').replace('{version}', '1.3.0')}
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            {t('saveAndClose')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;