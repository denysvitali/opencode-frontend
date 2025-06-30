import React from 'react';
import { ArrowLeft, Plus, MessageCircle, Clock, Trash2, Settings, Server, GitBranch } from 'lucide-react';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import type { Session, Workspace } from '../../types/index.js';

interface SessionListProps {
  workspace: Workspace;
  onSelectSession: (session: Session) => void;
  onBackToWorkspaces: () => void;
}

export function SessionList({ workspace, onSelectSession, onBackToWorkspaces }: SessionListProps) {
  const { 
    sessions, 
    isLoading, 
    error,
    loadSessionsFromAPI, 
    createSessionAPI,
    deleteSessionAPI 
  } = useWorkspaceAppStore();

  const [newSessionName, setNewSessionName] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  React.useEffect(() => {
    loadSessionsFromAPI(workspace.id);
  }, [workspace.id, loadSessionsFromAPI]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    await createSessionAPI(workspace.id, newSessionName.trim());
    setNewSessionName('');
    setShowCreateForm(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session? All messages will be lost.')) {
      await deleteSessionAPI(workspace.id, sessionId);
    }
  };

  const getStatusColor = (state: Session['state']) => {
    switch (state) {
      case 'running':
        return 'text-green-400 bg-green-400/20';
      case 'creating':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusLabel = (state: Session['state']) => {
    switch (state) {
      case 'running': return 'Active';
      case 'creating': return 'Starting';
      case 'stopped': return 'Stopped';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToWorkspaces}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <Server className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{workspace.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                    {getStatusLabel(workspace.status)}
                  </span>
                  {workspace.config?.repository && (
                    <>
                      <span>•</span>
                      <GitBranch className="h-3 w-3" />
                      <span>{workspace.config.repository.url.replace('https://github.com/', '')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
        </div>
      </div>


      <div className="p-6">
        {/* Create Session Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Start New Chat Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  placeholder="What are you working on?"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newSessionName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Start Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="text-red-400">{error.message}</div>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Chat Sessions</h2>
          
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
              onClick={() => onSelectSession(session)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageCircle className="h-5 w-5 text-blue-400" />
                      <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                        {session.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.state)}`}>
                        {getStatusLabel(session.state)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last active {session.updatedAt.toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>Created {session.createdAt.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        // TODO: Implement session settings
                      }}
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No chat sessions yet</h3>
            <p className="text-gray-500 mb-6">Start your first chat session to begin working with AI</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
