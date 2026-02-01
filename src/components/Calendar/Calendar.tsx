
import { format } from 'date-fns';
import * as React from 'react';
import './Calendar.css';
import { Task, CategoryConfig } from '../../types';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: string;
  onDateSelect: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  tasks: Task[];
  categories: CategoryConfig[];
}

const Calendar = ({
  currentMonth,
  selectedDate,
  onDateSelect,
  onDateDoubleClick,
  onMonthChange,
  tasks,
  categories
}: CalendarProps) => {
  // 使用 useMemo 優化性能
  const days = (React as any).useMemo(() => {
    const getMonthDays = (date: Date) => {
      const days = [];
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const startDate = new Date(start);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      // 計算需要的行數 (5行或6行)
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      // 簡單判斷：如果第一天+當月天數補齊第一週空缺後小於等於35，則只要35格
      const firstDayIndex = start.getDay();
      const daysNeeded = firstDayIndex + daysInMonth;
      const renderDays = daysNeeded <= 35 ? 35 : 42;

      for (let i = 0; i < renderDays; i++) {
        days.push(new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
      }
      return days;
    };

    return getMonthDays(currentMonth);
  }, [currentMonth]);

  const tasksByDate = (React as any).useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.date) {
        if (!map.has(task.date)) {
          map.set(task.date, []);
        }
        map.get(task.date)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasksByDate.get(dateStr) || [];
  };



  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {['週日', '週一', '週二', '週三', '週四', '週五', '週六'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day: Date, index: number) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isSelected = format(day, 'yyyy-MM-dd') === selectedDate;
          const tasksForDay = getTasksForDate(day);
          const hasTasks = tasksForDay.length > 0;

          // 懸停時顯示完整任務列表
          const taskListTooltip = tasksForDay.map((task: any) => {
            const status = task.completed ? '✓' : '○';
            const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
            return `${status} ${priorityIcon} ${task.title}`;
          }).join('\n');

          // 獲取任務顏色樣式
          const getTaskStyle = (task: any) => {
            const category = categories.find(c => c.id === task.category);
            if (category) {
              return {
                borderLeftColor: category.color,
                backgroundColor: `${category.color}20`, // 20% opacity
                color: category.color
              };
            }

            // Fallback to priority colors if category not found
            if (task.priority === 'high') return { borderLeftColor: '#ef4444' };
            if (task.priority === 'medium') return { borderLeftColor: '#f59e0b' };
            if (task.priority === 'low') return { borderLeftColor: '#10b981' };

            return {};
          };

          return (
            <button
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''
                } ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDateSelect(day)}
              onDoubleClick={() => isCurrentMonth && onDateDoubleClick(day)}
              disabled={!isCurrentMonth}
              title={tasksForDay.length > 0 ? `此日有 ${tasksForDay.length} 個任務\n${taskListTooltip}\n\n雙擊查看詳情` : '雙擊查看任務列表'}
            >
              <div className="day-number">{day.getDate()}</div>

              {/* 任務預覽 - 顯示前2個任務 */}
              {hasTasks && (
                <div className="task-preview">
                  {tasksForDay.slice(0, 2).map((task: any, idx: number) => (
                    <div
                      key={idx}
                      className="task-preview-item"
                      style={getTaskStyle(task)}
                      title={task.title}
                    >
                      {task.time && <span className="task-time">{task.time}</span>}
                      {task.title}
                    </div>
                  ))}
                </div>
              )}

              {/* 任務數量指示器 */}
              {tasksForDay.length > 2 && (
                <div className="task-indicator">
                  +{tasksForDay.length - 2}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
