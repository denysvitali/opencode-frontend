import React from 'react';
import { Plus, Server, GitBranch, Clock, Settings, Trash2 } from 'lucide-react';
import { useWorkspaceAppStore } from '../../stores/workspaceStore.js';
import type { Workspace } from '../../types/index.js';

interface WorkspaceListProps {
  onSelectWorkspace: (workspace: Workspace) => void;
}

export function WorkspaceList({ onSelectWorkspace }: WorkspaceListProps) {
  const { 
    workspaces, 
    isLoading, 
    error,
    loadWorkspacesFromAPI, 
    createWorkspaceAPI,
    deleteWorkspaceAPI 
  } = useWorkspaceAppStore();

  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [repositoryUrl, setRepositoryUrl] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  React.useEffect(() => {
    loadWorkspacesFromAPI();
  }, [loadWorkspacesFromAPI]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    await createWorkspaceAPI(newWorkspaceName.trim(), repositoryUrl.trim() || undefined);
    setNewWorkspaceName('');
    setRepositoryUrl('');
    setShowCreateForm(false);
  };

  const handleDeleteWorkspace = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace? This will delete all sessions within it.')) {
      await deleteWorkspaceAPI(workspaceId);
    }
  };

  const getStatusColor = (status: Workspace['status']) => {
    switch (status) {
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

  const getStatusLabel = (status: Workspace['status']) => {
    switch (status) {
      case 'running': return 'Running';
      case 'creating': return 'Creating';
      case 'stopped': return 'Stopped';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Workspaces</h1>
            <p className="text-gray-400">Select a workspace to start coding with AI</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Workspace
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!newWorkspaceName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Create Workspace
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
              onClick={() => onSelectWorkspace(workspace)}
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
                    <button className="p-1 hover:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); }}>
                      <Settings className="h-4 w-4 text-gray-400" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-700 rounded text-red-400" 
                      onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                    >
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

        {workspaces.length === 0 && (
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
