import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  MoreHorizontal, 
  Clock, 
  GitBranch,
  Settings,
  Trash2,
  Copy,
  ChevronRight
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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Remove unused variable warning
  void activeUsers;

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-emerald-500',
          label: 'Running',
          textColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'creating':
        return {
          color: 'bg-blue-500',
          label: 'Creating',
          textColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'stopped':
        return {
          color: 'bg-slate-500',
          label: 'Stopped',
          textColor: 'text-slate-600 dark:text-slate-400'
        };
      case 'error':
        return {
          color: 'bg-red-500',
          label: 'Error',
          textColor: 'text-red-600 dark:text-red-400'
        };
    }
  };

  const statusConfig = getStatusConfig();

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
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onSelect?.(id);
  };

  const handleActionPress = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action();
    setShowActions(false);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    if (touch) {
      const startX = touch.clientX;
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        if (moveTouch) {
          const deltaX = moveTouch.clientX - startX;
          setSwipeOffset(Math.max(-100, Math.min(100, deltaX)));
        }
      };
      
      const handleTouchEnd = () => {
        setIsDragging(false);
        if (Math.abs(swipeOffset) > 50) {
          if (swipeOffset > 0) {
            // Swipe right - quick actions
            if (status === 'stopped') {
              onStart?.(id);
            } else if (status === 'running') {
              onStop?.(id);
            }
          } else {
            // Swipe left - show actions
            setShowActions(true);
          }
        }
        setSwipeOffset(0);
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
  };

  return (
    <>
      {/* Main Card */}
      <div 
        onClick={handleCardPress}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        className={`
          workspace-card p-0 hover:scale-[1.01] active:scale-[0.97]
          ${className}
        `}
        role="button"
        tabIndex={0}
        aria-label={`${name} workspace. Status: ${statusConfig.label}. ${description || ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardPress();
          }
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-text-primary truncate mb-2 leading-tight">
                {name}
              </h3>
              {description && (
                <p className="text-base text-text-secondary line-clamp-2 leading-relaxed">
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
                ml-3 p-2 hover:bg-surface-secondary rounded-xl 
                transition-all duration-200 ease-out
                hover:scale-110 active:scale-95
                transform-gpu will-change-transform
              "
              aria-label="More actions"
            >
              <MoreHorizontal className="h-5 w-5 text-text-tertiary" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`
              w-2.5 h-2.5 rounded-full ${statusConfig.color}
              ${status === 'running' ? 'animate-pulse' : ''}
              ${status === 'creating' ? 'animate-pulse' : ''}
            `} />
            <span className={`text-base font-semibold ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
            {sessionCount > 0 && (
              <>
                <span className="text-text-tertiary">•</span>
                <span className="text-base text-text-secondary">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Repository */}
          {repository && (
            <div className="repo-card mb-4">
              <div className="flex items-center gap-3">
                <GitBranch className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-base text-text-primary font-medium truncate">
                  {repository.branch}
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Clock className="h-4 w-4" />
              <span className="text-base">{formatLastActivity(lastActivity)}</span>
            </div>
            
            <ChevronRight className="h-5 w-5 text-text-tertiary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Action Sheet */}
      {showActions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={() => setShowActions(false)}
          />
          
          {/* Action Sheet */}
          <div className="
            fixed bottom-0 left-0 right-0 z-50
            glass-card rounded-t-3xl border-t border-border-primary
            animate-slide-up
            safe-area-bottom
          ">
            <div className="p-6">
              {/* Handle */}
              <div className="w-10 h-1 bg-border-secondary rounded-full mx-auto mb-6" />
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-text-primary mb-6 text-center leading-tight">
                {name}
              </h3>
              
              {/* Actions */}
              <div className="space-y-2">
                {status === 'stopped' && (
                  <button
                    onClick={(e) => handleActionPress(() => onStart?.(id), e)}
                    className="
                      w-full flex items-center gap-4 p-4
                      text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                      rounded-xl transition-colors
                    "
                  >
                    <div className="icon-container-success">
                      <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-semibold text-lg">Start Workspace</span>
                  </button>
                )}
                
                {status === 'running' && (
                  <button
                    onClick={(e) => handleActionPress(() => onStop?.(id), e)}
                    className="
                      w-full flex items-center gap-4 p-4
                      text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20
                      rounded-xl transition-colors
                    "
                  >
                    <div className="icon-container-warning">
                      <Square className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-semibold text-lg">Stop Workspace</span>
                  </button>
                )}
                
                <button
                  onClick={(e) => handleActionPress(() => onSettings?.(id), e)}
                  className="
                    w-full flex items-center gap-4 p-4
                    text-text-primary hover:bg-surface-secondary
                    rounded-xl transition-colors
                  "
                >
                  <div className="icon-container-neutral">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-lg">Settings</span>
                </button>
                
                <button
                  onClick={(e) => handleActionPress(() => onDuplicate?.(id), e)}
                  className="
                    w-full flex items-center gap-4 p-4
                    text-text-primary hover:bg-surface-secondary
                    rounded-xl transition-colors
                  "
                >
                  <div className="icon-container-info">
                    <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-lg">Duplicate</span>
                </button>
                
                <button
                  onClick={(e) => handleActionPress(() => onDelete?.(id), e)}
                  className="
                    w-full flex items-center gap-4 p-4
                    text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                    rounded-xl transition-colors
                  "
                >
                  <div className="icon-container-error">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-semibold text-lg">Delete</span>
                </button>
              </div>
              
              {/* Cancel */}
              <button
                onClick={() => setShowActions(false)}
                className="btn-secondary w-full p-4 mt-4 text-lg"
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
