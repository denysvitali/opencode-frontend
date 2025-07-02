import { useState, useEffect, useCallback } from 'react';
import { Plus, Server, GitBranch, Clock, Settings, Trash2, Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import TopBar from '../layout/TopBar.js';
import WorkspaceCreationWizard, { type WorkspaceCreationData } from './WorkspaceCreationWizard.js';
import SearchAndFilter from '../ui/SearchAndFilter.js';
import LiveStatusIndicator, { ConnectionStatusDot } from '../ui/LiveStatusIndicator.js';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import { useSessionContext } from '../../utils/sessionContext.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import type { Workspace } from '../../types/index.js';

// Mobile debug console
const MobileDebugPanel = ({ isOpen, onToggle, logs, isPaused, onTogglePause }: { 
  isOpen: boolean; 
  onToggle: () => void; 
  logs: string[]; 
  isPaused: boolean; 
  onTogglePause: () => void;
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg z-50 md:hidden"
        title="Show Debug Logs"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Debug Logs</h3>
          <div className="flex gap-2">
            <button 
              onClick={onTogglePause} 
              className={`px-2 py-1 text-xs rounded ${isPaused ? 'bg-green-600' : 'bg-yellow-600'}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={onToggle} className="text-red-400 text-xl">×</button>
          </div>
        </div>
        <div className="text-xs space-y-1">
          {logs.slice(-20).map((log, i) => (
            <div key={i} className="border-b border-gray-700 pb-1 break-words">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface WorkspaceManagementProps {
  onSelectWorkspace: (workspaceId: string) => void;
}
interface WorkspaceManagementProps {
  onSelectWorkspace: (workspaceId: string) => void;
}

export default function WorkspaceManagement({ onSelectWorkspace }: WorkspaceManagementProps) {
  const { 
    workspaces, 
    isLoading, 
    createWorkspaceAPI,
    loadWorkspacesFromAPI
  } = useWorkspaceAppStore();
  
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [showMobileDebug, setShowMobileDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [debugPaused, setDebugPaused] = useState(false);
  const { saveContext } = useSessionContext();
  
  // Mobile debug logging
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    if (!debugPaused) {
      setDebugLogs(prev => [...prev.slice(-50), logEntry]); // Keep last 50 logs
    }
    console.log(logEntry);
  }, [debugPaused]);

  // Real-time updates removed to fix infinite connection loop
  // Will be re-implemented with proper dependency management

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'n',
        metaKey: true,
        action: () => setShowCreationWizard(true),
        description: 'Create new workspace'
      },
      {
        key: 'r',
        metaKey: true,
        action: () => loadWorkspacesFromAPI(),
        description: 'Refresh workspaces'
      }
    ],
    enabled: !showCreationWizard
  });

  // Initialize filtered workspaces with all workspaces
  useEffect(() => {
    addDebugLog(`Workspaces updated: ${workspaces.length} items`);
    setFilteredWorkspaces(workspaces);
  }, [workspaces, addDebugLog]);

  // Load workspaces on component mount only if needed
  useEffect(() => {
    if (workspaces.length === 0 && !isLoading) {
      addDebugLog('Component mounted, loading workspaces...');
      loadWorkspacesFromAPI();
    }
  }, [workspaces.length, isLoading, loadWorkspacesFromAPI, addDebugLog]);

  // Removed debug effect that was causing performance issues

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          label: 'Running'
        };
      case 'creating':
        return {
          icon: Play,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          label: 'Starting'
        };
      case 'stopped':
        return {
          icon: Square,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          label: 'Stopped'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          label: 'Error'
        };
      default:
        return {
          icon: Square,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          label: 'Unknown'
        };
    }
  };

  const handleCreateWorkspace = useCallback(async (workspaceData: WorkspaceCreationData) => {
    try {
      await createWorkspaceAPI(
        workspaceData.name, 
        workspaceData.repository?.url
      );
      setShowCreationWizard(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      // Error is handled by the store
    }
  }, [createWorkspaceAPI]);

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    addDebugLog(`Selecting workspace: ${workspace.id} (${workspace.name})`);
    saveContext(workspace.id, null, workspace.name);
    onSelectWorkspace(workspace.id);
  }, [addDebugLog, saveContext, onSelectWorkspace]);

  const handleWorkspaceAction = (action: string, workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement workspace actions (start, stop, delete, etc.)
    console.log(`${action} workspace:`, workspaceId);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <TopBar />
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 min-h-[180px] sm:min-h-[200px] md:h-[280px]" style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)
        `
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Workspace Management</h1>
              <p className="text-gray-400 text-sm md:text-base">Manage your AI development environments</p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-4">
              <LiveStatusIndicator 
                showDetails={true}
                className="hidden md:block"
              />
              <ConnectionStatusDot size="md" className="md:hidden" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 sm:mt-6 md:mt-8">
            <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-green-400/20 p-1.5 md:p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Running</p>
                  <p className="text-xl font-semibold text-white">
                    {workspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-yellow-400/20 p-1.5 md:p-2 rounded-lg">
                  <Play className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Starting</p>
                  <p className="text-xl font-semibold text-white">
                    {workspaces.filter(w => w.status === 'creating').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-gray-400/20 p-1.5 md:p-2 rounded-lg">
                  <Square className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Stopped</p>
                  <p className="text-xl font-semibold text-white">
                    {workspaces.filter(w => w.status === 'stopped').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-blue-400/20 p-1.5 md:p-2 rounded-lg">
                  <Server className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-xl font-semibold text-white">{workspaces.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Creation Wizard */}
      <WorkspaceCreationWizard
        isOpen={showCreationWizard}
        onClose={() => setShowCreationWizard(false)}
        onSubmit={handleCreateWorkspace}
        isLoading={isLoading}
      />

      {/* Workspace List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Workspaces Header with Search */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white">Workspaces ({workspaces.length})</h2>
          <div className="flex gap-2">
            {/* Debug navigation buttons */}
            <button
              onClick={() => {
                console.log('DEBUG: Direct navigation test to ws-1');
                console.log('DEBUG: Available workspaces:', workspaces.map(w => w.id));
                console.log('DEBUG: Calling onSelectWorkspace with ws-1');
                onSelectWorkspace('ws-1');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Test ws-1
            </button>
            <button
              onClick={() => setShowCreationWizard(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Workspace</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchAndFilter
            workspaces={workspaces}
            onFilteredResults={useCallback((filteredWorkspaces) => {
              setFilteredWorkspaces(filteredWorkspaces);
            }, [])}
            placeholder="Search workspaces by name, repository, or description..."
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredWorkspaces.map((workspace) => {
            const statusConfig = getStatusConfig(workspace.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={workspace.id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-blue-600/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                        <Server className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                            {statusConfig.label}
                          </span>
                          {/* Real-time status indicator for this workspace */}
                          <ConnectionStatusDot 
                            size="sm" 
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      {workspace.status === 'stopped' && (
                        <button 
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-green-400"
                          onClick={(e) => handleWorkspaceAction('start', workspace.id, e)}
                          title="Start workspace"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {workspace.status === 'running' && (
                        <button 
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-yellow-400"
                          onClick={(e) => handleWorkspaceAction('stop', workspace.id, e)}
                          title="Stop workspace"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={(e) => handleWorkspaceAction('settings', workspace.id, e)}
                        title="Workspace settings"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                        onClick={(e) => handleWorkspaceAction('delete', workspace.id, e)}
                        title="Delete workspace"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Repository */}
                  {workspace.config?.repository && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-4">
                      <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate min-w-0">
                        {workspace.config.repository.url.replace('https://github.com/', '')}
                      </span>
                      <span className="text-gray-500 whitespace-nowrap">@{workspace.config.repository.ref || 'main'}</span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs text-gray-500">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Updated {workspace.updatedAt.toLocaleDateString()}</span>
                      </p>
                      <p className="truncate"><span className="text-gray-400">Created:</span> {workspace.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="truncate"><span className="text-gray-400">User:</span> {workspace.userId}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
          <div className="text-center py-16">
            <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-8">Create your first workspace to start developing with AI</p>
            <button
              onClick={() => setShowCreationWizard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Create Your First Workspace
            </button>
          </div>
        )}

        {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
          <div className="text-center py-16">
            <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workspaces match your filters</h3>
            <p className="text-gray-500 mb-8">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Mobile Debug Panel */}
      <MobileDebugPanel 
        isOpen={showMobileDebug} 
        onToggle={() => setShowMobileDebug(!showMobileDebug)}
        logs={debugLogs}
        isPaused={debugPaused}
        onTogglePause={() => setDebugPaused(!debugPaused)}
      />
    </div>
  );
}
