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
      <div className="fixed bottom-0 left-0 right-0 bg-surface-secondary text-text-primary p-4 max-h-96 overflow-y-auto">
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
            <div key={i} className="border-b border-border-primary pb-1 break-words">{log}</div>
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
    <div className="page-background">
      {/* Enhanced Mobile Header */}
      <div className="hero-background border-b border-border-primary safe-area-top">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Workspaces
          </h1>
          <p className="text-text-secondary mt-2">
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 pt-6 pb-24">
          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="stats-card p-5">
              <div className="flex items-center gap-3">
                <div className="icon-container-success">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Running</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {workspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="stats-card p-5">
              <div className="flex items-center gap-3">
                <div className="icon-container-info">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Total</p>
                  <p className="text-3xl font-bold text-text-primary">{workspaces.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Workspaces List */}
          <div className="space-y-4">
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
          
          {/* Enhanced Empty States */}
          {filteredWorkspaces.length === 0 && !isLoading && (
            <div className="text-center py-16" role="region" aria-label="Empty workspace list">
              <div className="glass-card rounded-3xl p-8 mx-auto">
                <div className="icon-container-info mx-auto mb-6">
                  <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">No workspaces yet</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Create your first workspace to get started with AI development
                </p>
                <button
                  onClick={() => setShowCreationWizard(true)}
                  className="btn-primary text-lg px-8 py-4"
                  aria-label="Create your first workspace"
                >
                  Create Workspace
                </button>
              </div>
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
    <div className="page-background">
      {/* Top Bar */}
      <TopBar />
      
      {/* Enhanced Header with Hero Background */}
      <div className="hero-background border-b border-border-primary min-h-[200px] sm:min-h-[220px] md:h-[300px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Workspace Management
              </h1>
              <p className="text-text-secondary text-lg">Manage your AI development environments</p>
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

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
            <div className="stats-card p-5">
              <div className="flex items-center gap-4">
                <div className="icon-container-success">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Running</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {workspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="stats-card p-5">
              <div className="flex items-center gap-4">
                <div className="icon-container-info">
                  <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Starting</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {workspaces.filter(w => w.status === 'creating').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="stats-card p-5">
              <div className="flex items-center gap-4">
                <div className="icon-container-neutral">
                  <Square className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Stopped</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {workspaces.filter(w => w.status === 'stopped').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="stats-card p-5">
              <div className="flex items-center gap-4">
                <div className="icon-container-info">
                  <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-tertiary">Total</p>
                  <p className="text-3xl font-bold text-text-primary">{workspaces.length}</p>
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

      {/* Enhanced Workspace List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with Enhanced Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Your Workspaces</h2>
            <p className="text-text-secondary mt-1">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} available</p>
          </div>
          <button
            onClick={() => setShowCreationWizard(true)}
            className="btn-primary flex items-center gap-3"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Workspace</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Enhanced Search */}
        <div className="mb-8">
          <SearchAndFilter
            workspaces={workspaces}
            onFilteredResults={handleFilteredResults}
            placeholder="Search workspaces by name, repository, or description..."
            className="w-full"
          />
        </div>

        {/* Enhanced Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => {
            const statusConfig = getStatusConfig(workspace.status);

            return (
              <div
                key={workspace.id}
                className="workspace-card"
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
                {/* Card Header */}
                <div className="workspace-card-header p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="icon-container-info flex-shrink-0">
                        <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                          <span className="text-sm font-semibold text-text-secondary">
                            {statusConfig.label}
                          </span>
                          <ConnectionStatusDot 
                            size="sm" 
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Arrow */}
                    <div className="flex-shrink-0 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-6 w-6 text-text-tertiary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-6">
                  {/* Repository */}
                  {workspace.config?.repository && (
                    <div className="repo-card mb-4">
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-4 w-4 flex-shrink-0 text-slate-600 dark:text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {workspace.config.repository.url.replace('https://github.com/', '')}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            @{workspace.config.repository.ref || 'main'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Metadata */}
                  <div className="space-y-3 pt-4 border-t border-border-primary">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
                      <span className="text-text-secondary">
                        Updated {workspace.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex-shrink-0" />
                      <span className="text-text-tertiary">
                        Created {workspace.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Empty States */}
        {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
          <div className="text-center py-20">
            <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
              <div className="icon-container-info mx-auto mb-6">
                <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">No workspaces yet</h3>
              <p className="text-text-secondary mb-8 leading-relaxed">
                Create your first workspace to start developing with AI-powered tools and environments
              </p>
              <button
                onClick={() => setShowCreationWizard(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Create Your First Workspace
              </button>
            </div>
          </div>
        )}

        {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
          <div className="text-center py-20">
            <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
              <div className="icon-container-warning mx-auto mb-6">
                <Server className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">No matches found</h3>
              <p className="text-text-secondary leading-relaxed">
                Try adjusting your search or filter criteria to find your workspaces
              </p>
            </div>
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
