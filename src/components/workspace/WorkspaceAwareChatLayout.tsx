import { useState } from 'react';
import TopBar from '../layout/TopBar.js';
import WorkspaceAwareHeader from './WorkspaceAwareHeader.js';
import WorkspaceAwareSidebar from './WorkspaceAwareSidebar.js';
import FileExplorer from '../filesystem/FileExplorer.js';
import GitDiffView from '../filesystem/GitDiffView.js';
import TerminalView from '../terminal/TerminalView.js';
import { useUIStore } from '../../stores/uiStore.js';
import { 
  MessageCircle, 
  Folder, 
  GitBranch, 
  Terminal, 
  Maximize2,
  Minimize2
} from 'lucide-react';

interface WorkspaceAwareChatLayoutProps {
  workspaceId: string;
  sessionId: string;
  onBackToWorkspaces: () => void;
  onBackToSessions: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function WorkspaceAwareChatLayout({
  workspaceId,
  sessionId,
  onBackToWorkspaces,
  onBackToSessions,
  onSelectSession
}: WorkspaceAwareChatLayoutProps) {
  const { activeView, setActiveView } = useUIStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);

  const navigationItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'filesystem', label: 'Files', icon: Folder },
    { id: 'git-diff', label: 'Git Diff', icon: GitBranch },
    { id: 'terminal', label: 'Terminal', icon: Terminal }
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'filesystem':
        return <FileExplorer />;
      case 'git-diff':
        return <GitDiffView />;
      case 'terminal':
        return <TerminalView />;
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="text-center text-gray-400 mt-8">
                <h3 className="text-xl font-semibold mb-2">Chat Interface</h3>
                <p>Chat functionality will be implemented here.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  const handleCreateSession = () => {
    // TODO: Implement session creation
    console.log('Creating new session in workspace:', workspaceId);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden" style={{
      background: `
        radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)
      `
    }}>
      {/* Top Bar */}
      <TopBar />
      
      {/* Workspace-Aware Header */}
      <WorkspaceAwareHeader
        workspaceId={workspaceId}
        onBackToWorkspaces={onBackToWorkspaces}
        onBackToSessions={onBackToSessions}
        onOpenWorkspaceSettings={() => setShowWorkspaceSettings(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Session Sidebar */}
        <div 
          className={`transition-all duration-300 ease-out ${
            isSidebarCollapsed ? 'w-0' : 'w-80'
          } overflow-hidden`}
        >
          <WorkspaceAwareSidebar
            workspaceId={workspaceId}
            activeSessionId={sessionId}
            onSelectSession={onSelectSession}
            onCreateSession={handleCreateSession}
          />
        </div>

        {/* Main Chat/Tool Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tool Navigation */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-40">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as 'chat' | 'filesystem' | 'git-diff' | 'terminal')}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white"
                  title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
                >
                  {isSidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Animated Content Transition */}
            <div className="h-full w-full transition-all duration-300 ease-out">
              {renderMainContent()}
            </div>

            {/* Floating Action Button for Mobile */}
            <div className="absolute bottom-6 right-6 md:hidden">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Settings Modal */}
      {showWorkspaceSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Workspace Settings</h3>
              <button
                onClick={() => setShowWorkspaceSettings(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Resource Limits */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Resource Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">CPU Cores</label>
                    <input
                      type="number"
                      defaultValue={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Memory (GB)</label>
                    <input
                      type="number"
                      defaultValue={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Storage (GB)</label>
                    <input
                      type="number"
                      defaultValue={20}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Environment Variables</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="KEY"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <input
                      type="text"
                      placeholder="value"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowWorkspaceSettings(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}