import React from 'react';
import { WorkspaceList } from './WorkspaceList.js';
import { SessionList } from './SessionList.js';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import type { Workspace, Session } from '../../types/index.js';

type ViewMode = 'workspaces' | 'sessions' | 'chat';

export function WorkspaceView() {
  const { 
    activeWorkspace, 
    activeSession, 
    setActiveWorkspace, 
    setActiveSession 
  } = useWorkspaceAppStore();

  const [viewMode, setViewMode] = React.useState<ViewMode>('workspaces');
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(null);

  // Update view mode based on active selections
  React.useEffect(() => {
    if (activeSession && activeWorkspace) {
      setViewMode('chat');
    } else if (activeWorkspace || selectedWorkspace) {
      setViewMode('sessions');
    } else {
      setViewMode('workspaces');
    }
  }, [activeWorkspace, activeSession, selectedWorkspace]);

  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setActiveWorkspace(workspace.id);
    setViewMode('sessions');
  };

  const handleSelectSession = (session: Session) => {
    setActiveSession(session.id);
    setViewMode('chat');
  };

  const handleBackToWorkspaces = () => {
    setSelectedWorkspace(null);
    setActiveWorkspace(null);
    setActiveSession(null);
    setViewMode('workspaces');
  };

  const handleBackToSessions = () => {
    setActiveSession(null);
    setViewMode('sessions');
  };

  const renderView = () => {
    switch (viewMode) {
      case 'workspaces':
        return <WorkspaceList onSelectWorkspace={handleSelectWorkspace} />;
      
      case 'sessions': {
        const workspace = selectedWorkspace || activeWorkspace;
        if (!workspace) {
          setViewMode('workspaces');
          return <WorkspaceList onSelectWorkspace={handleSelectWorkspace} />;
        }
        return (
          <SessionList 
            workspace={workspace}
            onSelectSession={handleSelectSession}
            onBackToWorkspaces={handleBackToWorkspaces}
          />
        );
      }
      
      case 'chat':
        if (!activeSession || !activeWorkspace) {
          setViewMode(selectedWorkspace ? 'sessions' : 'workspaces');
          return null;
        }
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center">
                <button
                  onClick={handleBackToSessions}
                  className="mr-3 p-1 text-gray-500 hover:text-gray-700"
                  title="Back to sessions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{activeSession.name}</h2>
                  <p className="text-sm text-gray-500 truncate">
                    in {activeWorkspace.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="p-4 text-center text-gray-400">
                <h3 className="text-xl font-semibold mb-2">Chat Interface</h3>
                <p>Chat functionality will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <WorkspaceList onSelectWorkspace={handleSelectWorkspace} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {renderView()}
    </div>
  );
}
