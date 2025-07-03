import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageCircle, Clock, Trash2, Settings, GitBranch, Play, Square, Users, CheckCircle, AlertCircle } from 'lucide-react';
import TopBar from '../layout/TopBar.js';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';

// TODO: Replace with real data from workspace API
/*
const mockWorkspaces = {
  'ws-1': {
    id: 'ws-1',
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce application with React frontend and Node.js backend',
    status: 'running' as const,
    repository: {
      url: 'https://github.com/company/ecommerce-platform',
      ref: 'main',
      lastCommit: '3f2a1b5'
    },
    resources: {
      cpu: '2 cores',
      memory: '4GB',
      storage: '20GB'
    },
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-20T14:30:00')
  },
  'ws-2': {
    id: 'ws-2',
    name: 'Mobile App Backend',
    description: 'REST API backend for mobile application with authentication and data management',
    status: 'creating' as const,
    repository: {
      url: 'https://github.com/company/mobile-backend',
      ref: 'develop',
      lastCommit: '8c9d2e1'
    },
    resources: {
      cpu: '1 core',
      memory: '2GB',
      storage: '10GB'
    },
    createdAt: new Date('2024-01-10'),
    lastActivity: new Date('2024-01-18T16:45:00')
  },
  'ws-3': {
    id: 'ws-3',
    name: 'Data Pipeline',
    description: 'ETL pipeline for processing analytics data with Apache Spark',
    status: 'stopped' as const,
    repository: null,
    resources: {
      cpu: '4 cores',
      memory: '8GB',
      storage: '50GB'
    },
    createdAt: new Date('2024-01-05'),
    lastActivity: new Date('2024-01-12T09:30:00')
  }
};
*/

// TODO: Replace with real session data from workspace API
/*
const mockSessionsByWorkspace = {
  'ws-1': [
    {
      id: 'sess-1',
      name: 'Implement Stripe payment integration',
      workspaceId: 'ws-1',
      createdAt: new Date('2024-01-20T10:00:00'),
      updatedAt: new Date('2024-01-20T14:30:00'),
      status: 'active' as const,
      messageCount: 23,
      lastMessage: 'Great! The payment integration is working. Let me run the tests to make sure everything is solid.',
      tags: ['payment', 'stripe', 'backend']
    },
    {
      id: 'sess-2',
      name: 'Debug user authentication issues',
      workspaceId: 'ws-1',
      createdAt: new Date('2024-01-19T15:00:00'),
      updatedAt: new Date('2024-01-19T16:45:00'),
      status: 'completed' as const,
      messageCount: 15,
      lastMessage: 'Perfect! The JWT token validation is now working correctly. The issue was in the middleware order.',
      tags: ['auth', 'jwt', 'bug-fix']
    },
    {
      id: 'sess-3',
      name: 'Add product search with Elasticsearch',
      workspaceId: 'ws-1',
      createdAt: new Date('2024-01-18T09:00:00'),
      updatedAt: new Date('2024-01-18T17:30:00'),
      status: 'paused' as const,
      messageCount: 31,
      lastMessage: 'I need to check the Elasticsearch configuration. Let me examine the docker-compose file.',
      tags: ['search', 'elasticsearch', 'feature']
    }
  ],
  'ws-2': [
    {
      id: 'sess-5',
      name: 'Setup JWT authentication',
      workspaceId: 'ws-2',
      createdAt: new Date('2024-01-18T09:00:00'),
      updatedAt: new Date('2024-01-18T14:30:00'),
      status: 'active' as const,
      messageCount: 12,
      lastMessage: 'The JWT middleware is configured. Now working on the refresh token logic.',
      tags: ['auth', 'jwt', 'security']
    },
    {
      id: 'sess-6',
      name: 'Design user registration API',
      workspaceId: 'ws-2',
      createdAt: new Date('2024-01-17T14:00:00'),
      updatedAt: new Date('2024-01-17T18:45:00'),
      status: 'completed' as const,
      messageCount: 8,
      lastMessage: 'User registration endpoint is complete with email validation and password hashing.',
      tags: ['api', 'registration', 'validation']
    }
  ],
  'ws-3': [
    {
      id: 'sess-7',
      name: 'Configure Apache Spark cluster',
      workspaceId: 'ws-3',
      createdAt: new Date('2024-01-12T10:00:00'),
      updatedAt: new Date('2024-01-12T16:30:00'),
      status: 'paused' as const,
      messageCount: 18,
      lastMessage: 'Spark cluster is configured but having memory allocation issues with large datasets.',
      tags: ['spark', 'configuration', 'performance']
    }
  ]
};
*/

