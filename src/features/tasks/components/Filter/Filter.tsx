import { useRef, useEffect } from 'react';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
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
  const language = useAppStore(state => state.settings.language);
  const t = useTranslation(language);
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
    { value: '', label: t('allPriorities') },
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') }
  ];

  const categoryOptions = [
    { value: '', label: t('allCategories') },
    { value: 'work', label: t('work') },
    { value: 'study', label: t('study') },
    { value: 'life', label: t('life') },
    { value: 'other', label: t('other') }
  ];

  const statusOptions = [
    { value: 'all', label: t('allStatuses') },
    { value: 'pending', label: t('incomplete') },
    { value: 'completed', label: t('completed') }
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
            placeholder={t('searchPlaceholder')}
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
          title={t('clearAllFilters')}
        >
          🗑️ {t('clearFilters')}
        </button>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="filter-label">{t('appliedFilters')}</span>
          <div className="filter-chips">
            {filter.search && (
              <span className="filter-chip">
                {t('search')}: "{filter.search}"
                <button onClick={() => onFilterChange({ ...filter, search: '' })}>×</button>
              </span>
            )}
            {filter.priority && (
              <span className="filter-chip">
                {t('taskPriority')}: {t(filter.priority)}
                <button onClick={() => onFilterChange({ ...filter, priority: undefined })}>×</button>
              </span>
            )}
            {filter.category && (
              <span className="filter-chip">
                {t('taskCategory')}: {t(filter.category)}
                <button onClick={() => onFilterChange({ ...filter, category: undefined })}>×</button>
              </span>
            )}
            {filter.status && filter.status !== 'all' && (
              <span className="filter-chip">
                {t('statusLabel')}: {filter.status === 'completed' ? t('completed') : t('incomplete')}
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