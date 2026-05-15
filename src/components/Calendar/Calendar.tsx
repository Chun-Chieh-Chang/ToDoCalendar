import { format } from 'date-fns';
import * as React from 'react';
import './Calendar.css';
import { Task, CategoryConfig } from '../../types';
import { getBestContrastForOverlay } from '../../utils/contrastUtils';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: string;
  onDateSelect: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  tasks: Task[];
  categories: CategoryConfig[];
  theme?: 'light' | 'dark';
  t: (key: string) => any;
}

const Calendar = ({
  currentMonth,
  selectedDate,
  onDateSelect,
  onDateDoubleClick,
  tasks,
  categories,
  theme = 'light',
  t
}: CalendarProps) => {
  const days = (React as any).useMemo(() => {
    const getMonthDays = (date: Date) => {
      const days = [];
      const safeDate = isNaN(date.getTime()) ? new Date() : date;
      const start = new Date(safeDate.getFullYear(), safeDate.getMonth(), 1);
      const startDate = new Date(start);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      const daysInMonth = new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 0).getDate();
      const firstDayIndex = start.getDay();
      const daysNeeded = (isNaN(firstDayIndex) ? 0 : firstDayIndex) + (isNaN(daysInMonth) ? 30 : daysInMonth);
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
        if (!map.has(task.date)) map.set(task.date, []);
        map.get(task.date)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasksByDate.get(dateStr) || [];
  };

  const getTaskStyle = (task: any) => {
    const category = categories.find(c => c.id === task.category);
    if (category) {
      const baseBg = theme === 'dark' ? '#1E293B' : '#FFFFFF';
      const textColor = getBestContrastForOverlay(category.color, baseBg, 0.2, '#111827', '#F1F5F9');
      return {
        borderLeftColor: category.color,
        backgroundColor: `${category.color}20`,
        color: textColor
      };
    }
    return {};
  };

  return (
    <div className="calendar-view">
      <div className="calendar-grid">
        {/* Weekday Headers - NOW INSIDE GRID */}
        {t('weekdays').map((day: string) => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {/* Date Cells */}
        {days.map((day: Date, index: number) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isSelected = format(day, 'yyyy-MM-dd') === selectedDate;
          const tasksForDay = getTasksForDate(day);

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDateSelect(day)}
              onDoubleClick={() => isCurrentMonth && onDateDoubleClick(day)}
            >
              <div className="day-number">{day.getDate()}</div>
              
              <div className="day-tasks">
                {tasksForDay.slice(0, 3).map((task, idx) => (
                  <div 
                    key={idx} 
                    className={`calendar-task-item ${task.completed ? 'completed' : ''}`}
                    style={getTaskStyle(task)}
                  >
                    {task.title}
                  </div>
                ))}
                {tasksForDay.length > 3 && (
                  <div className="task-indicator">+{tasksForDay.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
