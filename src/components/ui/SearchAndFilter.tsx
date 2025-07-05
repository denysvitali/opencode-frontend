import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, Calendar, GitBranch } from 'lucide-react';
import type { Workspace, Session } from '../../types/index.js';

export interface SearchFilters {
  query: string;
  status: ('running' | 'creating' | 'stopped' | 'error')[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  hasRepository: boolean | null; // null = all, true = with repo, false = without repo
  sortBy: 'name' | 'created' | 'updated' | 'activity';
  sortOrder: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  workspaces?: Workspace[];
  sessions?: Session[];
  onFilteredResults: (workspaces: Workspace[], sessions: Session[]) => void;
  placeholder?: string;
  showSessionFilters?: boolean;
  className?: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  status: [],
  dateRange: {},
  hasRepository: null,
  sortBy: 'updated',
  sortOrder: 'desc'
};

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running', color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' },
  { value: 'creating', label: 'Creating', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
  { value: 'stopped', label: 'Stopped', color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/30' },
  { value: 'error', label: 'Error', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' }
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'activity', label: 'Recent Activity' }
] as const;

export default function SearchAndFilter({
  workspaces = [],
  sessions = [],
  onFilteredResults,
  placeholder = "Search workspaces and sessions...",
  className = ""
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search and filter logic
  const filteredResults = useMemo(() => {
    let filteredWorkspaces = [...workspaces];
    let filteredSessions = [...sessions];

    // Apply text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      
      filteredWorkspaces = filteredWorkspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(query) ||
        workspace.config?.repository?.url.toLowerCase().includes(query) ||
        workspace.labels?.description?.toLowerCase().includes(query)
      );

      filteredSessions = filteredSessions.filter(session =>
        session.name.toLowerCase().includes(query) ||
        session.config?.context?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filteredWorkspaces = filteredWorkspaces.filter(workspace =>
        filters.status.includes(workspace.status)
      );

      filteredSessions = filteredSessions.filter(session =>
        filters.status.includes(session.state as 'running' | 'creating' | 'stopped' | 'error')
      );
    }

    // Apply repository filter
    if (filters.hasRepository !== null) {
      filteredWorkspaces = filteredWorkspaces.filter(workspace => {
        const hasRepo = !!workspace.config?.repository?.url;
        return filters.hasRepository ? hasRepo : !hasRepo;
      });
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start;
      const endDate = filters.dateRange.end;

      if (startDate) {
        filteredWorkspaces = filteredWorkspaces.filter(workspace =>
          workspace.createdAt >= startDate
        );
        filteredSessions = filteredSessions.filter(session =>
          session.createdAt >= startDate
        );
      }

      if (endDate) {
        filteredWorkspaces = filteredWorkspaces.filter(workspace =>
          workspace.createdAt <= endDate
        );
        filteredSessions = filteredSessions.filter(session =>
          session.createdAt <= endDate
        );
      }
    }

    // Apply sorting
    const sortFn = (a: Workspace | Session, b: Workspace | Session) => {
      let valueA: string | number, valueB: string | number;

      switch (filters.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'created':
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        case 'updated':
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        case 'activity':
          // For workspaces, use updatedAt; for sessions, use updatedAt as well
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    };

    filteredWorkspaces.sort(sortFn);
    filteredSessions.sort(sortFn);

    return { workspaces: filteredWorkspaces, sessions: filteredSessions };
  }, [workspaces, sessions, filters]);

  // Notify parent of filtered results (use a timeout to defer the state update)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilteredResults(filteredResults.workspaces, filteredResults.sessions);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [filteredResults, onFilteredResults]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setShowAdvancedFilters(false);
    setShowDatePicker(false);
  }, []);

  const toggleStatusFilter = useCallback((status: SearchFilters['status'][0]) => {
    updateFilters({
      status: filters.status.includes(status)
        ? filters.status.filter(s => s !== status)
        : [...filters.status, status]
    });
  }, [filters.status, updateFilters]);

  const hasActiveFilters = useMemo(() => {
    return filters.query.trim() !== '' ||
           filters.status.length > 0 ||
           filters.hasRepository !== null ||
           filters.dateRange.start ||
           filters.dateRange.end ||
           filters.sortBy !== 'updated' ||
           filters.sortOrder !== 'desc';
  }, [filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="input-base w-full pl-12 pr-16 py-4 text-lg"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showAdvancedFilters || hasActiveFilters
                  ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-secondary'
              }`}
              title="Advanced Filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-xl transition-all duration-200 text-text-tertiary hover:text-text-primary hover:bg-surface-secondary"
                title="Clear Filters"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Advanced Filters */}
      {showAdvancedFilters && (
        <div className="glass-card rounded-2xl p-6 border border-border-primary space-y-6">
          {/* Status Filters */}
          <div>
            <label className="block text-lg font-semibold text-text-primary mb-4">
              Status
            </label>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleStatusFilter(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filters.status.includes(value)
                      ? color
                      : 'text-text-secondary bg-surface-secondary hover:bg-surface-tertiary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Repository Filter */}
          <div>
            <label className="block text-lg font-semibold text-text-primary mb-4">
              Repository
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateFilters({ hasRepository: null })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filters.hasRepository === null
                    ? 'text-text-inverse bg-blue-600'
                    : 'text-text-secondary bg-surface-secondary hover:bg-surface-tertiary'
                }`}
              >
                All
              </button>
              <button
                onClick={() => updateFilters({ hasRepository: true })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filters.hasRepository === true
                    ? 'text-text-inverse bg-blue-600'
                    : 'text-text-secondary bg-surface-secondary hover:bg-surface-tertiary'
                }`}
              >
                <GitBranch className="h-4 w-4" />
                With Repository
              </button>
              <button
                onClick={() => updateFilters({ hasRepository: false })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filters.hasRepository === false
                    ? 'text-text-inverse bg-blue-600'
                    : 'text-text-secondary bg-surface-secondary hover:bg-surface-tertiary'
                }`}
              >
                No Repository
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-lg font-semibold text-text-primary mb-4">
              Created Date
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-secondary text-text-primary rounded-xl text-sm hover:bg-surface-tertiary transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                {filters.dateRange.start || filters.dateRange.end ? 'Custom Range' : 'Select Range'}
              </button>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <button
                  onClick={() => updateFilters({ dateRange: {} })}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showDatePicker && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="input-base w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-text-primary mb-4">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                className="input-base w-full"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-text-primary mb-4">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as SearchFilters['sortOrder'] })}
                className="input-base w-full"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-secondary font-medium">Active filters:</span>
          {filters.query && (
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
              "{filters.query}"
            </span>
          )}
          {filters.status.map(status => (
            <span key={status} className="bg-surface-tertiary text-text-primary px-3 py-1 rounded-full font-medium">
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
            </span>
          ))}
          {filters.hasRepository !== null && (
            <span className="bg-surface-tertiary text-text-primary px-3 py-1 rounded-full font-medium">
              {filters.hasRepository ? 'With Repository' : 'No Repository'}
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="bg-surface-tertiary text-text-primary px-3 py-1 rounded-full flex items-center gap-2 font-medium">
              <Calendar className="h-3 w-3" />
              Date Range
            </span>
          )}
          <span className="text-text-tertiary">
            ({filteredResults.workspaces.length} workspaces, {filteredResults.sessions.length} sessions)
          </span>
        </div>
      )}
    </div>
  );
}
