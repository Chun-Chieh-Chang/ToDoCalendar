import React, { useRef, useEffect } from 'react';
import './Filter.css';

interface FilterProps {
  filter: any;
  onFilterChange: (filter: any) => void;
  onClearFilter: () => void;
}

const Filter = ({
  filter,
  onFilterChange,
  onClearFilter
}: FilterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocus = () => {
      // 延遲一點點確保頁面切換動畫完成
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };
    window.addEventListener('focus-search', handleFocus);
    return () => window.removeEventListener('focus-search', handleFocus);
  }, []);

  const priorityOptions = [
    { value: '', label: '全部優先級' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' }
  ];

  const categoryOptions = [
    { value: '', label: '全部分類' },
    { value: 'work', label: '工作' },
    { value: 'study', label: '學習' },
    { value: 'life', label: '生活' },
    { value: 'other', label: '其他' }
  ];

  const statusOptions = [
    { value: 'all', label: '全部狀態' },
    { value: 'pending', label: '未完成' },
    { value: 'completed', label: '已完成' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    onFilterChange({ ...filter, [field]: value || undefined });
  };

  const hasActiveFilters = filter.priority || filter.category || filter.status !== 'all' || filter.search;

  return (
    <div className="filter-container">
      <div className="filter-group">
        <div className="filter-item search">
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋任務標題、描述或記事..."
            value={filter.search || ''}
            onChange={handleInputChange}
            className="search-input"
          />
          <span className="search-icon">🔎</span>
        </div>

        <div className="filter-item">
          <select
            value={filter.priority || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('priority', e.target.value)}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select
            value={filter.category || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('category', e.target.value)}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select
            value={filter.status || 'all'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`filter-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={onClearFilter}
          title="清除所有篩選條件"
        >
          🗑️ 清除篩選
        </button>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="filter-label">已套用篩選：</span>
          <div className="filter-chips">
            {filter.search && (
              <span className="filter-chip">
                搜尋: "{filter.search}"
                <button onClick={() => onFilterChange({ ...filter, search: '' })}>×</button>
              </span>
            )}
            {filter.priority && (
              <span className="filter-chip">
                優先級: {filter.priority === 'high' ? '高' : filter.priority === 'medium' ? '中' : '低'}
                <button onClick={() => onFilterChange({ ...filter, priority: undefined })}>×</button>
              </span>
            )}
            {filter.category && (
              <span className="filter-chip">
                分類: {filter.category === 'work' ? '工作' : filter.category === 'study' ? '學習' : filter.category === 'life' ? '生活' : '其他'}
                <button onClick={() => onFilterChange({ ...filter, category: undefined })}>×</button>
              </span>
            )}
            {filter.status && filter.status !== 'all' && (
              <span className="filter-chip">
                狀態: {filter.status === 'completed' ? '已完成' : '未完成'}
                <button onClick={() => onFilterChange({ ...filter, status: 'all' })}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;