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
  { value: 'running', label: 'Running', color: 'text-green-400 bg-green-400/20' },
  { value: 'creating', label: 'Creating', color: 'text-yellow-400 bg-yellow-400/20' },
  { value: 'stopped', label: 'Stopped', color: 'text-gray-400 bg-gray-400/20' },
  { value: 'error', label: 'Error', color: 'text-red-400 bg-red-400/20' }
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
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-12 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1 rounded transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'text-blue-400 bg-blue-400/20'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Advanced Filters"
            >
              <Filter className="h-4 w-4" />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-1 rounded transition-colors text-gray-400 hover:text-white"
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleStatusFilter(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filters.status.includes(value)
                      ? color
                      : 'text-gray-400 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Repository Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repository
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ hasRepository: null })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filters.hasRepository === null
                    ? 'text-white bg-gray-600'
                    : 'text-gray-400 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => updateFilters({ hasRepository: true })}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filters.hasRepository === true
                    ? 'text-white bg-gray-600'
                    : 'text-gray-400 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <GitBranch className="h-3 w-3" />
                With Repository
              </button>
              <button
                onClick={() => updateFilters({ hasRepository: false })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filters.hasRepository === false
                    ? 'text-white bg-gray-600'
                    : 'text-gray-400 bg-gray-700 hover:bg-gray-600'
                }`}
              >
                No Repository
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Created Date
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors"
              >
                <Calendar className="h-3 w-3" />
                {filters.dateRange.start || filters.dateRange.end ? 'Custom Range' : 'Select Range'}
              </button>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <button
                  onClick={() => updateFilters({ dateRange: {} })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            {showDatePicker && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value ? new Date(e.target.value) : undefined
                      }
                    })}
                    className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as SearchFilters['sortOrder'] })}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Active filters:</span>
          {filters.query && (
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              "{filters.query}"
            </span>
          )}
          {filters.status.map(status => (
            <span key={status} className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
            </span>
          ))}
          {filters.hasRepository !== null && (
            <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
              {filters.hasRepository ? 'With Repository' : 'No Repository'}
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date Range
            </span>
          )}
          <span className="text-gray-500">
            ({filteredResults.workspaces.length} workspaces, {filteredResults.sessions.length} sessions)
          </span>
        </div>
      )}
    </div>
  );
}
