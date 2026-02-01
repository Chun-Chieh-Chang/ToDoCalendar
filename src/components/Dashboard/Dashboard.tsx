import { useMemo } from 'react';
import { useAppContext } from '../../store/AppContext';
import { dateUtils } from '../../utils/dateUtils';
import { CategoryConfig } from '../../types';
import './Dashboard.css';

const Dashboard = () => {
    const { state } = useAppContext();

    // Defensive access
    const tasks = state?.tasks || [];
    const settings = state?.settings || {};
    const categories: CategoryConfig[] = settings?.categories || [];
    const language = (settings?.language === 'en' || settings?.language === 'zh-TW') ? settings.language : 'zh-TW';

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const catStats = categories.map(cat => ({
            ...cat,
            count: tasks.filter(t => t.category === cat.id).length
        }));

        const priorityStats = {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = dateUtils.dateToString(date);
            return {
                label: i === 6 ? (language === 'en' ? 'Today' : '今天') : dateUtils.formatDate(date, 'MM/dd', language),
                count: tasks.filter(t => t.date === dateStr && t.completed).length
            };
        });

        const maxTrendCount = Math.max(...last7Days.map(d => d.count), 1);

        return { total, completed, pending, completionRate, catStats, priorityStats, last7Days, maxTrendCount };
    }, [tasks, categories, language]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>{language === 'en' ? 'Productivity Dashboard' : '數據洞察中心'}</h1>
                <p>{language === 'en' ? 'Track your task trends and distribution' : '任務完成概況與分布統計'}</p>
            </header>

            <div className="stats-overview">
                <div className="stat-card primary">
                    <div className="stat-value">{stats.completionRate}%</div>
                    <div className="stat-label">{language === 'en' ? 'Completion Rate' : '總體完成率'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">{language === 'en' ? 'Total Tasks' : '任務總數'}</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-label">{language === 'en' ? 'Completed' : '已完成'}</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">{language === 'en' ? 'Pending' : '待處理'}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-section chart-section">
                    <h3><i className="ri-bar-chart-fill"></i> {language === 'en' ? 'Last 7 Days Trend' : '近七日趨勢'}</h3>
                    <div className="bar-chart">
                        {stats.last7Days.map((day: { label: string, count: number }, i: number) => (
                            <div key={i} className="bar-wrapper">
                                <div
                                    className="bar"
                                    style={{ height: `${(day.count / stats.maxTrendCount) * 100}%` }}
                                    title={`${day.count} tasks`}
                                >
                                    {day.count > 0 && <span className="bar-count">{day.count}</span>}
                                </div>
                                <span className="bar-label">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-section category-section">
                    <h3><i className="ri-pie-chart-fill"></i> {language === 'en' ? 'Category Distribution' : '分類分布'}</h3>
                    <div className="cat-list">
                        {[...stats.catStats].sort((a, b) => b.count - a.count).map(cat => (
                            <div key={cat.id} className="cat-stat-item">
                                <div className="cat-info">
                                    <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
                                    <span className="cat-name">{cat.name}</span>
                                    <span className="cat-count">{cat.count}</span>
                                </div>
                                <div className="progress-bg">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            backgroundColor: cat.color,
                                            width: `${stats.total > 0 ? (cat.count / stats.total) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {stats.catStats.length === 0 && <div className="text-muted">{language === 'en' ? 'No category data' : '暫無分類數據'}</div>}
                    </div>
                </section>

                <section className="dashboard-section priority-section">
                    <h3><i className="ri-flag-fill"></i> {language === 'en' ? 'Priority Breakdown' : '優先級分布'}</h3>
                    <div className="priority-grid">
                        <div className="priority-box high">
                            <span className="p-label">{language === 'en' ? 'High' : '高'}</span>
                            <span className="p-value">{stats.priorityStats.high}</span>
                        </div>
                        <div className="priority-box medium">
                            <span className="p-label">{language === 'en' ? 'Med' : '中'}</span>
                            <span className="p-value">{stats.priorityStats.medium}</span>
                        </div>
                        <div className="priority-box low">
                            <span className="p-label">{language === 'en' ? 'Low' : '低'}</span>
                            <span className="p-value">{stats.priorityStats.low}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
