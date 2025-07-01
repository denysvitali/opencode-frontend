import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Server, 
  ChevronDown, 
  Plus, 
  CheckCircle, 
  Square, 
  AlertCircle,
  Clock,
  GitBranch
} from 'lucide-react';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import type { Workspace } from '../../types/index.js';

interface QuickWorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onCreateNew: () => void;
  className?: string;
}

export default function QuickWorkspaceSwitcher({
  currentWorkspaceId,
  onWorkspaceSelect,
  onCreateNew,
  className = ""
}: QuickWorkspaceSwitcherProps) {
  const { workspaces, isLoading } = useWorkspaceAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter workspaces based on search
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.config?.repository?.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Workspace['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'creating':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Workspace['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10';
      case 'creating':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'error':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    onWorkspaceSelect(workspace);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors min-w-0"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Server className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {currentWorkspace ? (
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium truncate block">
                {currentWorkspace.name}
              </span>
              <div className="flex items-center gap-1">
                {getStatusIcon(currentWorkspace.status)}
                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(currentWorkspace.status)}`}>
                  {currentWorkspace.status}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Select workspace</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredWorkspaces.length > 0 ? (
              <div className="p-2">
                {filteredWorkspaces.map((workspace) => {
                  const isActive = workspace.id === currentWorkspaceId;
                  
                  return (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-600/20 border border-blue-500/50' 
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(workspace.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {workspace.name}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(workspace.status)}`}>
                              {workspace.status}
                            </span>
                          </div>
                          {workspace.config?.repository && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <GitBranch className="h-3 w-3" />
                              <span className="truncate">
                                {workspace.config.repository.url.replace('https://github.com/', '')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Updated {workspace.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                {searchQuery ? 'No workspaces found' : 'No workspaces available'}
              </div>
            )}
          </div>

          {/* Create New Button */}
          <div className="p-2 border-t border-gray-600">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
