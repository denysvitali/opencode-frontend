import { useState } from 'react';
import { Plus, Server, GitBranch, Clock, Settings, Trash2, Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import TopBar from '../layout/TopBar.js';

// TODO: Replace with real workspace data from API
const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce application with React frontend and Node.js backend',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
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
    activeSessions: 2,
    lastActivity: new Date('2024-01-20T14:30:00')
  },
  {
    id: 'ws-2', 
    name: 'Mobile App Backend',
    description: 'REST API backend for mobile application with authentication and data management',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
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
    activeSessions: 0,
    lastActivity: new Date('2024-01-18T16:45:00')
  },
  {
    id: 'ws-3',
    name: 'Data Pipeline',
    description: 'ETL pipeline for processing analytics data with Apache Spark',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    status: 'stopped' as const,
    repository: null,
    resources: {
      cpu: '4 cores',
      memory: '8GB',
      storage: '50GB'
    },
    activeSessions: 0,
    lastActivity: new Date('2024-01-12T09:30:00')
  },
  {
    id: 'ws-4',
    name: 'ML Model Training',
    description: 'Machine learning model training and experimentation environment',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15'),
    status: 'error' as const,
    repository: {
      url: 'https://github.com/company/ml-training',
      ref: 'feature/new-model',
      lastCommit: 'a1b2c3d'
    },
    resources: {
      cpu: '8 cores',
      memory: '16GB',
      storage: '100GB'
    },
    activeSessions: 1,
    lastActivity: new Date('2024-01-15T11:20:00')
  }
];

interface WorkspaceManagementProps {
  onSelectWorkspace: (workspaceId: string) => void;
}

export default function WorkspaceManagement({ onSelectWorkspace }: WorkspaceManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    repository: '',
    template: 'blank'
  });

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

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement real workspace creation
    console.log('Creating workspace:', newWorkspace);
    setShowCreateForm(false);
    setNewWorkspace({ name: '', description: '', repository: '', template: 'blank' });
  };

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
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 h-[280px]" style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)
        `
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Workspace Management</h1>
              <p className="text-gray-400">Manage your AI development environments</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-400/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Running</p>
                  <p className="text-xl font-semibold text-white">
                    {mockWorkspaces.filter(w => w.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400/20 p-2 rounded-lg">
                  <Play className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Starting</p>
                  <p className="text-xl font-semibold text-white">
                    {mockWorkspaces.filter(w => w.status === 'creating').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-400/20 p-2 rounded-lg">
                  <Square className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Stopped</p>
                  <p className="text-xl font-semibold text-white">
                    {mockWorkspaces.filter(w => w.status === 'stopped').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-400/20 p-2 rounded-lg">
                  <Server className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-xl font-semibold text-white">{mockWorkspaces.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome Project"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template
                  </label>
                  <select
                    value={newWorkspace.template}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, template: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="blank">Blank Environment</option>
                    <option value="node">Node.js Project</option>
                    <option value="python">Python Project</option>
                    <option value="react">React Application</option>
                    <option value="fullstack">Full-stack Application</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workspace is for..."
                  rows={3}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={newWorkspace.repository}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, repository: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Create Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Workspaces Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Workspaces</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockWorkspaces.map((workspace) => {
            const statusConfig = getStatusConfig(workspace.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={workspace.id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => onSelectWorkspace(workspace.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/20 p-3 rounded-lg">
                        <Server className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                            {statusConfig.label}
                          </span>
                          {workspace.activeSessions > 0 && (
                            <span className="text-xs text-gray-400">
                              {workspace.activeSessions} active session{workspace.activeSessions > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                  {/* Description */}
                  {workspace.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  {/* Repository */}
                  {workspace.repository && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <GitBranch className="h-4 w-4" />
                      <span className="truncate">
                        {workspace.repository.url.replace('https://github.com/', '')}
                      </span>
                      <span className="text-gray-500">@{workspace.repository.ref}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {workspace.repository.lastCommit}
                      </span>
                    </div>
                  )}

                  {/* Resources & Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <p><span className="text-gray-400">Resources:</span> {workspace.resources.cpu}, {workspace.resources.memory}</p>
                      <p><span className="text-gray-400">Storage:</span> {workspace.resources.storage}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last activity {workspace.lastActivity.toLocaleDateString()}</span>
                      </p>
                      <p><span className="text-gray-400">Created:</span> {workspace.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {mockWorkspaces.length === 0 && (
          <div className="text-center py-16">
            <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-8">Create your first workspace to start developing with AI</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Create Your First Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}