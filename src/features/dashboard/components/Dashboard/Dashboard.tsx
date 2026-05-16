import { useMemo } from 'react';
import { useAppStore } from '../../../../store/useAppStore';
import { dateUtils } from '../../../../shared/utils/dateUtils';
import { CategoryConfig } from '../../../../types';
import { motion } from 'framer-motion';
import './Dashboard.css';

// SVG 面積圖組件
const AreaChart = ({ data, maxCount }: { data: { label: string, count: number }[], maxCount: number }) => {
    const width = 800;
    const height = 200;
    const padding = 40;
    
    // 計算坐標點
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.count / maxCount) * (height - padding * 2) + padding);
        return { x, y, count: d.count };
    });

    // 建立平滑路徑 (Bezier Curve)
    const createSmoothPath = (points: {x: number, y: number}[]) => {
        if (points.length < 2) return "";
        let path = `M ${points[0].x} ${points[0].y}`;
        
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i+1];
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp1y = curr.y;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            const cp2y = next.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
        }
        return path;
    };

    const smoothPath = createSmoothPath(points);
    const areaPath = `${smoothPath} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div className="chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="area-chart-svg">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* 網格線 */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
                
                {/* 面積填充 */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={areaPath}
                    fill="url(#areaGradient)"
                />
                
                {/* 主路徑線 */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={smoothPath}
                    fill="none"
                    stroke="var(--primary-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                
                {/* 數據點 */}
                {points.map((p, i) => (
                    <g key={i} className="chart-point-group">
                        <motion.circle
                            initial={{ r: 0 }}
                            animate={{ r: 5 }}
                            transition={{ delay: 1 + i * 0.1 }}
                            cx={p.x}
                            cy={p.y}
                            fill="var(--bg-color)"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                        />
                        <text x={p.x} y={p.y - 15} textAnchor="middle" className="point-label">
                            {p.count > 0 ? p.count : ''}
                        </text>
                        <text x={p.x} y={height - 10} textAnchor="middle" className="axis-label">
                            {data[i].label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const Dashboard = () => {
    const state = useAppStore();
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
                <p>{language === 'en' ? 'Track your task trends and distribution' : '您的任務趨勢與執行效率分析'}</p>
            </header>

            <div className="stats-overview">
                <div className="stat-card primary glass-card">
                    <div className="card-bg-icon"><i className="ri-donut-chart-line"></i></div>
                    <div className="stat-value">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {stats.completionRate}%
                        </motion.span>
                    </div>
                    <div className="stat-label">{language === 'en' ? 'Completion' : '完成率'}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="card-bg-icon"><i className="ri-task-line"></i></div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">{language === 'en' ? 'Total' : '總任務'}</div>
                </div>
                <div className="stat-card success glass-card">
                    <div className="card-bg-icon"><i className="ri-checkbox-circle-line"></i></div>
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-label">{language === 'en' ? 'Done' : '已完成'}</div>
                </div>
                <div className="stat-card warning glass-card">
                    <div className="card-bg-icon"><i className="ri-time-line"></i></div>
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">{language === 'en' ? 'Pending' : '待處理'}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-section chart-section glass-card full-width">
                    <h3><i className="ri-pulse-line"></i> {language === 'en' ? 'Weekly Productivity Trend' : '生產力趨勢 (近七日)'}</h3>
                    <AreaChart data={stats.last7Days} maxCount={stats.maxTrendCount} />
                </section>

                <section className="dashboard-section category-section glass-card">
                    <h3><i className="ri-pie-chart-2-line"></i> {language === 'en' ? 'Category Distribution' : '任務領域分布'}</h3>
                    <div className="cat-list">
                        {[...stats.catStats].sort((a, b) => b.count - a.count).map(cat => (
                            <div key={cat.id} className="cat-stat-item">
                                <div className="cat-info">
                                    <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
                                    <span className="cat-name">{cat.name}</span>
                                    <span className="cat-count">{cat.count}</span>
                                </div>
                                <div className="progress-bg">
                                    <motion.div
                                        className="progress-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.total > 0 ? (cat.count / stats.total) * 100 : 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        style={{ backgroundColor: cat.color }}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-section priority-section glass-card">
                    <h3><i className="ri-flag-2-line"></i> {language === 'en' ? 'Priority Distribution' : '優先級分佈'}</h3>
                    <div className="priority-stats-container">
                        {['high', 'medium', 'low'].map(p => (
                            <div key={p} className={`priority-item ${p}`}>
                                <div className="priority-label">{p.toUpperCase()}</div>
                                <div className="priority-bar-wrapper">
                                    <motion.div 
                                        className="priority-bar"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(stats.priorityStats[p as keyof typeof stats.priorityStats] / stats.total) * 100 || 0}%` }}
                                    />
                                </div>
                                <div className="priority-value">{stats.priorityStats[p as keyof typeof stats.priorityStats]}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
