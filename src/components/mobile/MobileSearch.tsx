import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowUpLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import { useUIStore } from '../../stores/uiStore.js';

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'workspace' | 'session' | 'file';
  path: string;
  lastAccess?: Date;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { workspaces } = useWorkspaceAppStore();
  const { isMobile } = useUIStore();

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    const searchTimeout = setTimeout(() => {
      const results: SearchResult[] = [];
      
      // Search workspaces
      workspaces.forEach(workspace => {
        if (workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({
            id: workspace.id,
            title: workspace.name,
            subtitle: workspace.description || 'Workspace',
            type: 'workspace',
            path: `/workspace/${workspace.id}`,
            lastAccess: workspace.updatedAt
          });
        }
      });

      // TODO: Add session search when available
      // TODO: Add file search when available

      setSearchResults(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, workspaces]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    
    setSearchQuery(query);
  };

  const handleResultSelect = (result: SearchResult) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    handleSearch(result.title);
    navigate(result.path);
    onClose();
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.value = query;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 safe-area-top">
      {/* Search Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-2 -m-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close search"
          >
            <ArrowUpLeft className="h-6 w-6" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search workspaces, sessions, files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="
                w-full pl-10 pr-4 py-3
                bg-gray-800 border border-gray-700
                rounded-lg text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  if (searchInputRef.current) {
                    searchInputRef.current.value = '';
                    searchInputRef.current.focus();
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-full"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Results</h2>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className="
                    w-full p-4 bg-gray-800 rounded-lg border border-gray-700
                    hover:border-gray-600 transition-colors
                    text-left
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-xs capitalize">
                        {result.type}
                      </span>
                      {result.lastAccess && (
                        <span className="text-xs">
                          {result.lastAccess.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No results found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(query)}
                  className="
                    w-full p-3 bg-gray-800 rounded-lg border border-gray-700
                    hover:border-gray-600 transition-colors
                    text-left flex items-center gap-3
                  "
                >
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-white">{query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!searchQuery && recentSearches.length === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Search Tips</h2>
            <div className="space-y-3 text-sm text-gray-400">
              <p>• Search for workspace names or descriptions</p>
              <p>• Find recent sessions and files</p>
              <p>• Use keywords to narrow results</p>
              <p>• Recent searches are saved for quick access</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileSearch;