import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserPresence, WorkspaceCollaboration } from '../services/websocketService.js';
import { websocketService } from '../services/websocketService.js';
import { useAppStore } from '../stores/appStore.js';

export interface UseCollaborationOptions {
  workspaceId: string;
  sessionId?: string;
  enabled?: boolean;
}

export function useCollaboration({ workspaceId, sessionId, enabled = true }: UseCollaborationOptions) {
  const [collaboration, setCollaboration] = useState<WorkspaceCollaboration | null>(null);
  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const [isCollaborating, setIsCollaborating] = useState(false);
  
  const { user: currentUser } = useAppStore();
  const lastActivityRef = useRef(Date.now());
  const presenceUpdateTimerRef = useRef<NodeJS.Timeout>();
  const activityDetectionRef = useRef<() => void>();

  // Join workspace collaboration
  const joinCollaboration = useCallback(() => {
    if (!enabled || !currentUser || !websocketService.isConnected()) {
      return;
    }

    const userInfo = {
      userId: currentUser.id,
      username: currentUser.name,
      avatar: currentUser.avatar
    };

    websocketService.joinWorkspaceCollaboration(workspaceId, userInfo);
    setIsCollaborating(true);

    // Update presence as active initially
    websocketService.updateUserPresence(workspaceId, sessionId, 'active');
  }, [enabled, currentUser, workspaceId, sessionId]);

  // Leave workspace collaboration
  const leaveCollaboration = useCallback(() => {
    if (!enabled || !websocketService.isConnected()) {
      return;
    }

    websocketService.leaveWorkspaceCollaboration(workspaceId);
    setIsCollaborating(false);
    setCollaboration(null);
    setUserPresence(new Map());
  }, [enabled, workspaceId]);

  // Update user presence status
  const updatePresence = useCallback((status: 'active' | 'idle' | 'away') => {
    if (!enabled || !isCollaborating) {
      return;
    }

    websocketService.updateUserPresence(workspaceId, sessionId, status);
    lastActivityRef.current = Date.now();
  }, [enabled, isCollaborating, workspaceId, sessionId]);

  // Send cursor position for collaborative editing
  const sendCursorPosition = useCallback((cursor: { x: number; y: number; elementId?: string }) => {
    if (!enabled || !isCollaborating) {
      return;
    }

    websocketService.sendCursorPosition(workspaceId, cursor);
  }, [enabled, isCollaborating, workspaceId]);

  // Activity detection for automatic presence updates
  useEffect(() => {
    if (!enabled || !isCollaborating) {
      return;
    }

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      updatePresence('active');
    };

    // Track mouse movement, keyboard input, and clicks
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    activityDetectionRef.current = handleActivity;

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, isCollaborating, updatePresence]);

  // Automatic presence status updates based on activity
  useEffect(() => {
    if (!enabled || !isCollaborating) {
      return;
    }

    const checkPresenceStatus = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;

      // Idle after 2 minutes of inactivity
      if (timeSinceActivity > 2 * 60 * 1000) {
        updatePresence('idle');
      }
      // Away after 10 minutes of inactivity
      else if (timeSinceActivity > 10 * 60 * 1000) {
        updatePresence('away');
      }
    };

    // Check presence status every 30 seconds
    presenceUpdateTimerRef.current = setInterval(checkPresenceStatus, 30 * 1000);

    return () => {
      if (presenceUpdateTimerRef.current) {
        clearInterval(presenceUpdateTimerRef.current);
      }
    };
  }, [enabled, isCollaborating, updatePresence]);

  // Handle page visibility changes
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('active');
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, updatePresence]);

  // Set up WebSocket event handlers
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlers = {
      onUserPresenceUpdate: (presence: UserPresence) => {
        if (presence.workspaceId === workspaceId) {
          setUserPresence(prev => {
            const updated = new Map(prev);
            updated.set(presence.userId, presence);
            return updated;
          });
        }
      },

      onWorkspaceCollaboration: (collaborationData: WorkspaceCollaboration) => {
        if (collaborationData.workspaceId === workspaceId) {
          setCollaboration(collaborationData);
          
          // Update user presence map
          const presenceMap = new Map<string, UserPresence>();
          collaborationData.activeUsers.forEach(user => {
            presenceMap.set(user.userId, user);
          });
          setUserPresence(presenceMap);
        }
      },

      onConnected: () => {
        // Auto-join collaboration when WebSocket connects
        if (isCollaborating) {
          joinCollaboration();
        }
      },

      onDisconnected: () => {
        setIsCollaborating(false);
        setCollaboration(null);
        setUserPresence(new Map());
      }
    };

    websocketService.updateHandlers(handlers);

    // Auto-join if WebSocket is already connected
    if (websocketService.isConnected() && !isCollaborating) {
      joinCollaboration();
    }

    return () => {
      // Clean up handlers would require a more sophisticated handler management system
      // For now, we rely on component unmounting to stop collaboration
    };
  }, [enabled, workspaceId, isCollaborating, joinCollaboration]);

  // Auto-join collaboration when component mounts
  useEffect(() => {
    if (enabled && websocketService.isConnected() && !isCollaborating) {
      joinCollaboration();
    }
  }, [enabled, joinCollaboration, isCollaborating]);

  // Leave collaboration when component unmounts
  useEffect(() => {
    return () => {
      if (isCollaborating) {
        leaveCollaboration();
      }
    };
  }, [isCollaborating, leaveCollaboration]);

  return {
    collaboration,
    userPresence,
    isCollaborating,
    joinCollaboration,
    leaveCollaboration,
    updatePresence,
    sendCursorPosition,
    // Helper methods
    getActiveUsers: () => collaboration?.activeUsers || [],
    getTotalUsers: () => collaboration?.totalUsers || 0,
    getCurrentUserPresence: () => currentUser ? userPresence.get(currentUser.id) : undefined,
    getOtherUsers: () => collaboration?.activeUsers.filter(user => user.userId !== currentUser?.id) || []
  };
}

export default useCollaboration;