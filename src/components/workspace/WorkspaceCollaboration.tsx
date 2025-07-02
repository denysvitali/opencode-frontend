import { useState } from 'react';
import { Users, UserCheck, Clock, Eye } from 'lucide-react';
import type { UserPresence, WorkspaceCollaboration } from '../../services/websocketService.js';

interface WorkspaceCollaborationProps {
  workspaceId: string;
  collaboration: WorkspaceCollaboration | null;
  currentUserId?: string;
  className?: string;
}

export function WorkspaceCollaborationComponent({ 
  collaboration, 
  currentUserId,
  className = '' 
}: WorkspaceCollaborationProps) {
  const [showUserList, setShowUserList] = useState(false);

  if (!collaboration || collaboration.activeUsers.length === 0) {
    return null;
  }

  const activeUsers = collaboration.activeUsers.filter(user => user.userId !== currentUserId);
  const currentUser = collaboration.activeUsers.find(user => user.userId === currentUserId);

  const getStatusIcon = (status: UserPresence['status']) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-3 w-3 text-green-400" />;
      case 'idle':
        return <Clock className="h-3 w-3 text-yellow-400" />;
      case 'away':
        return <Eye className="h-3 w-3 text-gray-400" />;
      default:
        return <Users className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'active':
        return 'border-green-400';
      case 'idle':
        return 'border-yellow-400';
      case 'away':
        return 'border-gray-400';
      default:
        return 'border-gray-400';
    }
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return 'more than a day ago';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Collaboration indicator button */}
      <button
        onClick={() => setShowUserList(!showUserList)}
        className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors"
        title={`${collaboration.totalUsers} users in workspace`}
      >
        <Users className="h-4 w-4" />
        <span>{collaboration.totalUsers}</span>
        
        {/* Avatar stack for active users */}
        <div className="flex -space-x-1">
          {activeUsers.slice(0, 3).map((user) => (
            <div
              key={user.userId}
              className={`relative w-6 h-6 rounded-full border-2 ${getStatusColor(user.status)} bg-gray-600 flex items-center justify-center text-xs font-medium text-white`}
              title={`${user.username} - ${user.status}`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
              
              {/* Status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5">
                {getStatusIcon(user.status)}
              </div>
            </div>
          ))}
          
          {activeUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-gray-400 bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      </button>

      {/* User list dropdown */}
      {showUserList && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserList(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-200 mb-3">
                Active Users ({collaboration.totalUsers})
              </h3>
              
              <div className="space-y-3">
                {/* Current user */}
                {currentUser && (
                  <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                    <div className={`relative w-8 h-8 rounded-full border-2 ${getStatusColor(currentUser.status)} bg-gray-600 flex items-center justify-center text-sm font-medium text-white`}>
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        currentUser.username.charAt(0).toUpperCase()
                      )}
                      
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getStatusIcon(currentUser.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {currentUser.username}
                        </p>
                        <span className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded">
                          You
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 capitalize">
                        {currentUser.status} • {formatLastSeen(currentUser.lastSeen)}
                      </p>
                      {currentUser.sessionId && (
                        <p className="text-xs text-gray-500">
                          Session: {currentUser.sessionId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Other users */}
                {activeUsers.map((user) => (
                  <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-750">
                    <div className={`relative w-8 h-8 rounded-full border-2 ${getStatusColor(user.status)} bg-gray-600 flex items-center justify-center text-sm font-medium text-white`}>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                      
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getStatusIcon(user.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user.status} • {formatLastSeen(user.lastSeen)}
                      </p>
                      {user.sessionId && (
                        <p className="text-xs text-gray-500">
                          Session: {user.sessionId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {collaboration.totalUsers === 1 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">
                    You're the only one here. Invite others to collaborate!
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WorkspaceCollaborationComponent;