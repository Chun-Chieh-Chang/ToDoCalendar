import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
import './AppGuide.css';

const AppGuide = () => {
    const language = useAppStore(state => state.settings.language);
    const t = useTranslation(language);

    return (
        <div className="guide-container">
            <header className="guide-header">
                <i className="ri-book-open-line guide-main-icon"></i>
                <h1>{t('guideTitle')}</h1>
                <p>{t('guideSubtitle')}</p>
            </header>

            <section className="guide-section">
                <h2><i className="ri-layout-grid-line"></i> {t('guidePagesTitle')}</h2>

                <div className="guide-card-grid">
                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-calendar-event-line"></i></div>
                        <h3>{t('guideCalendarTitle')}</h3>
                        <p>{t('guideCalendarDesc')}</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-layout-column-line"></i></div>
                        <h3>{t('guideKanbanTitle')}</h3>
                        <p>{t('guideKanbanDesc')}</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-list-check"></i></div>
                        <h3>{t('guideTaskListTitle')}</h3>
                        <p>{t('guideTaskListDesc')}</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-lightbulb-line"></i></div>
                        <h3>{t('guidePendingTitle')}</h3>
                        <p>{t('guidePendingDesc')}</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-bar-chart-fill"></i></div>
                        <h3>{t('guideInsightsTitle')}</h3>
                        <p>{t('guideInsightsDesc')}</p>
                    </div>
                </div>
            </section>

            <section className="guide-section flow-section">
                <h2><i className="ri-links-line"></i> {t('guideFlowTitle')}</h2>
                <div className="flow-content">
                    <div className="flow-step">
                        <span className="step-num">1</span>
                        <h4>{t('guideFlowStep1Title')}</h4>
                        <p>{t('guideFlowStep1Desc')}</p>
                    </div>
                    <div className="flow-connector"><i className="ri-arrow-right-line"></i></div>
                    <div className="flow-step">
                        <span className="step-num">2</span>
                        <h4>{t('guideFlowStep2Title')}</h4>
                        <p>{t('guideFlowStep2Desc')}</p>
                    </div>
                    <div className="flow-connector"><i className="ri-arrow-right-line"></i></div>
                    <div className="flow-step">
                        <span className="step-num">3</span>
                        <h4>{t('guideFlowStep3Title')}</h4>
                        <p>{t('guideFlowStep3Desc')}</p>
                    </div>
                </div>
            </section>

            <section className="guide-section tip-section">
                <h2><i className="ri-keyboard-line"></i> {t('guideShortcutsTitle')}</h2>
                <div className="shortcuts-grid">
                    <div className="shortcut-item"><kbd>1</kbd> ~ <kbd>4</kbd><span>{t('shortcutSwitchView')}</span></div>
                    <div className="shortcut-item"><kbd>N</kbd><span>{t('shortcutNewTask')}</span></div>
                    <div className="shortcut-item"><kbd>/</kbd><span>{t('shortcutSearch')}</span></div>
                    <div className="shortcut-item"><kbd>T</kbd><span>{t('shortcutToday')}</span></div>
                    <div className="shortcut-item"><kbd>Esc</kbd><span>{t('shortcutClose')}</span></div>
                </div>
            </section>

            <section className="guide-section tip-section">
                <h2><i className="ri-magic-line"></i> {t('guideTipsTitle')}</h2>
                <div className="tips-list">
                    <div className="tip-item">
                        <strong>{t('tipQuickAddTitle')}</strong> {t('tipQuickAddDesc')}
                    </div>
                    <div className="tip-item">
                        <strong>{t('tipNlpTitle')}</strong> {t('tipNlpDesc')}
                    </div>
                    <div className="tip-item">
                        <strong>{t('tipAutoSaveTitle')}</strong> {t('tipAutoSaveDesc')}
                    </div>
                    <div className="tip-item">
                        <strong>{t('tipDataTitle')}</strong> {t('tipDataDesc')}
                    </div>
                </div>
            </section>

            <section className="guide-section cta-section">
                <div className="cta-box">
                    <h3>{t('guideCtaTitle')}</h3>
                    <p>{t('guideCtaDesc')}</p>
                    <button className="cta-button" onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'calendar' }))}>
                        {t('guideCtaButton')} <i className="ri-arrow-right-line"></i>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AppGuide;
