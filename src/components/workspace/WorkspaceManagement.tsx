import { useState, useEffect, useCallback } from 'react';
import { Plus, Server, GitBranch, Clock, Play, Square, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import TopBar from '../layout/TopBar.js';
import WorkspaceCreationWizard, { type WorkspaceCreationData } from './WorkspaceCreationWizard.js';
import SearchAndFilter from '../ui/SearchAndFilter.js';
import LiveStatusIndicator, { ConnectionStatusDot } from '../ui/LiveStatusIndicator.js';
import MobileWorkspaceCard from '../mobile/MobileWorkspaceCard.js';
import PullToRefresh from '../mobile/PullToRefresh.js';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import { useSessionContext } from '../../utils/sessionContext.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import { useUIStore } from '../../stores/uiStore.js';
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
  
  const { isMobile } = useUIStore();
  
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


  const handleRefresh = async () => {
    await loadWorkspacesFromAPI();
  };

  const handleFilteredResults = useCallback((filteredWorkspaces: Workspace[]) => {
    setFilteredWorkspaces(filteredWorkspaces);
  }, []);

  const renderMobileView = () => (
    <div className="min-h-screen bg-gray-900">
      {/* Clean Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 safe-area-top">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Workspaces</h1>
          <p className="text-sm text-gray-400 mt-1">
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 pt-6 pb-24">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Running</p>
                  <p className="text-2xl font-bold text-white">
                    {workspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">{workspaces.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workspaces List */}
          <div className="space-y-3">
            {filteredWorkspaces.map((workspace) => (
              <MobileWorkspaceCard
                key={workspace.id}
                id={workspace.id}
                name={workspace.name}
                description={workspace.description}
                status={workspace.status}
                lastActivity={workspace.lastActivity}
                repository={workspace.repository}
                sessionCount={0} // TODO: get actual session count
                onSelect={onSelectWorkspace}
                onStart={(id) => console.log('Start workspace:', id)}
                onStop={(id) => console.log('Stop workspace:', id)}
                onSettings={(id) => console.log('Workspace settings:', id)}
                onDelete={(id) => console.log('Delete workspace:', id)}
                onDuplicate={(id) => console.log('Duplicate workspace:', id)}
              />
            ))}
          </div>
          
          {filteredWorkspaces.length === 0 && !isLoading && (
            <div className="text-center py-16" role="region" aria-label="Empty workspace list">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Server className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
              <p className="text-gray-400 mb-8">Create your first workspace to get started</p>
              <button
                onClick={() => setShowCreationWizard(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium transition-colors"
                aria-label="Create your first workspace"
              >
                Create Workspace
              </button>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {renderMobileView()}
        {showCreationWizard && (
          <WorkspaceCreationWizard
            isOpen={showCreationWizard}
            onClose={() => setShowCreationWizard(false)}
            onSubmit={handleCreateWorkspace}
            isLoading={isLoading}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <TopBar />
      
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 min-h-[180px] sm:min-h-[200px] md:h-[280px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Workspace Management</h1>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Running</p>
                  <p className="text-2xl font-bold text-white">
                    {workspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Play className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Starting</p>
                  <p className="text-2xl font-bold text-white">
                    {workspaces.filter(w => w.status === 'creating').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600/20 rounded-full flex items-center justify-center">
                  <Square className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Stopped</p>
                  <p className="text-2xl font-bold text-white">
                    {workspaces.filter(w => w.status === 'stopped').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-white">{workspaces.length}</p>
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
          <h2 className="text-xl font-semibold text-white">Workspaces ({workspaces.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreationWizard(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
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
            onFilteredResults={handleFilteredResults}
            placeholder="Search workspaces by name, repository, or description..."
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredWorkspaces.map((workspace) => {
            const statusConfig = getStatusConfig(workspace.status);

            return (
              <div
                key={workspace.id}
                className="bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-gray-600 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleWorkspaceSelect(workspace)}
                role="button"
                tabIndex={0}
                aria-label={`Open workspace ${workspace.name}. Status: ${statusConfig.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWorkspaceSelect(workspace);
                  }
                }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Server className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                          <span className="text-sm font-medium text-gray-400">
                            {statusConfig.label}
                          </span>
                          <ConnectionStatusDot 
                            size="sm" 
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 ml-2">
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>

                  {/* Repository */}
                  {workspace.config?.repository && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 p-3 bg-gray-700/50 rounded-xl">
                      <GitBranch className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate min-w-0">
                        {workspace.config.repository.url.replace('https://github.com/', '')}
                      </span>
                      <span className="text-gray-500 whitespace-nowrap">@{workspace.config.repository.ref || 'main'}</span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Updated {workspace.updatedAt.toLocaleDateString()}</span>
                      </p>
                      <p className="text-sm text-gray-500 truncate">Created {workspace.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500 truncate">User: {workspace.userId}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
            <p className="text-gray-400 mb-8">Create your first workspace to start developing with AI</p>
            <button
              onClick={() => setShowCreationWizard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-medium shadow-sm"
            >
              Create Your First Workspace
            </button>
          </div>
        )}

        {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No workspaces match your filters</h3>
            <p className="text-gray-400 mb-8">Try adjusting your search or filter criteria</p>
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
