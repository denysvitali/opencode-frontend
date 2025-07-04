import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  MoreVertical, 
  Clock, 
  Users, 
  GitBranch,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Trash2,
  Copy
} from 'lucide-react';

interface WorkspaceStatus {
  status: 'running' | 'creating' | 'stopped' | 'error';
  message?: string;
}

interface MobileWorkspaceCardProps {
  id: string;
  name: string;
  description?: string;
  status: WorkspaceStatus['status'];
  lastActivity?: Date;
  repository?: {
    url: string;
    branch: string;
  };
  activeUsers?: number;
  sessionCount?: number;
  onSelect?: (id: string) => void;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onSettings?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

export function MobileWorkspaceCard({
  id,
  name,
  description,
  status,
  lastActivity,
  repository,
  activeUsers = 0,
  sessionCount = 0,
  onSelect,
  onStart,
  onStop,
  onSettings,
  onDelete,
  onDuplicate,
  className = ''
}: MobileWorkspaceCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
          label: 'Running'
        };
      case 'creating':
        return {
          icon: Loader2,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/20',
          label: 'Creating',
          animated: true
        };
      case 'stopped':
        return {
          icon: Square,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
          label: 'Stopped'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20',
          label: 'Error'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleCardPress = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onSelect?.(id);
  };

  const handleActionPress = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action();
    setShowActions(false);
  };

  const canStart = status === 'stopped' || status === 'error';
  const canStop = status === 'running';

  return (
    <>
      {/* Main Card */}
      <div 
        onClick={handleCardPress}
        className={`
          relative overflow-hidden
          bg-gray-800 border border-gray-700
          rounded-xl p-4
          active:scale-[0.98] active:bg-gray-750
          transition-all duration-150
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(true);
            }}
            className="
              ml-3 p-3 -m-3
              text-gray-400 hover:text-white
              rounded-lg active:bg-gray-700
              transition-colors
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
            "
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`
          inline-flex items-center gap-2 px-3 py-1.5
          rounded-full border
          ${statusConfig.bgColor} ${statusConfig.borderColor}
          mb-3
        `}>
          <StatusIcon className={`
            h-4 w-4 ${statusConfig.color}
            ${statusConfig.animated ? 'animate-spin' : ''}
          `} />
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Repository Info */}
        {repository && (
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-400 truncate">
              {repository.branch}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {activeUsers > 0 && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Users className="h-4 w-4" />
                <span>{activeUsers}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatLastActivity(lastActivity)}</span>
            </div>
          </div>
          
          {sessionCount > 0 && (
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="text-xs font-medium">
                {sessionCount} session{sessionCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        {(canStart || canStop) && (
          <button
            onClick={(e) => handleActionPress(
              () => canStart ? onStart?.(id) : onStop?.(id),
              e
            )}
            className={`
              absolute bottom-4 right-4
              w-12 h-12
              rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${canStart 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
              active:scale-95
            `}
            aria-label={canStart ? 'Start workspace' : 'Stop workspace'}
          >
            {canStart ? (
              <Play className="h-6 w-6 ml-0.5" />
            ) : (
              <Square className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* Action Sheet */}
      {showActions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowActions(false)}
          />
          
          {/* Action Sheet */}
          <div className="
            fixed bottom-0 left-0 right-0 z-50
            bg-gray-800 border-t border-gray-700
            rounded-t-xl
            animate-slide-up
            safe-area-bottom
          ">
            <div className="p-4">
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                {name}
              </h3>
              
              {/* Actions */}
              <div className="space-y-2">
                {canStart && (
                  <button
                    onClick={(e) => handleActionPress(() => onStart?.(id), e)}
                    className="
                      w-full flex items-center gap-3 p-4
                      text-green-400 hover:bg-green-400/10
                      rounded-lg transition-colors
                    "
                  >
                    <Play className="h-5 w-5" />
                    <span className="font-medium">Start Workspace</span>
                  </button>
                )}
                
                {canStop && (
                  <button
                    onClick={(e) => handleActionPress(() => onStop?.(id), e)}
                    className="
                      w-full flex items-center gap-3 p-4
                      text-red-400 hover:bg-red-400/10
                      rounded-lg transition-colors
                    "
                  >
                    <Square className="h-5 w-5" />
                    <span className="font-medium">Stop Workspace</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => handleActionPress(() => onSettings?.(id), e)}
                  className="
                    w-full flex items-center gap-3 p-4
                    text-gray-300 hover:bg-gray-700
                    rounded-lg transition-colors
                  "
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </button>
                
                <button
                  onClick={(e) => handleActionPress(() => onDuplicate?.(id), e)}
                  className="
                    w-full flex items-center gap-3 p-4
                    text-gray-300 hover:bg-gray-700
                    rounded-lg transition-colors
                  "
                >
                  <Copy className="h-5 w-5" />
                  <span className="font-medium">Duplicate</span>
                </button>
                
                <button
                  onClick={(e) => handleActionPress(() => onDelete?.(id), e)}
                  className="
                    w-full flex items-center gap-3 p-4
                    text-red-400 hover:bg-red-400/10
                    rounded-lg transition-colors
                  "
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Delete</span>
                </button>
              </div>
              
              {/* Cancel */}
              <button
                onClick={() => setShowActions(false)}
                className="
                  w-full p-4 mt-4
                  text-gray-400 hover:text-white
                  border border-gray-600 rounded-lg
                  transition-colors
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MobileWorkspaceCard;