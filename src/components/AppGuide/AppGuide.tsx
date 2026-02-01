
import './AppGuide.css';

const AppGuide = () => {
    return (
        <div className="guide-container">
            <header className="guide-header">
                <i className="ri-book-open-line guide-main-icon"></i>
                <h1>使用手冊與功能說明</h1>
                <p>探索 ToDoCalendar 的核心概念與操作流暢度</p>
            </header>

            <section className="guide-section">
                <h2><i className="ri-layout-grid-line"></i> 頁面功能詳細說明</h2>

                <div className="guide-card-grid">
                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-calendar-event-line"></i></div>
                        <h3>月曆視圖 (Calendar)</h3>
                        <p>這是您的時間地圖。雙擊日期可快速新增當日任務，單擊可查看當日摘要。適合規劃具有明確截止日期的項目。</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-layout-column-line"></i></div>
                        <h3>看板視圖 (Kanban)</h3>
                        <p>專注於「流程管理」。將任務分為「待處理」、「進行中」與「已完成」。透過拖拽卡片，您可以視覺化地掌握工作流程的瓶頸。</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-list-check"></i></div>
                        <h3>我的任務 (Task List)</h3>
                        <p>條列式清單視圖，匯整了所有「已排定日期」的任務。提供最強大的過濾功能，幫助您在海量任務中快速定位目標。</p>
                    </div>

                    <div className="guide-card">
                        <div className="card-icon"><i className="ri-inbox-line"></i></div>
                        <h3>靈感待辦牆 (Pending Wall)</h3>
                        <p>這是一個非線性的創意空間。所有「未安排日期」的任務都會以便利貼的形式出現在這裡，適合存放突如其來的靈感或隨手記下的待辦事項。</p>
                    </div>
                </div>
            </section>

            <section className="guide-section flow-section">
                <h2><i className="ri-links-line"></i> 頁面與任務的關聯邏輯</h2>
                <div className="flow-content">
                    <div className="flow-step">
                        <span className="step-num">1</span>
                        <h4>靈感捕捉</h4>
                        <p>在「待辦清單」中隨手新增不限日期的靈感。</p>
                    </div>
                    <div className="flow-connector"><i className="ri-arrow-right-line"></i></div>
                    <div className="flow-step">
                        <span className="step-num">2</span>
                        <h4>時間分配</h4>
                        <p>編輯任務並賦予其「日期」，任務將自動移動至「月曆」與「我的任務」。</p>
                    </div>
                    <div className="flow-connector"><i className="ri-arrow-right-line"></i></div>
                    <div className="flow-step">
                        <span className="step-num">3</span>
                        <h4>流程執行</h4>
                        <p>在「看板」中追蹤執行狀態，標記為「進行中」或「完成」。</p>
                    </div>
                </div>
            </section>

            <section className="guide-section tip-section">
                <h2><i className="ri-magic-line"></i> 進階操作小撇步</h2>
                <div className="tips-list">
                    <div className="tip-item">
                        <strong>快速新增：</strong> 在月曆上連按兩下，系統會自動填入該日期的預設值。
                    </div>
                    <div className="tip-item">
                        <strong>自動存檔：</strong> 您的每一筆異動都會即時同步到本地儲存，無需手動點擊保存。
                    </div>
                    <div className="tip-item">
                        <strong>隱私防護：</strong> 本工具不使用雲端資料庫，您的數據絕對隔離，他人無從存取。
                    </div>
                </div>
            </section>

            <section className="guide-section cta-section">
                <div className="cta-box">
                    <h3>準備好開始規劃了嗎？</h3>
                    <p>現在就回到月曆，開啟您高效的一天！</p>
                    <button className="cta-button" onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'calendar' }))}>
                        立即開始使用 <i className="ri-arrow-right-line"></i>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AppGuide;
