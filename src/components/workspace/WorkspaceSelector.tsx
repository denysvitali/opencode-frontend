import { useState } from 'react';
import { Plus, Server, GitBranch, Clock, Settings, Trash2 } from 'lucide-react';
import type { Workspace } from '../../types/index.js';

// TODO: Replace with real workspace data from API
const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'E-commerce Platform',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    status: 'running',
    userId: 'user-1',
    config: {
      repository: {
        url: 'https://github.com/company/ecommerce-platform',
        ref: 'main'
      }
    }
  },
  {
    id: 'ws-2', 
    name: 'Mobile App Backend',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    status: 'creating',
    userId: 'user-1',
    config: {
      repository: {
        url: 'https://github.com/company/mobile-backend',
        ref: 'develop'
      }
    }
  },
  {
    id: 'ws-3',
    name: 'Data Pipeline',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    status: 'stopped',
    userId: 'user-1'
  }
];

interface WorkspaceSelectorProps {
  onSelectWorkspace: (workspaceId: string) => void;
}

export default function WorkspaceSelector({ onSelectWorkspace }: WorkspaceSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceRepo, setNewWorkspaceRepo] = useState('');

  const getStatusColor = (status: Workspace['status']) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/20';
      case 'creating': return 'text-yellow-400 bg-yellow-400/20';
      case 'stopped': return 'text-gray-400 bg-gray-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
    }
  };

  const getStatusLabel = (status: Workspace['status']) => {
    switch (status) {
      case 'running': return 'Running';
      case 'creating': return 'Creating';
      case 'stopped': return 'Stopped';
      case 'error': return 'Error';
    }
  };

  const handleCreateWorkspace = () => {
    // TODO: Implement real workspace creation
    console.log('Creating workspace:', { name: newWorkspaceName, repo: newWorkspaceRepo });
    setShowCreateForm(false);
    setNewWorkspaceName('');
    setNewWorkspaceRepo('');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Workspaces</h1>
            <p className="text-gray-400">Select a workspace to start coding with AI</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Workspace
          </button>
        </div>

        {/* Create Workspace Form */}
        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Workspace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={newWorkspaceRepo}
                  onChange={(e) => setNewWorkspaceRepo(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateWorkspace}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Workspace
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
              onClick={() => onSelectWorkspace(workspace.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-lg">
                      <Server className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {workspace.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                          {getStatusLabel(workspace.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); /* TODO: Implement settings */ }}>
                      <Settings className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded text-red-400" onClick={(e) => { e.stopPropagation(); /* TODO: Implement delete */ }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {workspace.config?.repository && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <GitBranch className="h-4 w-4" />
                    <span className="truncate">{workspace.config.repository.url.replace('https://github.com/', '')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Updated {workspace.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockWorkspaces.length === 0 && (
          <div className="text-center py-12">
            <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-6">Create your first workspace to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}