interface WorkspaceContextProps {
  workspaceId: string;
  onBack: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function WorkspaceContext({ workspaceId, onBack, onSelectSession }: WorkspaceContextProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings' | 'activity'>('sessions');
  // const [isCreatingDefaultSession, setIsCreatingDefaultSession] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');

  // Get workspace and sessions from store
  const { 
    workspaces, 
    sessions, 
    isLoading,
    loadSessionsFromAPI,
    // createSessionAPI,
    // deleteSessionAPI 
  } = useWorkspaceAppStore();

  // Find the current workspace
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  const workspaceSessions = sessions.filter(s => s.workspaceId === workspaceId);

  // Load data on mount
  useEffect(() => {
    // Only load sessions for the specific workspace (workspaces should already be loaded by WorkspaceManagement)
    if (workspaceId) {
      loadSessionsFromAPI(workspaceId);
    }
  }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps -- Intentionally limited to avoid infinite loops

  // Don't auto-create default session - let user choose to create one
  // This allows users to see the session list first before creating a session

  // Minimal debug logging - only log significant events
  useEffect(() => {
    if (workspaceId && !currentWorkspace && workspaces.length > 0) {
      console.warn('WorkspaceContext - Workspace not found:', workspaceId, 'Available:', workspaces.map(w => w.id));
    }
  }, [workspaceId, currentWorkspace, workspaces]);

  // Show loading state while workspaces are being loaded OR if we don't have the specific workspace yet
  if ((isLoading && workspaces.length === 0) || (workspaces.length > 0 && !currentWorkspace)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading workspace...</h2>
          <p className="text-gray-400">Please wait while we load your workspace data.</p>
          <p className="text-gray-500 text-sm mt-2">Looking for workspace: {workspaceId}</p>
        </div>
      </div>
    );
  }

  // If workspace not found after loading, show error or redirect
  if (!currentWorkspace && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Workspace not found</h2>
          <p className="text-gray-400 mb-4">The workspace you're looking for doesn't exist or couldn't be loaded.</p>
          <p className="text-gray-500 mb-4">Looking for workspace ID: {workspaceId}</p>
          <p className="text-gray-500 mb-4">Available workspaces: {workspaces.map(w => w.id).join(', ')}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Workspaces
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-400/20', label: 'Running' };
      case 'creating':
        return { icon: Play, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', label: 'Starting' };
      case 'stopped':
        return { icon: Square, color: 'text-gray-400', bgColor: 'bg-gray-400/20', label: 'Stopped' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-400/20', label: 'Error' };
      default:
        return { icon: Square, color: 'text-gray-400', bgColor: 'bg-gray-400/20', label: 'Unknown' };
    }
  };

  const getSessionStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-400', bgColor: 'bg-green-400/20', label: 'Active' };
      case 'completed':
        return { color: 'text-blue-400', bgColor: 'bg-blue-400/20', label: 'Completed' };
      case 'paused':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', label: 'Paused' };
      default:
        return { color: 'text-gray-400', bgColor: 'bg-gray-400/20', label: 'Unknown' };
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    // TODO: Implement real session creation
    setShowCreateForm(false);
    setNewSessionName('');
    setNewSessionDescription('');
  };

  const handleSessionAction = (_action: string, _sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement session actions
  };

  // Additional safety check
  if (!currentWorkspace) {
    return null;
  }

  const workspaceStatus = getStatusConfig(currentWorkspace.status);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <TopBar />
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 h-[280px]" style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)
        `
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 h-full flex flex-col justify-center">
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 group"
              title="Back to Workspaces"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-white" />
            </button>
            <span className="text-gray-500 text-sm">Back to Workspaces</span>
          </div>

          {/* Main Content */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspace.name}</h1>
              <p className="text-gray-400">{currentWorkspace.labels?.description || 'AI Development Workspace'}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-gray-400">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${workspaceStatus.color} ${workspaceStatus.bgColor}`}>
                    {workspaceStatus.label}
                  </span>
                </div>
                {currentWorkspace.config?.repository && (
                  <div className="flex items-center gap-1 justify-end">
                    <GitBranch className="h-3 w-3" />
                    <span>{currentWorkspace.config.repository.url.replace('https://github.com/', '')}</span>
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                <Settings className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { id: 'sessions', label: 'Chat Sessions', icon: MessageCircle },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'activity', label: 'Activity', icon: Clock }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'sessions' | 'settings' | 'activity')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'sessions' && (
                    <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                      {workspaceSessions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'sessions' && (
          <div>
            {/* Sessions Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Chat Sessions</h2>
              <button
                onClick={() => {
                  // Quick start a new chat session
                  const mockSessionId = `session-${Date.now()}`;
                  onSelectSession(mockSessionId);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Chat Session</span>
                <span className="sm:hidden">New Chat</span>
              </button>
            </div>

            {/* Create Session Form */}
            {showCreateForm && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Start New Chat Session</h3>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What are you working on?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Add user authentication, Fix database performance"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Additional Context (Optional)
                    </label>
                    <textarea
                      placeholder="Provide any additional context or requirements..."
                      value={newSessionDescription}
                      onChange={(e) => setNewSessionDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!newSessionName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      Start Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4">
              {workspaceSessions.map((session) => {
                const sessionStatus = getSessionStatusConfig(session.state);

                return (
                  <div
                    key={session.id}
                    className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSession(session.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open session: ${session.name}`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3">
                            <MessageCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                              {session.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sessionStatus.color} ${sessionStatus.bgColor} flex-shrink-0`}>
                              {sessionStatus.label}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {session.config?.context || 'No description available'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Session</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Updated {session.updatedAt.toLocaleDateString()}</span>
                            </div>
                            {session.labels && Object.keys(session.labels).length > 0 && (
                              <div className="flex gap-1">
                                {Object.entries(session.labels).map(([key, value]) => (
                                  <span key={key} className="bg-gray-700 px-2 py-1 rounded text-xs">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 sm:ml-4 flex-shrink-0">
                          <button 
                            className="p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg transition-colors"
                            onClick={(e) => handleSessionAction('settings', session.id, e)}
                            aria-label={`Settings for ${session.name}`}
                            title="Session settings"
                          >
                            <Settings className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </button>
                          <button 
                            className="p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg transition-colors text-red-400"
                            onClick={(e) => handleSessionAction('delete', session.id, e)}
                            aria-label={`Delete ${session.name}`}
                            title="Delete session"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {workspaceSessions.length === 0 && (
              <div className="text-center py-16">
                <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No chat sessions yet</h3>
                <p className="text-gray-500 mb-8">Start your first chat session to begin working with AI in this workspace</p>
                <button
                  onClick={() => {
                    // Auto-create and navigate to a new session
                    const mockSessionId = `session-${Date.now()}`;
                    onSelectSession(mockSessionId);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                >
                  Start First Chat
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Workspace Settings</h3>
            <p className="text-gray-400">Workspace settings panel coming soon...</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
            <p className="text-gray-400">Activity monitoring coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
